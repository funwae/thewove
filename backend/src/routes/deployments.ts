import { FastifyPluginAsync } from 'fastify';
import { DeploymentService } from '../services/deployment.service';
import { z } from 'zod';

const deploymentService = new DeploymentService();

const createDeploymentSchema = z.object({
  projectId: z.string().uuid(),
  deploymentType: z.enum(['static', 'worker', 'container', 'function']).optional(),
  environment: z.record(z.string()).optional(),
});

export const deploymentRoutes: FastifyPluginAsync = async (server) => {
  // Create deployment
  server.post('/', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const body = createDeploymentSchema.parse(request.body);
    const userId = request.user.id;

    const deployment = await deploymentService.createDeployment({
      ...body,
      userId,
    });

    reply.status(201).send({
      success: true,
      data: deployment,
    });
  });

  // Get deployment status
  server.get('/:id', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const deployment = await deploymentService.getDeployment(id);

    if (!deployment) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'DEPLOYMENT_NOT_FOUND',
          message: 'Deployment not found',
        },
      });
    }

    reply.send({
      success: true,
      data: deployment,
    });
  });

  // List project deployments
  server.get('/projects/:projectId', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { page = 1, limit = 20 } = request.query as any;

    const result = await deploymentService.listProjectDeployments(projectId, page, limit);

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

  // Get deployment logs
  server.get('/:id/logs', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const logs = await deploymentService.getDeploymentLogs(id);

    reply.send({
      success: true,
      data: { logs },
    });
  });

  // Cancel deployment
  server.post('/:id/cancel', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await deploymentService.cancelDeployment(id);

    reply.send({
      success: true,
      message: 'Deployment cancelled',
    });
  });
};
