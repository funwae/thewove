import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { config } from '../config';
import { User, CreateUserInput } from '../types';
import { logger } from '../utils/logger';

export class AuthService {
  async register(input: CreateUserInput & { password: string }) {
    const { email, username, password, displayName } = input;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, username, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, display_name, tier, created_at`,
      [email, username, displayName || username]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Store hashed password separately (in production, use a separate auth table)
    await db.query(
      'UPDATE users SET preferences = jsonb_set(COALESCE(preferences, $1::jsonb), $2, $3) WHERE id = $4',
      ['{}', '{password_hash}', JSON.stringify(hashedPassword), user.id]
    );

    logger.info({ userId: user.id }, 'User registered');

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Get user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Check if banned
    if (user.is_banned) {
      throw new Error('Account is banned');
    }

    // Verify password
    const passwordHash = user.preferences?.password_hash;
    if (!passwordHash) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    logger.info({ userId: user.id }, 'User logged in');

    // Remove sensitive data
    delete user.preferences?.password_hash;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async getCurrentUser(userId: string): Promise<User> {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    delete user.preferences?.password_hash;

    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.auth.jwtSecret) as { userId: string };

      const user = await this.getCurrentUser(decoded.userId);

      const accessToken = this.generateAccessToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        user,
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtRefreshExpiresIn,
    });
  }
}
