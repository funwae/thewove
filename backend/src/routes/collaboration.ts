import { FastifyPluginAsync } from 'fastify';
import { CollaborationService } from '../services/collaboration.service';

const collaborationService = new CollaborationService();

export const collaborationRoutes: FastifyPluginAsync = async (server) => {
  // WebSocket endpoint for real-time collaboration
  server.get('/ws/:projectId', { websocket: true }, async (connection, request) => {
    const { projectId } = request.params as { projectId: string };

    // Handle WebSocket connection for Yjs collaboration
    await collaborationService.handleConnection(connection, projectId, request);
  });

  // Get active collaborators
  server.get('/projects/:projectId/collaborators/active', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const collaborators = await collaborationService.getActiveCollaborators(projectId);

    reply.send({
      success: true,
      data: collaborators,
    });
  });

  // Invite collaborator
  server.post('/projects/:projectId/collaborators', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { username, role } = request.body as { username: string; role: string };
    const userId = request.user.id;

    const collaborator = await collaborationService.inviteCollaborator(
      projectId,
      username,
      role,
      userId
    );

    reply.status(201).send({
      success: true,
      data: collaborator,
    });
  });

  // Remove collaborator
  server.delete('/projects/:projectId/collaborators/:collaboratorId', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId, collaboratorId } = request.params as {
      projectId: string;
      collaboratorId: string;
    };
    const userId = request.user.id;

    await collaborationService.removeCollaborator(projectId, collaboratorId, userId);

    reply.send({
      success: true,
      message: 'Collaborator removed',
    });
  });

  // Update collaborator role
  server.patch('/projects/:projectId/collaborators/:collaboratorId', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId, collaboratorId } = request.params as {
      projectId: string;
      collaboratorId: string;
    };
    const { role } = request.body as { role: string };
    const userId = request.user.id;

    const collaborator = await collaborationService.updateCollaboratorRole(
      projectId,
      collaboratorId,
      role,
      userId
    );

    reply.send({
      success: true,
      data: collaborator,
    });
  });
};
