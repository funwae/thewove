// User types
export interface User {
  id: string;
  auth0_id?: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences: Record<string, any>;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  subscription_status: string;
  subscription_expires_at?: Date;
  ai_requests_used: number;
  ai_requests_limit: number;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  is_banned: boolean;
  ban_reason?: string;
  banned_at?: Date;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface CreateUserInput {
  email: string;
  username: string;
  auth0_id?: string;
  display_name?: string;
  avatar_url?: string;
}

// Project types
export interface Project {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  readme?: string;
  visibility: 'public' | 'unlisted' | 'private';
  template_id?: string;
  forked_from?: string;
  fork_count: number;
  tags: string[];
  tech_stack: string[];
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  use_case?: string;
  star_count: number;
  view_count: number;
  remix_count: number;
  collaborator_count: number;
  deployment_url?: string;
  deployment_status: string;
  last_deployed_at?: Date;
  total_size_bytes: number;
  file_count: number;
  settings: Record<string, any>;
  environment_variables: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  last_activity_at: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  template_id?: string;
  forked_from?: string;
  tags?: string[];
  tech_stack?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  slug?: string;
  description?: string;
  readme?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  tags?: string[];
  tech_stack?: string[];
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  use_case?: string;
}

// File types
export interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  s3_key: string;
  size_bytes: number;
  mime_type?: string;
  encoding: string;
  version_hash?: string;
  parent_version_hash?: string;
  cached_content?: string;
  created_at: Date;
  updated_at: Date;
  last_modified_at: Date;
}

export interface FileUpload {
  path: string;
  content: string | Buffer;
  mimeType?: string;
  encoding?: string;
}

// AI types
export interface AIConversation {
  id: string;
  project_id?: string;
  user_id: string;
  title?: string;
  model?: string;
  context_files: string[];
  context_size_tokens: number;
  message_count: number;
  total_tokens_used: number;
  created_at: Date;
  updated_at: Date;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions: any[];
  tokens_used?: number;
  model_used?: string;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface AIRequest {
  message: string;
  conversationId?: string;
  projectId?: string;
  contextFiles?: string[];
  model?: string;
}

export interface AIResponse {
  message: string;
  conversationId: string;
  tokensUsed: number;
  model: string;
  actions?: any[];
}

// Collaboration types
export interface Collaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: {
    read: boolean;
    write: boolean;
    deploy: boolean;
    admin: boolean;
  };
  invited_by?: string;
  invitation_status: 'pending' | 'accepted' | 'declined';
  created_at: Date;
  accepted_at?: Date;
}

// Deployment types
export interface Deployment {
  id: string;
  project_id: string;
  deployed_by: string;
  deployment_type: 'static' | 'worker' | 'container' | 'function';
  deployment_url?: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  error_message?: string;
  build_logs?: string;
  build_time_ms?: number;
  commit_hash?: string;
  version_tag?: string;
  environment: Record<string, any>;
  config: Record<string, any>;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

// Prompt template types
export interface PromptTemplate {
  id: string;
  created_by: string;
  name: string;
  description?: string;
  category?: string;
  template: string;
  variables: any[];
  use_case?: string;
  tech_stack: string[];
  tags: string[];
  use_count: number;
  fork_count: number;
  star_count: number;
  success_rate?: number;
  avg_tokens_used?: number;
  visibility: 'public' | 'private';
  forked_from?: string;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
