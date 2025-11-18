import { db } from '../db/client';
import { User, PaginatedResponse, Project } from '../types';

export class UserService {
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.query(
      `SELECT id, username, display_name, avatar_url, bio, tier, created_at
       FROM users WHERE username = $1`,
      [username]
    );

    return result.rows[0] || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.username) {
      fields.push(`username = $${paramCount++}`);
      values.push(updates.username);
    }

    if (updates.display_name !== undefined) {
      fields.push(`display_name = $${paramCount++}`);
      values.push(updates.display_name);
    }

    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramCount++}`);
      values.push(updates.bio);
    }

    if (updates.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(updates.avatar_url);
    }

    if (updates.preferences !== undefined) {
      fields.push(`preferences = $${paramCount++}`);
      values.push(JSON.stringify(updates.preferences));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const result = await db.query(
      `UPDATE users
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    delete user.preferences?.password_hash;

    return user;
  }

  async getUserProjects(
    username: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Project>> {
    const offset = (page - 1) * limit;

    const countResult = await db.query(
      `SELECT COUNT(*) FROM projects p
       JOIN users u ON p.owner_id = u.id
       WHERE u.username = $1 AND p.visibility = 'public'`,
      [username]
    );

    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT p.* FROM projects p
       JOIN users u ON p.owner_id = u.id
       WHERE u.username = $1 AND p.visibility = 'public'
       ORDER BY p.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [username, limit, offset]
    );

    return {
      items: result.rows,
      total,
      page,
      limit,
      hasMore: offset + result.rows.length < total,
    };
  }

  async getUserStarredProjects(
    username: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Project>> {
    const offset = (page - 1) * limit;

    const countResult = await db.query(
      `SELECT COUNT(*) FROM stars s
       JOIN users u ON s.user_id = u.id
       JOIN projects p ON s.project_id = p.id
       WHERE u.username = $1 AND p.visibility = 'public'`,
      [username]
    );

    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT p.* FROM projects p
       JOIN stars s ON p.id = s.project_id
       JOIN users u ON s.user_id = u.id
       WHERE u.username = $1 AND p.visibility = 'public'
       ORDER BY s.created_at DESC
       LIMIT $2 OFFSET $3`,
      [username, limit, offset]
    );

    return {
      items: result.rows,
      total,
      page,
      limit,
      hasMore: offset + result.rows.length < total,
    };
  }
}
