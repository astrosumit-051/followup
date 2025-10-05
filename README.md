# RelationHub

AI-Powered Professional Relationship Management Platform

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS 4
- **Backend**: NestJS 10 + Node.js 20
- **Database**: PostgreSQL 16 + Prisma ORM 5
- **Cache**: Redis 7
- **Monorepo**: Turborepo + pnpm workspaces

## Prerequisites

- Node.js 20+ LTS
- pnpm 8+
- Docker Desktop (for local development)
- PostgreSQL 16 (if not using Docker)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Database (Docker)

```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Verify services are running
docker compose ps
```

### 3. Set Up Database

**⚠️ CRITICAL: Stop local PostgreSQL first to avoid connection conflicts**

```bash
# IMPORTANT: Stop local PostgreSQL if installed via Homebrew
brew services stop postgresql@17
# Verify only Docker is listening on port 5432
lsof -i :5432  # Should only show Docker, not postgres

# Generate Prisma Client
pnpm --filter @relationhub/database prisma generate

# Run migrations
pnpm --filter @relationhub/database prisma migrate dev --name init

# Seed database with test data
pnpm --filter @relationhub/database db:seed
```

### 4. Start Development Servers

```bash
# Start both Next.js and NestJS dev servers
pnpm dev
```

Or run them individually:

```bash
# Terminal 1: Next.js (Frontend)
pnpm --filter @relationhub/web dev

# Terminal 2: NestJS (Backend)
pnpm --filter @relationhub/api dev
```

### 5. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Prisma Studio**: `pnpm --filter @relationhub/database db:studio` (http://localhost:5555)

## Project Structure

```
relationhub/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # NestJS backend
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── database/         # Prisma schema and client
│   └── utils/            # Shared utilities
├── docker-compose.yml    # Local development environment
├── turbo.json            # Turborepo configuration
└── pnpm-workspace.yaml   # pnpm workspace configuration
```

## Database Management

### Run Migrations

```bash
pnpm --filter @relationhub/database prisma migrate dev
```

### Seed Database

```bash
pnpm --filter @relationhub/database db:seed
```

### Open Prisma Studio

```bash
pnpm --filter @relationhub/database db:studio
```

### Reset Database

```bash
pnpm --filter @relationhub/database prisma migrate reset
```

## Environment Variables

### Next.js (apps/web/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### NestJS (apps/api/.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/relationhub_dev?schema=public"
PORT=3001
```

## Available Scripts

### Root Level

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all packages

### Next.js (apps/web)

- `pnpm --filter @relationhub/web dev` - Start Next.js dev server
- `pnpm --filter @relationhub/web build` - Build for production
- `pnpm --filter @relationhub/web start` - Start production server

### NestJS (apps/api)

- `pnpm --filter @relationhub/api dev` - Start NestJS dev server
- `pnpm --filter @relationhub/api build` - Build for production
- `pnpm --filter @relationhub/api start:prod` - Start production server

### Database (packages/database)

- `pnpm --filter @relationhub/database db:generate` - Generate Prisma Client
- `pnpm --filter @relationhub/database db:migrate` - Run migrations
- `pnpm --filter @relationhub/database db:seed` - Seed database
- `pnpm --filter @relationhub/database db:studio` - Open Prisma Studio

## Development Workflow

1. **Start services**: `docker compose up -d postgres redis`
2. **Install dependencies**: `pnpm install`
3. **Generate Prisma Client**: `pnpm --filter @relationhub/database prisma generate`
4. **Run migrations**: `pnpm --filter @relationhub/database prisma migrate dev`
5. **Seed database**: `pnpm --filter @relationhub/database db:seed`
6. **Start development**: `pnpm dev`

## Troubleshooting

### Docker issues

If Docker services fail to start:
```bash
# Check Docker is running
docker ps

# Stop all services
docker compose down

# Remove volumes and start fresh
docker compose down -v
docker compose up -d
```

### Prisma Client not found

```bash
pnpm --filter @relationhub/database prisma generate
```

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### PostgreSQL connection conflict

If you get `P1010: User denied access` errors, you may have a local PostgreSQL instance conflicting with Docker:

```bash
# Stop local PostgreSQL service
brew services stop postgresql@17

# Or stop any PostgreSQL version
brew services stop postgresql

# Verify only Docker is listening on port 5432
lsof -i :5432
```

## Phase 1: Foundation & Core MVP

This is the initial setup for Phase 1. See `.agent-os/product/roadmap.md` for complete development roadmap.

### Completed
- ✅ Monorepo structure with Turborepo
- ✅ Next.js 14 with App Router
- ✅ NestJS 10 backend
- ✅ Prisma database schema
- ✅ Docker Compose environment
- ✅ Shared packages (types, utils, database)

### Next Steps
- Authentication & Authorization
- Contact CRUD operations
- Basic Dashboard
- Contact List & Detail views

## Documentation

- **Product Mission**: `.agent-os/product/mission.md`
- **Tech Stack Details**: `.agent-os/product/tech-stack.md`
- **Development Roadmap**: `.agent-os/product/roadmap.md`
- **Technical Decisions**: `.agent-os/product/decisions.md`

## License

Private - All Rights Reserved
