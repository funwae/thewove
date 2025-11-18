# The Wove

**Build Together, Ship Faster**

The Wove is a collaborative development platform designed for AI-assisted developers. Build, learn, and grow together without gatekeeping or platform limitations.

## Features

- **Real-time Collaboration**: Google Docs-style multiplayer editing with instant sync
- **AI-Native Platform**: Integrated AI assistance with Claude API
- **Monaco Code Editor**: Full VS Code editing experience in the browser
- **One-Click Deployment**: Deploy to production in under 60 seconds
- **File Storage**: S3-compatible object storage for project files
- **Project Management**: Full CRUD operations for projects
- **Authentication**: Secure JWT-based authentication
- **WebSocket Support**: Real-time updates and collaboration

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify (high-performance HTTP/WebSocket)
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Search**: Elasticsearch 8+
- **Storage**: S3-compatible (MinIO for local dev)
- **AI**: Anthropic Claude API

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: Monaco Editor (VS Code engine)
- **State**: Zustand + React Query
- **Routing**: React Router

### Infrastructure
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Collaboration**: Yjs + WebSocket

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- npm or yarn

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/thewove.git
cd thewove
```

### 2. Start infrastructure services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Elasticsearch (port 9200)
- MinIO (port 9000, console 9001)

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude
- `JWT_SECRET`: A secure random string for JWT tokens

### 4. Initialize the database

```bash
cd backend
npm install
npm run migrate
```

### 5. Start the backend

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:4000

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

### 7. Open your browser

Navigate to http://localhost:3000 and create an account!

## Project Structure

```
thewove/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Custom middleware
│   │   ├── db/            # Database setup & migrations
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   └── package.json
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # State management
│   │   ├── lib/           # API client & utilities
│   │   └── styles/        # Global styles
│   └── package.json
├── docs/                   # Documentation
├── docker-compose.yml      # Local development services
├── .env.example           # Environment variables template
└── README.md              # This file
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:owner/:slug` - Get project
- `PATCH /api/projects/:owner/:slug` - Update project
- `DELETE /api/projects/:owner/:slug` - Delete project
- `POST /api/projects/:owner/:slug/star` - Star project
- `POST /api/projects/:owner/:slug/fork` - Fork project

### Files
- `GET /api/files/projects/:projectId` - List project files
- `GET /api/files/projects/:projectId/files/*` - Get file content
- `PUT /api/files/projects/:projectId/files/*` - Save file
- `DELETE /api/files/projects/:projectId/files/*` - Delete file

### AI
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/conversations/:id` - Get conversation
- `GET /api/ai/conversations` - List conversations
- `DELETE /api/ai/conversations/:id` - Delete conversation

### Deployments
- `POST /api/deployments` - Create deployment
- `GET /api/deployments/:id` - Get deployment status
- `GET /api/deployments/projects/:projectId` - List project deployments
- `GET /api/deployments/:id/logs` - Get deployment logs

## Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run in development mode (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Database Migrations

```bash
cd backend

# Run migrations
npm run migrate

# Create new migration (manual - edit src/db/schema.sql)
# Then run migrate again
```

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://thewove:thewove_dev_password@localhost:5432/thewove

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=thewove
S3_SECRET_KEY=thewove_dev_password
S3_BUCKET=thewove-projects

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:4000/api
```

## Production Deployment

### Requirements
- PostgreSQL 15+ database
- Redis 7+ instance
- S3-compatible object storage
- Elasticsearch cluster (optional, for search)
- Node.js hosting (e.g., AWS, GCP, Fly.io)

### Build

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Deploy

1. Set up production environment variables
2. Deploy backend to your hosting service
3. Deploy frontend static files to CDN/hosting
4. Run database migrations
5. Configure DNS and SSL

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/thewove/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/thewove/discussions)

## Roadmap

See [docs/15-ROADMAP.md](docs/15-ROADMAP.md) for the complete roadmap.

### MVP (Months 1-3) ✅
- [x] User authentication
- [x] Project CRUD operations
- [x] File storage and management
- [x] Monaco code editor
- [x] Basic collaboration infrastructure
- [x] AI integration (Claude)
- [x] Deployment service

### Next Steps (Months 4-6)
- [ ] Advanced collaboration (cursors, presence)
- [ ] Voice chat (WebRTC)
- [ ] Prompt library
- [ ] Multi-agent orchestration
- [ ] Project templates
- [ ] Mobile app (view-only)

### Future (Months 7+)
- [ ] Private projects & teams
- [ ] Advanced AI pipelines
- [ ] Session recording
- [ ] Enterprise features
- [ ] Mobile editing

## Acknowledgments

Built with:
- [Fastify](https://www.fastify.io/)
- [React](https://react.dev/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Yjs](https://yjs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

Inspired by the vibe coding community and the need for better collaborative development tools.

---

**Made with ❤️ by The Wove Team**
