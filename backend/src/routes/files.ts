import { FastifyPluginAsync } from 'fastify';
import { FileService } from '../services/file.service';

const fileService = new FileService();

export const fileRoutes: FastifyPluginAsync = async (server) => {
  // List project files
  server.get('/projects/:projectId', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const userId = request.user.id;

    const files = await fileService.listProjectFiles(projectId, userId);

    reply.send({
      success: true,
      data: files,
    });
  });

  // Get file content
  server.get('/projects/:projectId/files/*', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const filePath = (request.params as any)['*'];
    const userId = request.user.id;

    const content = await fileService.getFileContent(projectId, filePath, userId);

    reply.send({
      success: true,
      data: {
        path: filePath,
        content,
      },
    });
  });

  // Upload/update file
  server.put('/projects/:projectId/files/*', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const filePath = (request.params as any)['*'];
    const { content } = request.body as { content: string };
    const userId = request.user.id;

    const file = await fileService.saveFile(projectId, filePath, content, userId);

    reply.send({
      success: true,
      data: file,
    });
  });

  // Delete file
  server.delete('/projects/:projectId/files/*', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const filePath = (request.params as any)['*'];
    const userId = request.user.id;

    await fileService.deleteFile(projectId, filePath, userId);

    reply.send({
      success: true,
      message: 'File deleted successfully',
    });
  });
};
