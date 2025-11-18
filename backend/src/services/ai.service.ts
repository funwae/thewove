import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db/client';
import { config } from '../config';
import { AIConversation, AIMessage, AIRequest, AIResponse, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

export class AIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.ai.anthropicApiKey,
    });
  }

  async chat(request: AIRequest & { userId: string }): Promise<AIResponse> {
    const { userId, message, conversationId, projectId, contextFiles, model } = request;

    // Check AI usage limits
    await this.checkUsageLimit(userId);

    // Get or create conversation
    let conversation: AIConversation;
    if (conversationId) {
      conversation = await this.getConversationById(conversationId, userId);
    } else {
      conversation = await this.createConversation(userId, projectId);
    }

    // Build context
    const context = await this.buildContext(conversation.id, contextFiles);

    // Call AI
    const aiResponse = await this.callAI(message, context, model || config.ai.defaultModel);

    // Save messages
    await this.saveMessage(conversation.id, 'user', message);
    await this.saveMessage(conversation.id, 'assistant', aiResponse.content, aiResponse.tokensUsed);

    // Update conversation stats
    await this.updateConversationStats(conversation.id, aiResponse.tokensUsed);

    // Update user usage
    await this.updateUserUsage(userId, aiResponse.tokensUsed);

    logger.info({
      conversationId: conversation.id,
      tokensUsed: aiResponse.tokensUsed,
      model: aiResponse.model,
    }, 'AI chat completed');

    return {
      message: aiResponse.content,
      conversationId: conversation.id,
      tokensUsed: aiResponse.tokensUsed,
      model: aiResponse.model,
    };
  }

  async getConversation(conversationId: string, userId: string): Promise<AIConversation & { messages: AIMessage[] }> {
    const conversation = await this.getConversationById(conversationId, userId);

    const messagesResult = await db.query(
      `SELECT * FROM ai_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    return {
      ...conversation,
      messages: messagesResult.rows,
    };
  }

  async listConversations(
    userId: string,
    projectId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<AIConversation>> {
    const offset = (page - 1) * limit;

    let whereClause = 'user_id = $1';
    const params: any[] = [userId];
    let paramCount = 2;

    if (projectId) {
      whereClause += ` AND project_id = $${paramCount++}`;
      params.push(projectId);
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM ai_conversations WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);

    const result = await db.query(
      `SELECT * FROM ai_conversations
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

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    await this.getConversationById(conversationId, userId); // Check ownership

    await db.query('DELETE FROM ai_conversations WHERE id = $1', [conversationId]);

    logger.info({ conversationId }, 'Conversation deleted');
  }

  private async callAI(message: string, context: string[], model: string) {
    try {
      const systemMessage = [
        'You are a helpful AI coding assistant for The Wove platform.',
        'Help users with their code, provide explanations, and suggest improvements.',
        ...context,
      ].join('\n\n');

      const response = await this.anthropic.messages.create({
        model,
        max_tokens: config.ai.maxTokens,
        system: systemMessage,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        content,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        model: response.model,
      };
    } catch (error) {
      logger.error({ error }, 'AI API call failed');
      throw new Error('AI service unavailable');
    }
  }

  private async buildContext(conversationId: string, contextFiles?: string[]): Promise<string[]> {
    const context: string[] = [];

    // Get conversation history
    const historyResult = await db.query(
      `SELECT role, content FROM ai_messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [conversationId]
    );

    if (historyResult.rows.length > 0) {
      context.push('Recent conversation history:');
      historyResult.rows.reverse().forEach((msg) => {
        context.push(`${msg.role}: ${msg.content.substring(0, 500)}`);
      });
    }

    // Add file context if provided
    if (contextFiles && contextFiles.length > 0) {
      context.push(`\nRelevant files: ${contextFiles.join(', ')}`);
    }

    return context;
  }

  private async getConversationById(conversationId: string, userId: string): Promise<AIConversation> {
    const result = await db.query(
      'SELECT * FROM ai_conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Conversation not found');
    }

    return result.rows[0];
  }

  private async createConversation(userId: string, projectId?: string): Promise<AIConversation> {
    const result = await db.query(
      `INSERT INTO ai_conversations (user_id, project_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, projectId || null]
    );

    return result.rows[0];
  }

  private async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    tokensUsed?: number
  ): Promise<void> {
    await db.query(
      `INSERT INTO ai_messages (conversation_id, role, content, tokens_used)
       VALUES ($1, $2, $3, $4)`,
      [conversationId, role, content, tokensUsed || null]
    );
  }

  private async updateConversationStats(conversationId: string, tokensUsed: number): Promise<void> {
    await db.query(
      `UPDATE ai_conversations
       SET message_count = message_count + 2,
           total_tokens_used = total_tokens_used + $2,
           updated_at = NOW()
       WHERE id = $1`,
      [conversationId, tokensUsed]
    );
  }

  private async updateUserUsage(userId: string, tokensUsed: number): Promise<void> {
    await db.query(
      'UPDATE users SET ai_requests_used = ai_requests_used + 1 WHERE id = $1',
      [userId]
    );
  }

  private async checkUsageLimit(userId: string): Promise<void> {
    const result = await db.query(
      'SELECT ai_requests_used, ai_requests_limit, tier FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const { ai_requests_used, ai_requests_limit, tier } = result.rows[0];

    if (tier === 'free' && ai_requests_used >= ai_requests_limit) {
      throw new Error('AI request limit exceeded. Please upgrade to Pro.');
    }
  }
}
