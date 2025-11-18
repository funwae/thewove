import { db } from '../db/client';
import { Deployment, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

export class DeploymentService {
  async createDeployment(input: {
    projectId: string;
    userId: string;
    deploymentType?: 'static' | 'worker' | 'container' | 'function';
    environment?: Record<string, string>;
  }): Promise<Deployment> {
    const { projectId, userId, deploymentType, environment } = input;

    // Verify project access
    const project = await db.query(
      `SELECT p.*, pc.role
       FROM projects p
       LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = $2
       WHERE p.id = $1`,
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found');
    }

    const { role } = project.rows[0];

    if (!role || (role !== 'owner' && role !== 'editor')) {
      throw new Error('Permission denied');
    }

    // Detect deployment type if not specified
    const type = deploymentType || await this.detectDeploymentType(projectId);

    // Create deployment record
    const result = await db.query(
      `INSERT INTO deployments (
        project_id, deployed_by, deployment_type, status, environment
      )
      VALUES ($1, $2, $3, 'pending', $4)
      RETURNING *`,
      [projectId, userId, type, JSON.stringify(environment || {})]
    );

    const deployment = result.rows[0];

    // Queue deployment job (in a real implementation)
    this.queueDeployment(deployment.id, projectId, type);

    logger.info({ deploymentId: deployment.id, projectId, type }, 'Deployment created');

    return deployment;
  }

  async getDeployment(deploymentId: string): Promise<Deployment | null> {
    const result = await db.query(
      'SELECT * FROM deployments WHERE id = $1',
      [deploymentId]
    );

    return result.rows[0] || null;
  }

  async listProjectDeployments(
    projectId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Deployment>> {
    const offset = (page - 1) * limit;

    const countResult = await db.query(
      'SELECT COUNT(*) FROM deployments WHERE project_id = $1',
      [projectId]
    );

    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT * FROM deployments
       WHERE project_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [projectId, limit, offset]
    );

    return {
      items: result.rows,
      total,
      page,
      limit,
      hasMore: offset + result.rows.length < total,
    };
  }

  async getDeploymentLogs(deploymentId: string): Promise<string> {
    const result = await db.query(
      'SELECT build_logs FROM deployments WHERE id = $1',
      [deploymentId]
    );

    if (result.rows.length === 0) {
      throw new Error('Deployment not found');
    }

    return result.rows[0].build_logs || 'No logs available';
  }

  async cancelDeployment(deploymentId: string): Promise<void> {
    await db.query(
      `UPDATE deployments
       SET status = 'failed', error_message = 'Deployment cancelled by user'
       WHERE id = $1 AND status IN ('pending', 'building')`,
      [deploymentId]
    );

    logger.info({ deploymentId }, 'Deployment cancelled');
  }

  private async detectDeploymentType(projectId: string): Promise<'static' | 'worker' | 'container' | 'function'> {
    // Check for package.json or specific frameworks
    const files = await db.query(
      `SELECT file_path FROM project_files
       WHERE project_id = $1 AND file_path IN ('package.json', 'requirements.txt', 'Dockerfile')`,
      [projectId]
    );

    const fileNames = files.rows.map(f => f.file_path);

    if (fileNames.includes('Dockerfile')) {
      return 'container';
    }

    if (fileNames.includes('package.json')) {
      // Could be static or worker - default to static
      return 'static';
    }

    if (fileNames.includes('requirements.txt')) {
      return 'function';
    }

    return 'static';
  }

  private async queueDeployment(deploymentId: string, projectId: string, type: string): Promise<void> {
    // In a real implementation, this would add to BullMQ queue
    // For now, simulate deployment
    setTimeout(async () => {
      try {
        await db.query(
          `UPDATE deployments
           SET status = 'building', started_at = NOW()
           WHERE id = $1`,
          [deploymentId]
        );

        // Simulate build time
        await new Promise(resolve => setTimeout(resolve, 3000));

        const deploymentUrl = `https://${projectId}.thewove.app`;

        await db.query(
          `UPDATE deployments
           SET status = 'success',
               deployment_url = $2,
               completed_at = NOW(),
               build_time_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
           WHERE id = $1`,
          [deploymentId, deploymentUrl]
        );

        // Update project
        await db.query(
          `UPDATE projects
           SET deployment_url = $1,
               deployment_status = 'deployed',
               last_deployed_at = NOW()
           WHERE id = $2`,
          [deploymentUrl, projectId]
        );

        logger.info({ deploymentId, deploymentUrl }, 'Deployment completed');
      } catch (error) {
        logger.error({ error, deploymentId }, 'Deployment failed');

        await db.query(
          `UPDATE deployments
           SET status = 'failed', error_message = $2, completed_at = NOW()
           WHERE id = $1`,
          [deploymentId, (error as Error).message]
        );
      }
    }, 100);
  }
}
