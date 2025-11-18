import { db } from '../db/client';
import { Project, CreateProjectInput, UpdateProjectInput, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

export class ProjectService {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    const slug = this.generateSlug(input.name);

    // Check if slug exists for this user
    const existing = await db.query(
      'SELECT id FROM projects WHERE owner_id = $1 AND slug = $2',
      [userId, slug]
    );

    if (existing.rows.length > 0) {
      throw new Error('Project with this name already exists');
    }

    const result = await db.query(
      `INSERT INTO projects (
        owner_id, name, slug, description, visibility,
        template_id, forked_from, tags, tech_stack
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        input.name,
        slug,
        input.description || null,
        input.visibility || 'public',
        input.template_id || null,
        input.forked_from || null,
        input.tags || [],
        input.tech_stack || [],
      ]
    );

    const project = result.rows[0];

    // Add owner as collaborator
    await db.query(
      `INSERT INTO project_collaborators (project_id, user_id, role, invitation_status)
       VALUES ($1, $2, 'owner', 'accepted')`,
      [project.id, userId]
    );

    logger.info({ projectId: project.id, userId }, 'Project created');

    return project;
  }

  async getProjectBySlug(ownerUsername: string, slug: string): Promise<Project | null> {
    const result = await db.query(
      `SELECT p.* FROM projects p
       JOIN users u ON p.owner_id = u.id
       WHERE u.username = $1 AND p.slug = $2`,
      [ownerUsername, slug]
    );

    return result.rows[0] || null;
  }

  async updateProject(
    ownerUsername: string,
    slug: string,
    userId: string,
    updates: UpdateProjectInput
  ): Promise<Project> {
    const project = await this.getProjectBySlug(ownerUsername, slug);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check permission
    const hasPermission = await this.checkPermission(project.id, userId, 'write');
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);

      if (updates.name !== project.name) {
        const newSlug = this.generateSlug(updates.name);
        fields.push(`slug = $${paramCount++}`);
        values.push(newSlug);
      }
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (updates.readme !== undefined) {
      fields.push(`readme = $${paramCount++}`);
      values.push(updates.readme);
    }

    if (updates.visibility) {
      fields.push(`visibility = $${paramCount++}`);
      values.push(updates.visibility);
    }

    if (updates.tags) {
      fields.push(`tags = $${paramCount++}`);
      values.push(updates.tags);
    }

    if (updates.tech_stack) {
      fields.push(`tech_stack = $${paramCount++}`);
      values.push(updates.tech_stack);
    }

    if (updates.skill_level) {
      fields.push(`skill_level = $${paramCount++}`);
      values.push(updates.skill_level);
    }

    if (updates.use_case) {
      fields.push(`use_case = $${paramCount++}`);
      values.push(updates.use_case);
    }

    if (fields.length === 0) {
      return project;
    }

    values.push(project.id);

    const result = await db.query(
      `UPDATE projects
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    logger.info({ projectId: project.id }, 'Project updated');

    return result.rows[0];
  }

  async deleteProject(ownerUsername: string, slug: string, userId: string): Promise<void> {
    const project = await this.getProjectBySlug(ownerUsername, slug);

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.owner_id !== userId) {
      throw new Error('Permission denied');
    }

    await db.query('DELETE FROM projects WHERE id = $1', [project.id]);

    logger.info({ projectId: project.id }, 'Project deleted');
  }

  async listProjects(filters: {
    page?: number;
    limit?: number;
    visibility?: string;
    tags?: string[];
    techStack?: string[];
  }): Promise<PaginatedResponse<Project>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = ['visibility = $1'];
    let params: any[] = [filters.visibility || 'public'];
    let paramCount = 2;

    if (filters.tags && filters.tags.length > 0) {
      whereConditions.push(`tags && $${paramCount++}`);
      params.push(filters.tags);
    }

    if (filters.techStack && filters.techStack.length > 0) {
      whereConditions.push(`tech_stack && $${paramCount++}`);
      params.push(filters.techStack);
    }

    const whereClause = whereConditions.join(' AND ');

    const countResult = await db.query(
      `SELECT COUNT(*) FROM projects WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);

    const result = await db.query(
      `SELECT * FROM projects
       WHERE ${whereClause}
       ORDER BY updated_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    return {
      items: result.rows,
      total,
      page,
      limit,
      hasMore: offset + result.rows.length < total,
    };
  }

  async starProject(ownerUsername: string, slug: string, userId: string): Promise<void> {
    const project = await this.getProjectBySlug(ownerUsername, slug);

    if (!project) {
      throw new Error('Project not found');
    }

    await db.query(
      `INSERT INTO stars (user_id, project_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, project.id]
    );

    logger.info({ projectId: project.id, userId }, 'Project starred');
  }

  async unstarProject(ownerUsername: string, slug: string, userId: string): Promise<void> {
    const project = await this.getProjectBySlug(ownerUsername, slug);

    if (!project) {
      throw new Error('Project not found');
    }

    await db.query(
      'DELETE FROM stars WHERE user_id = $1 AND project_id = $2',
      [userId, project.id]
    );

    logger.info({ projectId: project.id, userId }, 'Project unstarred');
  }

  async forkProject(ownerUsername: string, slug: string, userId: string): Promise<Project> {
    const sourceProject = await this.getProjectBySlug(ownerUsername, slug);

    if (!sourceProject) {
      throw new Error('Project not found');
    }

    const newSlug = `${slug}-fork-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO projects (
        owner_id, name, slug, description, visibility,
        forked_from, tags, tech_stack
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId,
        `${sourceProject.name} (Fork)`,
        newSlug,
        sourceProject.description,
        'public',
        sourceProject.id,
        sourceProject.tags,
        sourceProject.tech_stack,
      ]
    );

    const forkedProject = result.rows[0];

    // Increment fork count
    await db.query(
      'UPDATE projects SET fork_count = fork_count + 1 WHERE id = $1',
      [sourceProject.id]
    );

    // TODO: Copy files from source project

    logger.info({
      sourceProjectId: sourceProject.id,
      forkedProjectId: forkedProject.id,
      userId
    }, 'Project forked');

    return forkedProject;
  }

  async incrementViewCount(projectId: string): Promise<void> {
    await db.query(
      'UPDATE projects SET view_count = view_count + 1 WHERE id = $1',
      [projectId]
    );
  }

  private async checkPermission(
    projectId: string,
    userId: string,
    permission: 'read' | 'write' | 'deploy' | 'admin'
  ): Promise<boolean> {
    const result = await db.query(
      `SELECT permissions, role FROM project_collaborators
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const { permissions, role } = result.rows[0];

    if (role === 'owner') {
      return true;
    }

    return permissions[permission] === true;
  }
}
