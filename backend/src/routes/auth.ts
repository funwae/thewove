import { FastifyPluginAsync } from 'fastify';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

const authService = new AuthService();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes: FastifyPluginAsync = async (server) => {
  // Register new user
  server.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const result = await authService.register(body);

    reply.send({
      success: true,
      data: result,
    });
  });

  // Login
  server.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const result = await authService.login(body.email, body.password);

    reply.send({
      success: true,
      data: result,
    });
  });

  // Get current user
  server.get('/me', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const user = await authService.getCurrentUser(request.user.id);

    reply.send({
      success: true,
      data: user,
    });
  });

  // Refresh token
  server.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };

    const result = await authService.refreshToken(refreshToken);

    reply.send({
      success: true,
      data: result,
    });
  });

  // Logout
  server.post('/logout', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    reply.send({
      success: true,
      message: 'Logged out successfully',
    });
  });
};
