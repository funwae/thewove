import { FastifyPluginAsync } from 'fastify';
import { ProjectService } from '../services/project.service';
import { z } from 'zod';

const projectService = new ProjectService();

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  visibility: z.enum(['public', 'unlisted', 'private']).optional(),
  templateId: z.string().uuid().optional(),
  forkedFrom: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  readme: z.string().optional(),
  visibility: z.enum(['public', 'unlisted', 'private']).optional(),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  useCase: z.string().optional(),
});

export const projectRoutes: FastifyPluginAsync = async (server) => {
  // List projects
  server.get('/', async (request, reply) => {
    const {
      page = 1,
      limit = 20,
      visibility = 'public',
      tags,
      techStack,
    } = request.query as any;

    const result = await projectService.listProjects({
      page,
      limit,
      visibility,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
      techStack: techStack ? (Array.isArray(techStack) ? techStack : [techStack]) : undefined,
    });

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

  // Create project
  server.post('/', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const body = createProjectSchema.parse(request.body);
    const userId = request.user.id;

    const project = await projectService.createProject(userId, body);

    reply.status(201).send({
      success: true,
      data: project,
    });
  });

  // Get project by owner and slug
  server.get('/:owner/:slug', async (request, reply) => {
    const { owner, slug } = request.params as { owner: string; slug: string };

    const project = await projectService.getProjectBySlug(owner, slug);

    if (!project) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }

    // Track view
    await projectService.incrementViewCount(project.id);

    reply.send({
      success: true,
      data: project,
    });
  });

  // Update project
  server.patch('/:owner/:slug', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { owner, slug } = request.params as { owner: string; slug: string };
    const body = updateProjectSchema.parse(request.body);
    const userId = request.user.id;

    const project = await projectService.updateProject(owner, slug, userId, body);

    reply.send({
      success: true,
      data: project,
    });
  });

  // Delete project
  server.delete('/:owner/:slug', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { owner, slug } = request.params as { owner: string; slug: string };
    const userId = request.user.id;

    await projectService.deleteProject(owner, slug, userId);

    reply.send({
      success: true,
      message: 'Project deleted successfully',
    });
  });

  // Star project
  server.post('/:owner/:slug/star', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { owner, slug } = request.params as { owner: string; slug: string };
    const userId = request.user.id;

    await projectService.starProject(owner, slug, userId);

    reply.send({
      success: true,
      message: 'Project starred',
    });
  });

  // Unstar project
  server.delete('/:owner/:slug/star', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { owner, slug } = request.params as { owner: string; slug: string };
    const userId = request.user.id;

    await projectService.unstarProject(owner, slug, userId);

    reply.send({
      success: true,
      message: 'Project unstarred',
    });
  });

  // Fork project
  server.post('/:owner/:slug/fork', {
    onRequest: [server.authenticate],
  }, async (request, reply) => {
    const { owner, slug } = request.params as { owner: string; slug: string };
    const userId = request.user.id;

    const forkedProject = await projectService.forkProject(owner, slug, userId);

    reply.status(201).send({
      success: true,
      data: forkedProject,
    });
  });
};
