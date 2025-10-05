# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-04-project-setup-database-schema/spec.md

> Created: 2025-10-04
> Version: 1.0.0

## Technical Requirements

### Monorepo Structure

**Folder Organization:**
```
/
├── apps/
│   ├── web/              # Next.js 14+ App Router
│   └── api/              # NestJS 10+ Backend
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── database/         # Prisma schema and client
│   └── utils/            # Shared utilities
├── docker-compose.yml
├── turbo.json            # Turborepo config
├── package.json          # Root package.json
└── .env.example          # Environment template
```

**Package Manager:** pnpm (for efficient workspace management)

**Build Tool:** Turborepo for incremental builds and caching

### Technology Stack Versions

- Node.js: 20 LTS
- Next.js: 14.2+
- NestJS: 10.3+
- TypeScript: 5.3+
- Prisma: 5.9+
- PostgreSQL: 16+
- Redis: 7+
- pnpm: 8+

### Database Schema Requirements

**Core Models:**

1. **User Model**
   - id (UUID, primary key)
   - email (unique, not null)
   - name (string)
   - createdAt (timestamp)
   - updatedAt (timestamp)
   - profilePicture (string, optional)
   - settings (JSON, optional)

2. **Contact Model**
   - id (UUID, primary key)
   - userId (UUID, foreign key to User)
   - name (string, not null)
   - email (string, optional)
   - phone (string, optional)
   - linkedInUrl (string, optional)
   - company (string, optional)
   - industry (string, optional)
   - role (string, optional)
   - priority (enum: HIGH, MEDIUM, LOW)
   - gender (enum: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)
   - birthday (date, optional)
   - profilePicture (string, optional)
   - notes (text, optional)
   - metadata (JSON, optional)
   - createdAt (timestamp)
   - updatedAt (timestamp)
   - lastContactedAt (timestamp, optional)

3. **Tag Model**
   - id (UUID, primary key)
   - userId (UUID, foreign key to User)
   - name (string, not null)
   - color (string, hex color code)
   - createdAt (timestamp)
   - Many-to-many relationship with Contact

4. **Email Model** (for conversation history)
   - id (UUID, primary key)
   - userId (UUID, foreign key to User)
   - contactId (UUID, foreign key to Contact)
   - subject (string)
   - body (text)
   - sentAt (timestamp)
   - openedAt (timestamp, optional)
   - clickedAt (timestamp, optional)
   - provider (enum: GMAIL, OUTLOOK, SMTP)
   - metadata (JSON, optional)

5. **Activity Model** (for tracking all contact interactions)
   - id (UUID, primary key)
   - userId (UUID, foreign key to User)
   - contactId (UUID, foreign key to Contact)
   - type (enum: EMAIL_SENT, EMAIL_RECEIVED, CALL, MEETING, NOTE)
   - description (text)
   - occurredAt (timestamp)
   - metadata (JSON, optional)

6. **Reminder Model**
   - id (UUID, primary key)
   - userId (UUID, foreign key to User)
   - contactId (UUID, foreign key to Contact)
   - title (string)
   - dueDate (timestamp)
   - completed (boolean, default false)
   - completedAt (timestamp, optional)
   - createdAt (timestamp)

**Indexes:**
- Contact.userId + Contact.priority (for efficient priority queries)
- Contact.userId + Contact.lastContactedAt (for follow-up queries)
- Email.userId + Email.sentAt (for email history)
- Activity.userId + Activity.occurredAt (for activity feed)
- Tag.userId (for user's tags)

**Constraints:**
- Unique constraint on User.email
- Cascade delete: User deletion cascades to Contact, Email, Activity, Reminder
- Cascade delete: Contact deletion cascades to Email, Activity, Reminder
- Check constraint: Contact.priority in (HIGH, MEDIUM, LOW)
- Check constraint: Contact.gender in (MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)

### Approach Options

**Option A: Turborepo Monorepo** (Selected)
- Pros: Excellent caching, incremental builds, simple configuration, great DX
- Cons: Additional dependency, learning curve

**Option B: pnpm Workspaces Only**
- Pros: Minimal setup, native pnpm feature, simpler
- Cons: No build caching, slower incremental builds

**Option C: Nx Monorepo**
- Pros: Most powerful, plugin ecosystem, advanced features
- Cons: Complex configuration, overkill for current needs

**Rationale:** Turborepo provides the best balance of performance (caching) and simplicity. As the project scales, incremental builds will save significant CI/CD time.

## External Dependencies

### New Packages

**Root:**
- `turbo` - Monorepo build system with caching
- `pnpm` - Package manager (installed globally)

**apps/web (Next.js):**
- `next@14.2+` - React framework with App Router
- `react@18+` - UI library
- `react-dom@18+` - React DOM renderer
- `typescript@5.3+` - Type safety
- `@types/react` - React types
- `@types/node` - Node.js types

**apps/api (NestJS):**
- `@nestjs/core@10.3+` - Core framework
- `@nestjs/common` - Common utilities
- `@nestjs/platform-express` - Express adapter
- `@nestjs/config` - Configuration management
- `reflect-metadata` - Decorator metadata
- `rxjs` - Reactive programming
- `typescript@5.3+` - Type safety

**packages/database (Prisma):**
- `prisma@5.9+` - Prisma CLI for migrations
- `@prisma/client@5.9+` - Prisma Client runtime
- Justification: Industry-standard ORM with excellent TypeScript support, type-safe queries, and automatic migration generation

**Development Dependencies:**
- `docker` - Containerization (installed globally)
- `docker-compose` - Multi-container orchestration
- `tsx` - TypeScript execution for scripts
- `@types/node` - Node.js type definitions

**Database:**
- PostgreSQL 16 (via Docker)
- Redis 7 (via Docker)

### External Services (Development)

- Docker Desktop (for local development containers)
- PostgreSQL client (optional, for database exploration)
