# Technical Architecture

## System Overview

The Wove is built as a modern, distributed web application optimized for real-time collaboration, AI integration, and developer experience. The architecture prioritizes low latency, high availability, and seamless scaling.

## Architecture Principles

1. **Browser-first**: Full IDE capabilities in the browser with no local setup
2. **Real-time by default**: WebSocket connections for all collaborative features
3. **Edge computing**: Deploy user projects to global edge network for <50ms latency
4. **AI-native**: LLM context management and multi-agent orchestration built into core
5. **Progressively enhanced**: Works on slow connections, gracefully degrades
6. **Local-first sync**: Offline editing with conflict-free replication

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer (Browser)                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Code Editor │  │ AI Chat UI   │  │ Community UI │              │
│  │  (Monaco)    │  │              │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐          │
│  │         Collaboration Engine (Yjs CRDT)               │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐          │
│  │      Local IndexedDB Cache & Offline Storage          │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ WebSocket / HTTP
┌─────────────────────────────────────────────────────────────────────┐
│                       API Gateway Layer (Edge)                       │
├─────────────────────────────────────────────────────────────────────┤
│  Authentication • Rate Limiting • Request Routing • WebSocket Proxy  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      Application Services Layer                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Collaboration│  │  AI Services │  │   Project    │              │
│  │   Service    │  │              │  │   Service    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Community  │  │  Deployment  │  │   Search     │              │
│  │   Service    │  │   Service    │  │   Service    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │    Redis     │  │     S3       │              │
│  │  (Metadata)  │  │ (Real-time)  │  │  (Storage)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Elasticsearch│  │   Vector DB  │  │  TimescaleDB │              │
│  │   (Search)   │  │  (AI Memory) │  │  (Metrics)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Technology Stack

### Frontend
- **Framework**: React 18+ with Server Components
- **Build tool**: Vite for fast development, sub-second HMR
- **Code editor**: Monaco Editor (VS Code's engine) with custom AI extensions
- **Styling**: Tailwind CSS + shadcn/ui components
- **State management**: Zustand for local state, Yjs for shared CRDT state
- **Real-time**: Yjs + y-websocket for collaborative editing
- **Offline**: IndexedDB via Dexie.js, service workers for PWA

### Backend
- **API framework**: Fastify (Node.js) for high-performance HTTP/WebSocket
- **Language**: TypeScript throughout for type safety
- **Authentication**: Auth0 with social providers + magic links
- **Real-time**: Socket.io for WebSocket management, Redis pub/sub for scaling
- **AI orchestration**: LangChain + custom agents for multi-model support
- **Job queue**: BullMQ (Redis-backed) for async processing

### Data Layer
- **Primary database**: PostgreSQL 15+ (ACID transactions, JSON support)
- **Caching**: Redis 7+ (real-time state, session management, job queues)
- **File storage**: S3-compatible object storage (Cloudflare R2)
- **Search**: Elasticsearch 8+ (project discovery, code search)
- **Vector database**: Pinecone or Weaviate (AI memory, semantic search)
- **Metrics**: TimescaleDB (time-series analytics)

### Infrastructure
- **Cloud**: Multi-cloud (AWS/GCP for services, Cloudflare for edge)
- **CDN**: Cloudflare for global distribution, edge caching
- **Container orchestration**: Kubernetes for service scaling
- **CI/CD**: GitHub Actions for automated deployments
- **Monitoring**: Datadog for metrics, Sentry for error tracking
- **Deployment**: Cloudflare Workers for user projects (edge execution)

## Detailed Component Architecture

### 1. Collaboration Service

**Purpose**: Enable real-time multiplayer editing with conflict-free merges

**Key Technologies**:
- Yjs CRDT for conflict-free document merging
- y-websocket provider for real-time sync
- y-protocols for persistence and undo/redo
- Custom awareness protocol for cursors, selections, user presence

**Data Flow**:
```
User A types → Local Yjs doc → WebSocket → Collaboration Server
                                             ↓
User B's browser ← WebSocket ← Redis Pub/Sub ← Collaboration Server
                     ↓
               Update Yjs doc → Render in Monaco
```

**Scaling Strategy**:
- Horizontal scaling: Spin up collaboration servers per project
- Redis pub/sub for message broadcasting across servers
- Persistent storage: Snapshot Yjs documents to PostgreSQL every 5 minutes
- Room cleanup: Shut down empty rooms after 5 minutes of inactivity

### 2. AI Services

**Purpose**: Orchestrate LLM requests, manage context, enable multi-agent workflows

**Components**:

**a) Context Manager**
- Tracks project files, dependencies, conversation history
- Smart context window management (sliding window, summarization)
- Embeddings for semantic code search and relevant file retrieval
- Maximum context: 200K tokens (Claude), auto-summarize older history

**b) Agent Orchestrator**
- Manages multiple specialized agents (frontend, backend, testing, docs)
- Task routing based on natural language intent classification
- Agent communication protocol (shared memory, message passing)
- Parallel execution where possible, sequential for dependencies

**c) Prompt Library**
- Version-controlled prompt templates with git-like history
- Search by use case, technology stack, output type
- Usage analytics (success rate, token efficiency)
- Community voting and improvement suggestions

**d) Model Router**
- Multi-model support (Claude, GPT-4, Gemini, local models)
- Intelligent routing based on task type and cost
- Fallback chains for high availability
- Rate limiting and cost tracking per user

**API Integration**:
```typescript
interface AIRequest {
  projectId: string;
  message: string;
  context?: {
    files: string[];
    conversationHistory: Message[];
    codeSelection?: CodeRange;
  };
  agents?: AgentConfig[];
  modelPreference?: ModelType;
}

interface AIResponse {
  message: string;
  actions: CodeAction[];
  agentLogs: AgentLog[];
  tokensUsed: number;
  modelUsed: string;
}
```

### 3. Project Service

**Purpose**: Manage project lifecycle, versioning, dependencies

**Features**:
- Automatic git initialization for all projects
- Smart diffing and version history (lightweight git implementation)
- Dependency detection and auto-install (package.json, requirements.txt, etc.)
- Project templates with scaffolding
- Environment variable management (encrypted storage)
- Build and deployment configuration

**Storage Model**:
```sql
-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255),
    description TEXT,
    visibility ENUM('public', 'unlisted', 'private'),
    template_id UUID REFERENCES templates(id),
    forked_from UUID REFERENCES projects(id),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    metadata JSONB -- tech stack, tags, custom fields
);

-- Project files stored in S3 with metadata in DB
CREATE TABLE project_files (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    file_path VARCHAR(1024),
    s3_key VARCHAR(1024),
    size_bytes BIGINT,
    mime_type VARCHAR(100),
    last_modified TIMESTAMPTZ,
    version_hash VARCHAR(64)
);

-- Version history (lightweight snapshots)
CREATE TABLE project_versions (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    snapshot_data JSONB, -- File hashes + metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ,
    message TEXT
);
```

### 4. Deployment Service

**Purpose**: One-click deployment to production URLs

**Deployment Targets**:
1. **Edge Functions** (Cloudflare Workers): Serverless JS/TS with 0ms cold starts
2. **Static Sites** (Cloudflare Pages): HTML/CSS/JS with global CDN
3. **Docker Containers** (Fly.io): Full-stack apps with databases
4. **Serverless Functions** (AWS Lambda): Python, Node, Go functions

**Deployment Flow**:
```
1. User clicks "Deploy" → Create deployment job
2. Build service:
   - Detect project type (static, SSR, API, full-stack)
   - Install dependencies in isolated container
   - Run build scripts (npm run build, etc.)
   - Optimize assets (minify, compress, image optimization)
3. Upload to appropriate target:
   - Static files → Cloudflare Pages
   - Workers → Cloudflare Workers
   - Containers → Build Docker image → Push to registry → Deploy to Fly.io
4. DNS configuration:
   - Generate subdomain: project-name-user.thewove.app
   - Custom domains for Pro users
5. Health check and rollback on failure
6. Return live URL to user
```

**Performance Targets**:
- Static site deployment: <30 seconds
- Serverless function deployment: <60 seconds
- Full containerized app: <120 seconds
- Automatic SSL certificates for all deployments

### 5. Search Service

**Purpose**: Fast, relevant discovery of projects, prompts, users

**Search Indices**:

**a) Project Search (Elasticsearch)**
```json
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "name": {"type": "text", "boost": 2.0},
      "description": {"type": "text"},
      "readme": {"type": "text"},
      "tags": {"type": "keyword"},
      "tech_stack": {"type": "keyword"},
      "skill_level": {"type": "keyword"},
      "use_case": {"type": "keyword"},
      "remix_count": {"type": "integer"},
      "star_count": {"type": "integer"},
      "updated_at": {"type": "date"}
    }
  }
}
```

**b) Code Search**
- Index all code files with syntax-aware tokenization
- Language-specific analyzers (Python, JavaScript, etc.)
- Support for regex and fuzzy matching
- Result highlighting with context

**c) Semantic Search (Vector Database)**
- Embed project descriptions, READMEs, code comments
- Natural language queries: "projects that visualize data using D3"
- Similar project recommendations
- Related prompt templates

**Query Pipeline**:
```
User query → Intent classification
            ↓
    ┌───────┴───────┐
    │               │
Keyword search   Semantic search
(Elasticsearch)  (Vector DB)
    │               │
    └───────┬───────┘
            ↓
    Result merging & ranking
            ↓
    Personalization (user history, preferences)
            ↓
    Final results
```

## Scaling Strategy

### Horizontal Scaling
- **Stateless services**: All application services scale horizontally behind load balancer
- **Session affinity**: WebSocket connections use consistent hashing to same server
- **Database**: Read replicas for queries, primary for writes
- **Redis**: Cluster mode for distributed caching and pub/sub

### Vertical Scaling
- **AI inference**: GPU instances for local model hosting (T4, A10G)
- **Database**: Scale up for writes, scale out for reads
- **Search**: Increase Elasticsearch cluster nodes for large index

### Geographic Distribution
- **Edge cache**: Static assets and API responses cached at 200+ Cloudflare locations
- **Regional databases**: Eventually consistent replicas in US, EU, APAC
- **User project deployment**: Deploy to edge automatically for global <50ms access

### Performance Targets
- **Time to interactive**: <2 seconds on 3G connection
- **Collaboration latency**: <100ms between users in same region
- **AI response time**: <5 seconds for simple requests, <30 seconds for complex
- **Search results**: <200ms for text search, <500ms for semantic search
- **Deployment time**: 30-120 seconds depending on project complexity

## Security Architecture

### Authentication & Authorization
- **Authentication**: Auth0 with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Session management**: Refresh tokens in httpOnly cookies
- **API keys**: For CLI and integrations, scoped permissions

### Data Protection
- **Encryption at rest**: AES-256 for all stored data
- **Encryption in transit**: TLS 1.3 for all connections
- **Secrets management**: HashiCorp Vault for environment variables
- **PII handling**: Separate encrypted storage, GDPR compliance

### Infrastructure Security
- **Network isolation**: Services in private VPCs, no public IP exposure
- **Container security**: Minimal base images, regular CVE scanning
- **DDoS protection**: Cloudflare with rate limiting and challenge pages
- **Audit logging**: All sensitive operations logged to immutable storage

### Code Execution Safety
- **Sandboxing**: User code runs in isolated containers with resource limits
- **Resource quotas**: CPU (1 core), Memory (512MB), Disk (5GB) for free tier
- **Network restrictions**: Outbound only to allowed domains, no internal access
- **Malware scanning**: Uploaded files scanned before storage

## Disaster Recovery

### Backup Strategy
- **Database**: Continuous backup with point-in-time recovery (PITR)
- **File storage**: Cross-region replication for all user projects
- **Configuration**: GitOps approach, all infrastructure as code

### Recovery Time Objectives (RTO)
- **Service outage**: <15 minutes (auto-healing, failover)
- **Database failure**: <1 hour (restore from replica)
- **Complete disaster**: <4 hours (restore from backups)

### Recovery Point Objectives (RPO)
- **Maximum data loss**: <5 minutes (continuous replication)

## Monitoring & Observability

### Key Metrics
- **Golden signals**: Latency, traffic, errors, saturation
- **Business metrics**: Active users, projects created, deployments, AI requests
- **Cost metrics**: Cloud spend by service, per-user cost

### Alerting
- **Critical alerts**: Service down, database failure, high error rate (>1%)
- **Warning alerts**: High latency (>5s p95), scaling needed, cost anomalies
- **On-call rotation**: PagerDuty integration, escalation policies

### Logging
- **Structured logs**: JSON format with correlation IDs
- **Log aggregation**: Centralized in Datadog or CloudWatch
- **Retention**: 30 days hot storage, 1 year cold storage

## Development Workflow

### Local Development
```bash
# Start all services locally with Docker Compose
docker-compose up

# Frontend dev server with hot reload
cd frontend && npm run dev

# Backend with auto-restart
cd backend && npm run dev

# Database migrations
npm run migrate:latest
```

### Testing Strategy
- **Unit tests**: Jest for business logic (>80% coverage target)
- **Integration tests**: API endpoint tests with test database
- **E2E tests**: Playwright for critical user flows
- **Performance tests**: k6 for load testing before releases

### CI/CD Pipeline
```
1. Push to feature branch
2. Automated tests run (unit, integration, lint)
3. Create pull request
4. Code review + approval
5. Merge to main
6. Deploy to staging environment
7. Run E2E tests on staging
8. Manual QA approval
9. Deploy to production (blue-green deployment)
10. Monitor metrics for 1 hour
11. Automatic rollback on error rate >1%
```

## Technology Decisions & Trade-offs

### Why Yjs for Collaboration?
**Chosen**: Yjs CRDT  
**Alternatives**: Operational Transform (OT), Firebase Realtime Database  
**Reasoning**: Conflict-free merging without central server authority, offline-first support, proven at scale (Google Docs uses CRDT), open-source with active community

### Why Monaco Editor?
**Chosen**: Monaco Editor  
**Alternatives**: CodeMirror 6, Ace Editor  
**Reasoning**: Best-in-class TypeScript support, used by VS Code (familiar to developers), excellent performance, built-in AI extension points, strong accessibility

### Why Cloudflare for Deployment?
**Chosen**: Cloudflare Workers + Pages  
**Alternatives**: Vercel, Netlify, AWS Lambda  
**Reasoning**: True edge execution (0ms cold starts), generous free tier, global distribution, integrated with CDN, simplified pricing model, excellent DX

### Why Multi-Model AI?
**Chosen**: Support Claude, GPT-4, Gemini, local models  
**Alternatives**: Single provider (OpenAI only, Anthropic only)  
**Reasoning**: Avoid vendor lock-in, optimize cost/quality trade-offs per task, resilience against outages, support for open-source models, user choice

## Next Steps

This architecture enables:
- Real-time collaboration without complex setup
- AI-native features from day one
- Scalability to millions of users
- Fast, reliable deployments

See related documents:
- **[03-COLLABORATION.md](./03-COLLABORATION.md)**: Detailed collaboration features
- **[04-AI-PIPELINES.md](./04-AI-PIPELINES.md)**: AI orchestration and prompt sharing
- **[09-INFRASTRUCTURE.md](./09-INFRASTRUCTURE.md)**: Deployment and operations
