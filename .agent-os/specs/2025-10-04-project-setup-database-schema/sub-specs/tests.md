# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-10-04-project-setup-database-schema/spec.md

> Created: 2025-10-04
> Version: 1.0.0

## Test Coverage

### Unit Tests

**Prisma Client (packages/database)**
- Test database connection establishment
- Test Prisma Client generation and import
- Test all model CRUD operations independently
- Test cascade delete behavior for User → Contact → Email/Activity/Reminder
- Test unique constraints (User.email, Tag name per user)
- Test enum validations (Priority, Gender, EmailProvider, ActivityType)
- Test default values (timestamps, boolean defaults)

**Seed Script (packages/database/prisma/seed.ts)**
- Test seed script runs without errors
- Test seed data creation count matches expectations
- Test relationships are properly established in seed data
- Test seed script is idempotent (can run multiple times)

### Integration Tests

**Database Schema Validation**
- Test all tables exist in PostgreSQL after migration
- Test all indexes are created correctly
- Test foreign key constraints are enforced
- Test unique constraints prevent duplicate data
- Test cascade deletes work across all relationships
- Test JSONB fields can store and retrieve complex objects

**Monorepo Build System**
- Test `pnpm install` completes successfully across all workspaces
- Test Turborepo builds all packages in correct order
- Test TypeScript compilation succeeds for web, api, and packages
- Test shared types package exports correctly to web and api
- Test database package exports Prisma Client to api

**Docker Compose Environment**
- Test `docker-compose up` starts all services (PostgreSQL, Redis, web, api)
- Test PostgreSQL is accessible on localhost:5432
- Test Redis is accessible on localhost:6379
- Test Next.js dev server runs on localhost:3000
- Test NestJS dev server runs on localhost:3001
- Test hot reload works for both Next.js and NestJS code changes

### E2E Tests (Playwright)

**Development Environment Setup**
- User can clone repository and run `pnpm install` successfully
- User can start Docker Compose with `docker-compose up`
- User can access Next.js at http://localhost:3000
- User can access NestJS at http://localhost:3001
- User can access Prisma Studio at http://localhost:5555
- User can run migrations with `pnpm --filter database prisma migrate dev`
- User can seed database with `pnpm --filter database prisma db seed`

**Prisma Studio Verification**
- Navigate to http://localhost:5555
- Verify all tables are visible (users, contacts, tags, emails, activities, reminders)
- Verify seed data is present in all tables
- Verify relationships are correctly displayed (Contact → User, Contact → Tags, etc.)

### Mocking Requirements

**Database Connections**
- Mock PostgreSQL connection for unit tests using in-memory database or test container
- Use separate test database for integration tests to avoid polluting development data

**External Services**
- No external services required for this spec (no APIs, no third-party integrations)
- Redis mocking not required for initial setup (used in later features)

## Test Execution Strategy

### Test Commands

```bash
# Run all tests
pnpm test

# Run database package tests only
pnpm --filter database test

# Run E2E tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

### Coverage Requirements

- Minimum 80% code coverage for all packages
- 100% coverage for Prisma schema validation tests
- Critical paths (CRUD operations, migrations, seed) must have 100% coverage

## Test Data

### Fixtures

Create reusable test fixtures in `packages/database/tests/fixtures/`:
- `users.fixture.ts` - Sample user data
- `contacts.fixture.ts` - Sample contact data with various field combinations
- `emails.fixture.ts` - Sample email records
- `activities.fixture.ts` - Sample activity records
- `tags.fixture.ts` - Sample tags and contact-tag relationships

### Test Database

Use a separate PostgreSQL database for testing:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cordiq_test?schema=public"
```

### Cleanup Strategy

- Reset database before each test suite
- Use transactions that rollback after each test (where applicable)
- Provide cleanup scripts to wipe test database: `pnpm --filter database prisma migrate reset --force`
