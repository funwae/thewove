-- The Wove Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,

    -- Preferences
    preferences JSONB DEFAULT '{}',

    -- Subscription
    tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'team', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_expires_at TIMESTAMPTZ,

    -- Usage tracking
    ai_requests_used INTEGER DEFAULT 0,
    ai_requests_limit INTEGER DEFAULT 100,
    storage_used_bytes BIGINT DEFAULT 0,
    storage_limit_bytes BIGINT DEFAULT 5368709120, -- 5GB

    -- Moderation
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    banned_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_tier ON users(tier);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    readme TEXT,

    -- Visibility and access
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),

    -- Template and forking
    template_id UUID REFERENCES projects(id),
    forked_from UUID REFERENCES projects(id),
    fork_count INTEGER DEFAULT 0,

    -- Metadata
    tags TEXT[],
    tech_stack TEXT[],
    skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    use_case VARCHAR(50),

    -- Stats
    star_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    remix_count INTEGER DEFAULT 0,
    collaborator_count INTEGER DEFAULT 1,

    -- Deployment
    deployment_url TEXT,
    deployment_status VARCHAR(20) DEFAULT 'not_deployed',
    last_deployed_at TIMESTAMPTZ,

    -- Storage
    total_size_bytes BIGINT DEFAULT 0,
    file_count INTEGER DEFAULT 0,

    -- Project settings
    settings JSONB DEFAULT '{}',
    environment_variables JSONB DEFAULT '{}', -- encrypted

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_projects_template ON projects(template_id);
CREATE INDEX idx_projects_forked_from ON projects(forked_from);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX idx_projects_tech_stack ON projects USING GIN(tech_stack);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_projects_star_count ON projects(star_count DESC);
CREATE UNIQUE INDEX idx_projects_owner_slug ON projects(owner_id, slug);

-- ============================================
-- PROJECT FILES
-- ============================================

CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- File info
    file_path VARCHAR(1024) NOT NULL,
    s3_key VARCHAR(1024) NOT NULL,

    -- Metadata
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100),
    encoding VARCHAR(20) DEFAULT 'utf-8',

    -- Versioning
    version_hash VARCHAR(64),
    parent_version_hash VARCHAR(64),

    -- Content (for small files, cached)
    cached_content TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_files_project ON project_files(project_id);
CREATE INDEX idx_project_files_path ON project_files(project_id, file_path);
CREATE INDEX idx_project_files_s3_key ON project_files(s3_key);
CREATE UNIQUE INDEX idx_project_files_project_path ON project_files(project_id, file_path);

-- ============================================
-- PROJECT COLLABORATORS
-- ============================================

CREATE TABLE project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Role and permissions
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    permissions JSONB DEFAULT '{"read": true, "write": false, "deploy": false, "admin": false}',

    -- Invitation
    invited_by UUID REFERENCES users(id),
    invitation_status VARCHAR(20) DEFAULT 'accepted' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_collaborators_project ON project_collaborators(project_id);
CREATE INDEX idx_collaborators_user ON project_collaborators(user_id);
CREATE UNIQUE INDEX idx_collaborators_project_user ON project_collaborators(project_id, user_id);

-- ============================================
-- PROJECT VERSIONS (Snapshots)
-- ============================================

CREATE TABLE project_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),

    -- Version info
    version_number INTEGER NOT NULL,
    message TEXT,
    tag VARCHAR(50),

    -- Snapshot data
    snapshot_data JSONB NOT NULL, -- File hashes and metadata

    -- Stats
    files_changed INTEGER,
    additions INTEGER,
    deletions INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_versions_project ON project_versions(project_id, version_number DESC);
CREATE INDEX idx_versions_created_at ON project_versions(created_at DESC);

-- ============================================
-- AI CONVERSATIONS
-- ============================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Conversation metadata
    title VARCHAR(255),
    model VARCHAR(50),

    -- Context
    context_files TEXT[],
    context_size_tokens INTEGER,

    -- Stats
    message_count INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_project ON ai_conversations(project_id);
CREATE INDEX idx_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON ai_conversations(updated_at DESC);

-- ============================================
-- AI MESSAGES
-- ============================================

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,

    -- Message content
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- Actions performed
    actions JSONB DEFAULT '[]',

    -- Usage
    tokens_used INTEGER,
    model_used VARCHAR(50),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON ai_messages(conversation_id, created_at);

-- ============================================
-- PROMPT TEMPLATES
-- ============================================

CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id),

    -- Template info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),

    -- Content
    template TEXT NOT NULL,
    variables JSONB DEFAULT '[]',

    -- Classification
    use_case VARCHAR(100),
    tech_stack TEXT[],
    tags TEXT[],

    -- Stats
    use_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    star_count INTEGER DEFAULT 0,

    -- Quality metrics
    success_rate DECIMAL(5,2),
    avg_tokens_used INTEGER,

    -- Visibility
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private')),

    -- Forking
    forked_from UUID REFERENCES prompt_templates(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_created_by ON prompt_templates(created_by);
CREATE INDEX idx_prompts_category ON prompt_templates(category);
CREATE INDEX idx_prompts_tags ON prompt_templates USING GIN(tags);
CREATE INDEX idx_prompts_use_count ON prompt_templates(use_count DESC);

-- ============================================
-- DEPLOYMENTS
-- ============================================

CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    deployed_by UUID NOT NULL REFERENCES users(id),

    -- Deployment info
    deployment_type VARCHAR(20) CHECK (deployment_type IN ('static', 'worker', 'container', 'function')),
    deployment_url TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deploying', 'success', 'failed')),
    error_message TEXT,

    -- Build info
    build_logs TEXT,
    build_time_ms INTEGER,

    -- Version
    commit_hash VARCHAR(64),
    version_tag VARCHAR(50),

    -- Metadata
    environment JSONB DEFAULT '{}',
    config JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_deployments_project ON deployments(project_id, created_at DESC);
CREATE INDEX idx_deployments_status ON deployments(status);

-- ============================================
-- STARS (Project appreciation)
-- ============================================

CREATE TABLE stars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_stars_user_project ON stars(user_id, project_id);
CREATE INDEX idx_stars_project ON stars(project_id);
CREATE INDEX idx_stars_user ON stars(user_id);

-- ============================================
-- COLLECTIONS
-- ============================================

CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Visibility
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),

    -- Stats
    project_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_created_by ON collections(created_by);

CREATE TABLE collection_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    position INTEGER,
    notes TEXT,

    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_collection_projects_unique ON collection_projects(collection_id, project_id);
CREATE INDEX idx_collection_projects_collection ON collection_projects(collection_id, position);

-- ============================================
-- MODERATION
-- ============================================

CREATE TABLE moderation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by UUID NOT NULL REFERENCES users(id),

    -- What's being reported
    target_type VARCHAR(20) CHECK (target_type IN ('project', 'user', 'comment', 'message')),
    target_id UUID NOT NULL,

    -- Report details
    reason VARCHAR(50) NOT NULL,
    description TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON moderation_reports(status);
CREATE INDEX idx_reports_target ON moderation_reports(target_type, target_id);
CREATE INDEX idx_reports_created_at ON moderation_reports(created_at DESC);

-- ============================================
-- ACTIVITY LOG
-- ============================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Activity details
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_project ON activity_log(project_id, created_at DESC);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update project stats when files change
CREATE OR REPLACE FUNCTION update_project_file_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects
        SET file_count = file_count + 1,
            total_size_bytes = total_size_bytes + NEW.size_bytes
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects
        SET file_count = file_count - 1,
            total_size_bytes = total_size_bytes - OLD.size_bytes
        WHERE id = OLD.project_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE projects
        SET total_size_bytes = total_size_bytes - OLD.size_bytes + NEW.size_bytes
        WHERE id = NEW.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_files_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON project_files
FOR EACH ROW EXECUTE FUNCTION update_project_file_stats();

-- Update star count
CREATE OR REPLACE FUNCTION update_star_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects SET star_count = star_count + 1 WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects SET star_count = star_count - 1 WHERE id = OLD.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stars_count_trigger
AFTER INSERT OR DELETE ON stars
FOR EACH ROW EXECUTE FUNCTION update_star_count();
