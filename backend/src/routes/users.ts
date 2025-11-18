import { FastifyPluginAsync } from 'fastify';
import { UserService } from '../services/user.service';
import { z } from 'zod';

const userService = new UserService();

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  preferences: z.record(z.any()).optional(),
});

export const userRoutes: FastifyPluginAsync = async (server) => {
  // Get user by username
  server.get('/:username', async (request, reply) => {
    const { username } = request.params as { username: string };

    const user = await userService.getUserByUsername(username);

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    reply.send({
      success: true,
      data: user,
    });
  });

  // Update current user
  server.patch('/me', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const body = updateUserSchema.parse(request.body);
    const userId = request.user.id;

    const user = await userService.updateUser(userId, body);

    reply.send({
      success: true,
      data: user,
    });
  });

  // Get user projects
  server.get('/:username/projects', async (request, reply) => {
    const { username } = request.params as { username: string };
    const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number };

    const result = await userService.getUserProjects(username, page, limit);

    reply.send({
      success: true,
      data: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
      },
    });
  });

  // Get user stars
  server.get('/:username/stars', async (request, reply) => {
    const { username } = request.params as { username: string };
    const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number };

    const result = await userService.getUserStarredProjects(username, page, limit);

    reply.send({
      success: true,
      data: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
      },
    });
  });
};
