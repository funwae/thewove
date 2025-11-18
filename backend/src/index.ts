import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { config } from './config';
import { logger } from './utils/logger';
import { db } from './db/client';
import { authMiddleware } from './middleware/auth';

// Routes
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { projectRoutes } from './routes/projects';
import { fileRoutes } from './routes/files';
import { aiRoutes } from './routes/ai';
import { deploymentRoutes } from './routes/deployments';
import { collaborationRoutes } from './routes/collaboration';

const server = Fastify({
  logger: logger,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
});

async function start() {
  try {
    // Register plugins
    await server.register(cors, {
      origin: config.cors.origin,
      credentials: true,
    });

    await server.register(jwt, {
      secret: config.auth.jwtSecret,
    });

    await server.register(multipart, {
      limits: {
        fileSize: config.upload.maxFileSize,
      },
    });

    await server.register(rateLimit, {
      max: config.rateLimit.max,
      timeWindow: config.rateLimit.timeWindow,
    });

    await server.register(websocket);

    // Decorate server with authenticate method
    server.decorate('authenticate', authMiddleware);

    // Register routes
    await server.register(healthRoutes, { prefix: '/api/health' });
    await server.register(authRoutes, { prefix: '/api/auth' });
    await server.register(userRoutes, { prefix: '/api/users' });
    await server.register(projectRoutes, { prefix: '/api/projects' });
    await server.register(fileRoutes, { prefix: '/api/files' });
    await server.register(aiRoutes, { prefix: '/api/ai' });
    await server.register(deploymentRoutes, { prefix: '/api/deployments' });
    await server.register(collaborationRoutes, { prefix: '/api/collaboration' });

    // Global error handler
    server.setErrorHandler((error, request, reply) => {
      logger.error({ error, requestId: request.id }, 'Request error');

      reply.status(error.statusCode || 500).send({
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'An unexpected error occurred',
        },
      });
    });

    // Check database connection
    const dbHealthy = await db.healthCheck();
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }

    // Start server
    await server.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    logger.info(`🚀 Server running on port ${config.port}`);
    logger.info(`📝 API docs: http://localhost:${config.port}/api`);
    logger.info(`🔍 Environment: ${config.env}`);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await server.close();
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await server.close();
  await db.close();
  process.exit(0);
});

start();
