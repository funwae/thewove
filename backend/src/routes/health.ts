import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';

export const healthRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', async (request, reply) => {
    const dbHealthy = await db.healthCheck();

    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
    };

    reply.status(dbHealthy ? 200 : 503).send(health);
  });

  server.get('/ready', async (request, reply) => {
    const dbHealthy = await db.healthCheck();

    if (dbHealthy) {
      reply.send({ ready: true });
    } else {
      reply.status(503).send({ ready: false });
    }
  });

  server.get('/live', async (request, reply) => {
    reply.send({ alive: true });
  });
};
