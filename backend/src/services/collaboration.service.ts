import { WebSocket } from 'ws';
import * as Y from 'yjs';
import { db } from '../db/client';
import { Collaborator } from '../types';
import { logger } from '../utils/logger';

export class CollaborationService {
  private rooms: Map<string, Set<WebSocket>> = new Map();
  private yDocs: Map<string, Y.Doc> = new Map();

  async handleConnection(connection: any, projectId: string, request: any): Promise<void> {
    const socket = connection.socket;

    // TODO: Authenticate user from request

    // Get or create room
    if (!this.rooms.has(projectId)) {
      this.rooms.set(projectId, new Set());
    }

    const room = this.rooms.get(projectId)!;
    room.add(socket);

    // Get or create Yjs document
    if (!this.yDocs.has(projectId)) {
      this.yDocs.set(projectId, new Y.Doc());
    }

    const doc = this.yDocs.get(projectId)!;

    logger.info({ projectId, roomSize: room.size }, 'User joined collaboration session');

    // Handle messages
    socket.on('message', (data: Buffer) => {
      // Broadcast to other users in the room
      room.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });

    // Handle disconnect
    socket.on('close', () => {
      room.delete(socket);

      logger.info({ projectId, roomSize: room.size }, 'User left collaboration session');

      // Clean up empty rooms
      if (room.size === 0) {
        this.rooms.delete(projectId);
        this.yDocs.delete(projectId);
        logger.info({ projectId }, 'Collaboration room closed');
      }
    });

    socket.on('error', (error: Error) => {
      logger.error({ error, projectId }, 'WebSocket error');
    });
  }

  async getActiveCollaborators(projectId: string): Promise<any[]> {
    const room = this.rooms.get(projectId);

    return [
      {
        count: room?.size || 0,
        // In a real implementation, would return actual user data
      },
    ];
  }

  async inviteCollaborator(
    projectId: string,
    username: string,
    role: string,
    invitedByUserId: string
  ): Promise<Collaborator> {
    // Verify inviter has permission
    const inviterCheck = await db.query(
      `SELECT role FROM project_collaborators
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, invitedByUserId]
    );

    if (inviterCheck.rows.length === 0 || inviterCheck.rows[0].role === 'viewer') {
      throw new Error('Permission denied');
    }

    // Get user ID from username
    const userResult = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userId = userResult.rows[0].id;

    // Check if already a collaborator
    const existing = await db.query(
      'SELECT id FROM project_collaborators WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (existing.rows.length > 0) {
      throw new Error('User is already a collaborator');
    }

    // Set permissions based on role
    const permissions = {
      owner: { read: true, write: true, deploy: true, admin: true },
      editor: { read: true, write: true, deploy: true, admin: false },
      viewer: { read: true, write: false, deploy: false, admin: false },
    }[role] || { read: true, write: false, deploy: false, admin: false };

    // Create collaborator
    const result = await db.query(
      `INSERT INTO project_collaborators (
        project_id, user_id, role, permissions, invited_by, invitation_status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *`,
      [projectId, userId, role, JSON.stringify(permissions), invitedByUserId]
    );

    // Update collaborator count
    await db.query(
      'UPDATE projects SET collaborator_count = collaborator_count + 1 WHERE id = $1',
      [projectId]
    );

    logger.info({ projectId, userId, role }, 'Collaborator invited');

    return result.rows[0];
  }

  async removeCollaborator(
    projectId: string,
    collaboratorId: string,
    userId: string
  ): Promise<void> {
    // Verify permission
    const userCheck = await db.query(
      `SELECT role FROM project_collaborators
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role === 'viewer') {
      throw new Error('Permission denied');
    }

    // Cannot remove owner
    const collaboratorCheck = await db.query(
      'SELECT role FROM project_collaborators WHERE id = $1',
      [collaboratorId]
    );

    if (collaboratorCheck.rows.length > 0 && collaboratorCheck.rows[0].role === 'owner') {
      throw new Error('Cannot remove project owner');
    }

    await db.query(
      'DELETE FROM project_collaborators WHERE id = $1 AND project_id = $2',
      [collaboratorId, projectId]
    );

    // Update collaborator count
    await db.query(
      'UPDATE projects SET collaborator_count = collaborator_count - 1 WHERE id = $1',
      [projectId]
    );

    logger.info({ projectId, collaboratorId }, 'Collaborator removed');
  }

  async updateCollaboratorRole(
    projectId: string,
    collaboratorId: string,
    role: string,
    userId: string
  ): Promise<Collaborator> {
    // Verify permission
    const userCheck = await db.query(
      `SELECT role FROM project_collaborators
       WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'owner') {
      throw new Error('Only project owner can update roles');
    }

    const permissions = {
      owner: { read: true, write: true, deploy: true, admin: true },
      editor: { read: true, write: true, deploy: true, admin: false },
      viewer: { read: true, write: false, deploy: false, admin: false },
    }[role] || { read: true, write: false, deploy: false, admin: false };

    const result = await db.query(
      `UPDATE project_collaborators
       SET role = $1, permissions = $2
       WHERE id = $3 AND project_id = $4
       RETURNING *`,
      [role, JSON.stringify(permissions), collaboratorId, projectId]
    );

    if (result.rows.length === 0) {
      throw new Error('Collaborator not found');
    }

    logger.info({ projectId, collaboratorId, role }, 'Collaborator role updated');

    return result.rows[0];
  }
}
