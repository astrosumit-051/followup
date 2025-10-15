# Database Migration Guide

> Guide for migrating the RelationHub database to support AI email generation features

## Overview

This guide covers the database schema changes required for the AI email generation feature. The migration adds three new tables (`emails`, `email_templates`, `conversation_history`) and several supporting enums.

## Migration Summary

### New Tables

1. **emails** - Stores generated and sent emails
2. **email_templates** - User-created reusable templates
3. **conversation_history** - Tracks all email communications for context

### New Enums

- `EmailStatus` - Email state (DRAFT, SCHEDULED, SENT, FAILED, CANCELLED)
- `TemplateType` - Email style (FORMAL, CASUAL, CUSTOM, AI_GENERATED, TEMPLATE_BASED)
- `Direction` - Communication direction (SENT, RECEIVED)

### Schema Changes

- No changes to existing tables (`users`, `contacts`)
- All new tables have foreign keys to existing `users` and `contacts` tables
- Indexes added for query performance

## Prerequisites

Before running migrations:

- ✅ **Backup database** (always backup before schema changes)
- ✅ PostgreSQL v17+ running
- ✅ Prisma CLI installed: `pnpm add -D prisma`
- ✅ Database connection string in `.env`
- ✅ Application stopped (no active connections)

## Migration Steps

### Step 1: Backup Current Database

#### Option A: PostgreSQL Dump (Recommended)

```bash
# Create backup directory
mkdir -p backups

# Backup entire database
pg_dump -h localhost -U postgres -d relationhub_dev > backups/relationhub_dev_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh backups/

# Expected output:
# relationhub_dev_20251015_143022.sql  (file size varies)
```

#### Option B: Docker PostgreSQL Backup

```bash
# If using Docker Compose
docker exec relationhub-postgres pg_dump -U postgres relationhub_dev > backups/relationhub_dev_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Review Migration Files

```bash
# Navigate to API directory
cd apps/api

# List migration files
ls -la prisma/migrations/

# Expected migrations for AI features:
# 20251010000000_add_email_tables/
# 20251010000001_add_email_templates/
# 20251010000002_add_conversation_history/
```

### Step 3: Check Current Database State

```bash
# Check Prisma migration status
pnpm prisma migrate status

# Expected output (if no migrations run yet):
# Database schema is not in sync with migration history
# Following migrations have not been applied:
#   20251010000000_add_email_tables
#   20251010000001_add_email_templates
#   20251010000002_add_conversation_history
```

### Step 4: Run Migrations

#### Development Environment

```bash
# Run migrations in development
cd apps/api
pnpm prisma migrate dev

# Prisma will:
# 1. Apply pending migrations
# 2. Generate Prisma Client
# 3. Optionally run seed data
```

**Expected Output**:
```
Applying migration `20251010000000_add_email_tables`
Applying migration `20251010000001_add_email_templates`
Applying migration `20251010000002_add_conversation_history`

The following migration(s) have been applied:
migrations/
  └─ 20251010000000_add_email_tables/
      └─ migration.sql
  └─ 20251010000001_add_email_templates/
      └─ migration.sql
  └─ 20251010000002_add_conversation_history/
      └─ migration.sql

✔ Generated Prisma Client
```

#### Production Environment

```bash
# Deploy migrations to production (does NOT create new migrations)
pnpm prisma migrate deploy

# Safer for production:
# - Won't prompt for input
# - Won't create new migrations
# - Only applies existing migrations
```

### Step 5: Verify Migration Success

```bash
# Check migration status again
pnpm prisma migrate status

# Expected: "Database schema is up to date!"

# Verify tables exist
psql -h localhost -U postgres -d relationhub_dev -c "\dt"

# Expected tables:
# - emails
# - email_templates
# - conversation_history
# - (existing: users, contacts, etc.)
```

### Step 6: Seed Development Data (Optional)

```bash
# Seed database with sample data for testing
pnpm prisma db seed

# Creates:
# - 10 sample emails
# - 5 email templates
# - 20 conversation history entries
```

### Step 7: Generate Prisma Client

```bash
# Generate TypeScript types from schema
pnpm prisma generate

# This creates/updates:
# - node_modules/@prisma/client
# - Type definitions for new tables
```

## Schema Details

### emails Table

```sql
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'DRAFT',
    "templateType" "TemplateType",
    "providerId" TEXT,
    "tokensUsed" INTEGER,
    "generatedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- Indexes for performance
CREATE INDEX "emails_userId_idx" ON "emails"("userId");
CREATE INDEX "emails_contactId_idx" ON "emails"("contactId");
CREATE INDEX "emails_status_idx" ON "emails"("status");
CREATE INDEX "emails_generatedAt_idx" ON "emails"("generatedAt");

-- Foreign keys
ALTER TABLE "emails" ADD CONSTRAINT "emails_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "emails" ADD CONSTRAINT "emails_contactId_fkey"
    FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE;
```

**Purpose**: Stores all emails generated by AI or manually created. Tracks lifecycle from draft → sent → opened.

**Key Fields**:
- `providerId`: Which LLM generated this (gemini, openai, anthropic)
- `tokensUsed`: Token count for cost tracking
- `status`: Current state (DRAFT, SENT, etc.)
- `openedAt`, `repliedAt`: Email engagement tracking

### email_templates Table

```sql
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "templateType" "TemplateType" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "email_templates_userId_idx" ON "email_templates"("userId");
CREATE INDEX "email_templates_isDefault_idx" ON "email_templates"("isDefault");

-- Foreign key
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
```

**Purpose**: User-created reusable templates. Users can save successful email patterns for future use.

**Key Fields**:
- `isDefault`: Only one template can be default per user
- `templateType`: Style classification (FORMAL, CASUAL, CUSTOM)

### conversation_history Table

```sql
CREATE TABLE "conversation_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "conversation_history_pkey" PRIMARY KEY ("id")
);

-- Indexes for querying recent conversations
CREATE INDEX "conversation_history_userId_idx" ON "conversation_history"("userId");
CREATE INDEX "conversation_history_contactId_idx" ON "conversation_history"("contactId");
CREATE INDEX "conversation_history_timestamp_idx" ON "conversation_history"("timestamp");

-- Foreign keys
ALTER TABLE "conversation_history" ADD CONSTRAINT "conversation_history_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "conversation_history" ADD CONSTRAINT "conversation_history_contactId_fkey"
    FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE;
```

**Purpose**: Tracks all email communications (sent and received) to provide context for future AI generations.

**Key Fields**:
- `direction`: SENT (user sent) or RECEIVED (user received)
- `metadata`: JSON field for additional data (subject, attachments, etc.)
- `timestamp`: When communication occurred

### Enums

```sql
-- Email lifecycle states
CREATE TYPE "EmailStatus" AS ENUM (
    'DRAFT',      -- Being composed
    'SCHEDULED',  -- Queued for sending
    'SENT',       -- Successfully sent
    'FAILED',     -- Send attempt failed
    'CANCELLED'   -- User cancelled
);

-- Email style/source
CREATE TYPE "TemplateType" AS ENUM (
    'FORMAL',          -- Professional tone
    'CASUAL',          -- Friendly tone
    'CUSTOM',          -- User-defined
    'AI_GENERATED',    -- Created by AI
    'TEMPLATE_BASED'   -- From saved template
);

-- Communication direction
CREATE TYPE "Direction" AS ENUM (
    'SENT',      -- User sent to contact
    'RECEIVED'   -- User received from contact
);
```

## Rollback Procedure

If migration fails or needs to be reverted:

### Option 1: Restore from Backup

```bash
# Stop application
docker-compose down

# Restore database from backup
psql -h localhost -U postgres -d relationhub_dev < backups/relationhub_dev_20251015_143022.sql

# Restart application
docker-compose up -d
```

### Option 2: Manual Rollback (Drop New Tables)

```bash
# Connect to database
psql -h localhost -U postgres -d relationhub_dev

# Drop tables in reverse order (respects foreign keys)
DROP TABLE IF EXISTS "conversation_history" CASCADE;
DROP TABLE IF EXISTS "email_templates" CASCADE;
DROP TABLE IF EXISTS "emails" CASCADE;

# Drop enums
DROP TYPE IF EXISTS "Direction";
DROP TYPE IF EXISTS "TemplateType";
DROP TYPE IF EXISTS "EmailStatus";

# Exit psql
\q
```

### Option 3: Prisma Migrate Reset (Development Only)

```bash
# ⚠️ WARNING: Deletes ALL data and recreates schema
cd apps/api
pnpm prisma migrate reset

# Only use in development!
```

## Performance Considerations

### Query Performance

**Indexes** are created for common query patterns:

1. **emails_userId_idx** - Find all emails for a user
2. **emails_contactId_idx** - Find all emails for a contact
3. **emails_status_idx** - Filter by status (DRAFT, SENT, etc.)
4. **emails_generatedAt_idx** - Sort by generation date

**Measured Performance** (on development database):
- Pagination query: ~1ms
- Single email fetch: ~0.3ms
- Conversation history: ~0.4ms

### Storage Estimates

**Per Record**:
- Email: ~2-5 KB (subject + body + metadata)
- Template: ~1-3 KB
- Conversation: ~2-4 KB

**Growth Estimates**:
- 1,000 emails/month = ~2.5 MB/month
- 10,000 emails/month = ~25 MB/month
- 100,000 emails/month = ~250 MB/month

**Recommendation**: Monitor disk usage and set up alerts at 80% capacity.

## Monitoring Post-Migration

### Health Checks

```bash
# Check table row counts
psql -h localhost -U postgres -d relationhub_dev <<EOF
SELECT 'emails' as table_name, COUNT(*) FROM emails
UNION ALL
SELECT 'email_templates', COUNT(*) FROM email_templates
UNION ALL
SELECT 'conversation_history', COUNT(*) FROM conversation_history;
EOF
```

### Performance Monitoring

```bash
# Check table sizes
psql -h localhost -U postgres -d relationhub_dev <<EOF
SELECT
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS indexes_size
FROM pg_catalog.pg_statio_user_tables
WHERE relname IN ('emails', 'email_templates', 'conversation_history')
ORDER BY pg_total_relation_size(relid) DESC;
EOF
```

### Application Health

```bash
# Test GraphQL API
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ emails { edges { id subject status } } }"}'

# Expected: JSON response with emails array (may be empty)
```

## Troubleshooting

### Issue: "Migration failed: relation already exists"

**Cause**: Tables already exist from previous migration attempt.

**Solution**:
```bash
# Option 1: Mark migration as applied (if tables are correct)
pnpm prisma migrate resolve --applied 20251010000000_add_email_tables

# Option 2: Drop tables and re-run
psql -h localhost -U postgres -d relationhub_dev -c "DROP TABLE IF EXISTS emails CASCADE;"
pnpm prisma migrate deploy
```

### Issue: "Foreign key constraint violation"

**Cause**: Attempting to delete user/contact with emails.

**Solution**: This is expected behavior (CASCADE delete configured). Deleting a user automatically deletes their emails.

### Issue: "Enum value doesn't exist"

**Cause**: Application code uses enum value not in database.

**Solution**: Check schema.prisma matches migration:
```bash
# Compare schema to database
pnpm prisma migrate status
pnpm prisma validate
```

### Issue: "Prisma Client out of sync"

**Error**: `The `prisma.email` property does not exist...`

**Solution**: Regenerate Prisma Client:
```bash
pnpm prisma generate
# Restart application
```

## Production Deployment Checklist

### Pre-Deployment

- [ ] Test migrations on staging environment
- [ ] Backup production database
- [ ] Schedule maintenance window
- [ ] Notify team of deployment
- [ ] Review rollback procedure
- [ ] Verify disk space (need ~10% free for migration)

### Deployment

- [ ] Put application in maintenance mode
- [ ] Stop all application servers
- [ ] Verify no active database connections
- [ ] Run `prisma migrate deploy`
- [ ] Verify migration success
- [ ] Generate Prisma Client on all servers
- [ ] Start application servers
- [ ] Remove maintenance mode

### Post-Deployment

- [ ] Smoke test: Create test email
- [ ] Verify query performance (<100ms)
- [ ] Check error logs for database errors
- [ ] Monitor database CPU/memory
- [ ] Verify backup system updated
- [ ] Update runbook with new schema
- [ ] Document any issues encountered

## Data Seeding (Development)

### Automatic Seeding

```bash
# Seed runs automatically after migrations in dev
pnpm prisma migrate dev

# Or run manually
pnpm prisma db seed
```

### Seed Data Contents

**emails** (10 records):
- 5 DRAFT emails
- 3 SENT emails
- 2 FAILED emails

**email_templates** (5 records):
- 2 FORMAL templates
- 2 CASUAL templates
- 1 CUSTOM template (1 marked as default)

**conversation_history** (20 records):
- 10 SENT messages
- 10 RECEIVED messages
- Distributed across 5 contacts

## Additional Resources

### Prisma Documentation

- [Migrations Overview](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Production Migrations](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [Seeding](https://www.prisma.io/docs/guides/migrate/seed-database)

### PostgreSQL Documentation

- [Backup and Restore](https://www.postgresql.org/docs/current/backup.html)
- [Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)

### Internal Documentation

- Schema diagram: `apps/api/prisma/schema.prisma`
- Migration files: `apps/api/prisma/migrations/`
- Seed script: `apps/api/prisma/seed.ts`

## Support

For issues with migrations:

1. Check logs: `docker logs relationhub-api`
2. Review migration status: `pnpm prisma migrate status`
3. Consult Prisma docs: https://www.prisma.io/docs
4. Check database logs: `docker logs relationhub-postgres`

---

*Last Updated: 2025-10-15*
*Version: 1.0.0*
*Applies to: RelationHub AI Email Generation Feature*
