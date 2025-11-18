import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { db } from '../db/client';
import { config } from '../config';
import { ProjectFile } from '../types';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export class FileService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async listProjectFiles(projectId: string, userId: string): Promise<ProjectFile[]> {
    // Check permission
    await this.checkProjectAccess(projectId, userId);

    const result = await db.query(
      `SELECT * FROM project_files
       WHERE project_id = $1
       ORDER BY file_path`,
      [projectId]
    );

    return result.rows;
  }

  async getFileContent(projectId: string, filePath: string, userId: string): Promise<string> {
    await this.checkProjectAccess(projectId, userId);

    const fileResult = await db.query(
      `SELECT * FROM project_files
       WHERE project_id = $1 AND file_path = $2`,
      [projectId, filePath]
    );

    if (fileResult.rows.length === 0) {
      throw new Error('File not found');
    }

    const file = fileResult.rows[0];

    // Return cached content if available
    if (file.cached_content) {
      return file.cached_content;
    }

    // Otherwise, fetch from S3
    const command = new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: file.s3_key,
    });

    try {
      const response = await this.s3Client.send(command);
      const content = await response.Body?.transformToString() || '';

      // Cache small files
      if (content.length < 10000) {
        await db.query(
          'UPDATE project_files SET cached_content = $1 WHERE id = $2',
          [content, file.id]
        );
      }

      return content;
    } catch (error) {
      logger.error({ error, fileId: file.id }, 'Failed to fetch file from S3');
      throw new Error('Failed to fetch file content');
    }
  }

  async saveFile(
    projectId: string,
    filePath: string,
    content: string,
    userId: string
  ): Promise<ProjectFile> {
    await this.checkProjectAccess(projectId, userId, 'write');

    // Generate S3 key
    const s3Key = `projects/${projectId}/${filePath}`;

    // Calculate hash
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: s3Key,
      Body: content,
      ContentType: this.getMimeType(filePath),
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      logger.error({ error, projectId, filePath }, 'Failed to upload file to S3');
      throw new Error('Failed to save file');
    }

    // Check if file exists
    const existingFile = await db.query(
      'SELECT id, version_hash FROM project_files WHERE project_id = $1 AND file_path = $2',
      [projectId, filePath]
    );

    const sizeBytes = Buffer.byteLength(content, 'utf-8');
    const cachedContent = sizeBytes < 10000 ? content : null;

    let result;

    if (existingFile.rows.length > 0) {
      // Update existing file
      const fileId = existingFile.rows[0].id;
      const parentVersionHash = existingFile.rows[0].version_hash;

      result = await db.query(
        `UPDATE project_files
         SET s3_key = $1, size_bytes = $2, version_hash = $3,
             parent_version_hash = $4, cached_content = $5,
             updated_at = NOW(), last_modified_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [s3Key, sizeBytes, hash, parentVersionHash, cachedContent, fileId]
      );
    } else {
      // Create new file
      result = await db.query(
        `INSERT INTO project_files (
          project_id, file_path, s3_key, size_bytes,
          mime_type, version_hash, cached_content
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [projectId, filePath, s3Key, sizeBytes, this.getMimeType(filePath), hash, cachedContent]
      );
    }

    // Update project activity
    await db.query(
      'UPDATE projects SET last_activity_at = NOW() WHERE id = $1',
      [projectId]
    );

    logger.info({ projectId, filePath, size: sizeBytes }, 'File saved');

    return result.rows[0];
  }

  async deleteFile(projectId: string, filePath: string, userId: string): Promise<void> {
    await this.checkProjectAccess(projectId, userId, 'write');

    const fileResult = await db.query(
      'SELECT s3_key FROM project_files WHERE project_id = $1 AND file_path = $2',
      [projectId, filePath]
    );

    if (fileResult.rows.length === 0) {
      throw new Error('File not found');
    }

    const s3Key = fileResult.rows[0].s3_key;

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: s3Key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      logger.error({ error, s3Key }, 'Failed to delete file from S3');
    }

    // Delete from database
    await db.query(
      'DELETE FROM project_files WHERE project_id = $1 AND file_path = $2',
      [projectId, filePath]
    );

    logger.info({ projectId, filePath }, 'File deleted');
  }

  private async checkProjectAccess(
    projectId: string,
    userId: string,
    permission: 'read' | 'write' = 'read'
  ): Promise<void> {
    const result = await db.query(
      `SELECT p.visibility, pc.role, pc.permissions
       FROM projects p
       LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = $2
       WHERE p.id = $1`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    const { visibility, role, permissions } = result.rows[0];

    // Public projects allow read access
    if (permission === 'read' && visibility === 'public') {
      return;
    }

    // Check collaborator permissions
    if (!role) {
      throw new Error('Permission denied');
    }

    if (role === 'owner') {
      return;
    }

    if (!permissions || !permissions[permission]) {
      throw new Error('Permission denied');
    }
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'js': 'application/javascript',
      'ts': 'application/typescript',
      'jsx': 'application/javascript',
      'tsx': 'application/typescript',
      'json': 'application/json',
      'html': 'text/html',
      'css': 'text/css',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'py': 'text/x-python',
      'java': 'text/x-java',
      'cpp': 'text/x-c++src',
      'c': 'text/x-csrc',
      'go': 'text/x-go',
      'rs': 'text/x-rust',
    };

    return mimeTypes[ext || ''] || 'text/plain';
  }
}
