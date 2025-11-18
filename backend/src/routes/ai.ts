import { FastifyPluginAsync } from 'fastify';
import { AIService } from '../services/ai.service';
import { z } from 'zod';

const aiService = new AIService();

const chatSchema = z.object({
  message: z.string(),
  conversationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  contextFiles: z.array(z.string()).optional(),
  model: z.string().optional(),
});

export const aiRoutes: FastifyPluginAsync = async (server) => {
  // Send message to AI
  server.post('/chat', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const body = chatSchema.parse(request.body);
    const userId = request.user.id;

    const response = await aiService.chat({
      userId,
      ...body,
    });

    reply.send({
      success: true,
      data: response,
    });
  });

  // Get conversation history
  server.get('/conversations/:id', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    const conversation = await aiService.getConversation(id, userId);

    reply.send({
      success: true,
      data: conversation,
    });
  });

  // List user conversations
  server.get('/conversations', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const userId = request.user.id;
    const { projectId, page = 1, limit = 20 } = request.query as any;

    const result = await aiService.listConversations(userId, projectId, page, limit);

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

  // Delete conversation
  server.delete('/conversations/:id', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    await aiService.deleteConversation(id, userId);

    reply.send({
      success: true,
      message: 'Conversation deleted',
    });
  });
};
