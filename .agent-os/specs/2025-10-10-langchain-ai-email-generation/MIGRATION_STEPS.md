# Database Migration Steps for LangChain Email Generation Feature

> Created: 2025-10-10
> Status: Ready to Execute (Blocked - Database Not Running)

## Overview

This document outlines the steps required to apply the database schema changes for the LangChain AI email generation feature. The Prisma schema has been updated, but the migration cannot be run until the PostgreSQL database is running.

## Prerequisites

Before running the migration, ensure:

1. ✅ PostgreSQL 17+ is running (locally or via Docker)
2. ✅ Database connection string is configured in environment variables
3. ✅ You have backup of existing data (if in production)
4. ✅ Prisma CLI is installed (`pnpm install` should handle this)

## Schema Changes Summary

### New Enums Added

```prisma
enum EmailStatus {
  DRAFT
  SCHEDULED
  SENT
  FAILED
  CANCELLED
}

enum TemplateType {
  FORMAL
  CASUAL
  CUSTOM
  AI_GENERATED
  TEMPLATE_BASED
}

enum Direction {
  SENT
  RECEIVED
}
```

### Updated Models

#### Email Model (Completely Rewritten)
**Before:** Basic email fields with limited metadata
**After:** Full AI generation support with draft management

**New fields:**
- `bodyHtml` - Rich text HTML version
- `status` - EmailStatus enum (DRAFT, SENT, etc.)
- `templateType` - TemplateType enum
- `providerId` - Which LLM model generated this (e.g., "openai/gpt-4-turbo")
- `tokensUsed` - Token usage tracking
- `generatedAt` - When AI generated the template
- `sentAt` - Separated from createdAt for draft support
- `repliedAt` - Response tracking

**Removed fields:**
- `provider` - Old EmailProvider enum (no longer needed)
- `clickedAt` - Moved to tracking metadata (Phase 4)

### New Models

#### 1. EmailTemplate
User-created reusable email templates

**Fields:**
- `id` (UUID)
- `userId` (Foreign key to User)
- `name` (User-friendly template name)
- `subject`
- `body` (Plain text)
- `bodyHtml` (Rich text HTML)
- `isDefault` (Boolean - user's default template)
- `category` (String - e.g., "follow-up", "introduction", "thank-you")
- `usageCount` (Integer - track popularity)
- `createdAt`, `updatedAt`

**Indexes:**
- `userId`
- `isDefault`

#### 2. ConversationHistory
Tracks all email conversations for AI context

**Fields:**
- `id` (UUID)
- `userId` (Foreign key to User)
- `contactId` (Foreign key to Contact)
- `emailId` (Optional foreign key to Email - SetNull on delete)
- `content` (Text - concatenated subject + body)
- `direction` (Direction enum - SENT or RECEIVED)
- `timestamp`
- `metadata` (JSON - for tracking data)

**Indexes:**
- Composite `[userId, contactId]` - for efficient context retrieval
- `timestamp` - for chronological queries

## Migration Commands

### Step 1: Verify Database is Running

```bash
# Check PostgreSQL is accessible
psql -h localhost -p 5432 -U postgres -d relationhub_dev -c "SELECT 1"

# Or check Docker container
docker ps | grep postgres
```

### Step 2: Generate Migration File

```bash
cd /Users/sumitkumarsah/Downloads/followup/packages/database

# Generate migration with descriptive name
npx prisma migrate dev --name add_email_generation_tables
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Regenerate Prisma Client with new types

### Step 3: Verify Migration Success

```bash
# Check that new tables exist
psql -h localhost -p 5432 -U postgres -d relationhub_dev -c "\dt"

# Should show:
# - emails (updated)
# - email_templates (new)
# - conversation_history (new)

# Verify enums were created
psql -h localhost -p 5432 -U postgres -d relationhub_dev -c "\dT"

# Should show:
# - EmailStatus
# - TemplateType
# - Direction
```

### Step 4: Run Seed Data (Development Only)

```bash
cd /Users/sumitkumarsah/Downloads/followup/packages/database

# Run the seed script
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/relationhub_dev?schema=public" pnpm prisma db seed
```

This will populate:
- 2 sent emails with tracking metadata
- 4 email templates (Conference Follow-up, Introduction Request, Thank You Note, Monthly Check-in)
- 3 AI-generated draft emails (formal and casual variants)
- 4 conversation history entries

### Step 5: Update Backend Environment Variables

Add the following to `apps/api/.env`:

```env
# OpenRouter API Key (unified LLM access)
OPENROUTER_API_KEY=your_openrouter_key_here

# Redis for caching (if not already configured)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Note:** The spec originally called for separate `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`, but we're using OpenRouter for unified access.

### Step 6: Regenerate Prisma Client (If Needed)

```bash
cd /Users/sumitkumarsah/Downloads/followup/packages/database

# Regenerate client with new types
npx prisma generate
```

## Rollback Procedure (If Needed)

If you need to rollback this migration:

```bash
cd /Users/sumitkumarsah/Downloads/followup/packages/database

# Rollback one migration
npx prisma migrate resolve --rolled-back <migration-name>

# Or manually drop tables and enums
psql -h localhost -p 5432 -U postgres -d relationhub_dev
```

```sql
-- Rollback SQL (use with caution!)
DROP TABLE IF EXISTS conversation_history CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
-- Be careful with emails table - it has existing data!

DROP TYPE IF EXISTS "EmailStatus";
DROP TYPE IF EXISTS "TemplateType";
DROP TYPE IF EXISTS "Direction";
```

**⚠️ WARNING:** The Email table already exists with data. The migration will ADD columns, not recreate the table. Rollback requires careful handling to preserve existing email data.

## Known Issues & Considerations

### Issue 1: Existing Email Records
The emails table already has records. The migration will:
- Add new nullable columns (`bodyHtml`, `providerId`, etc.)
- Existing emails will have NULL for these fields
- This is acceptable - they represent emails sent before AI generation feature

### Issue 2: Removed `provider` Field
The old `EmailProvider` enum and `provider` field are being removed. If you have code referencing these:
1. Update code to not reference `provider` field
2. If needed, email send provider can be tracked via metadata field

### Issue 3: Environment Variable Change
Code expecting `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` needs updating to use `OPENROUTER_API_KEY`.

## Testing After Migration

### 1. Verify Schema
```bash
# Check all models exist
npx prisma db pull --force
npx prisma format
```

### 2. Test Queries
```bash
# Test that queries work
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.emailTemplate.findMany().then(console.log).finally(() => prisma.\$disconnect());
"
```

### 3. Manual API Testing
Once the backend is updated with LangChain integration:
1. Navigate to GraphQL playground: http://localhost:4000/graphql
2. Test `emailTemplates` query
3. Test `generateEmailTemplate` mutation (after Task 9 is complete)

## Next Steps After Migration

Once the database migration is complete:

1. ✅ Mark Task 1.5 as complete in tasks.md
2. ⏭️ Proceed to **Task 2: LangChain Integration Module**
   - Install dependencies: `langchain`, `@langchain/openrouter`, `ioredis`
   - Create AI module with NestJS CLI
   - Implement AIService with OpenRouter provider
3. ⏭️ Continue through tasks 3-17 as planned

## Support

If you encounter issues during migration:

1. Check Prisma migration logs: `packages/database/prisma/migrations/`
2. Verify PostgreSQL version: `psql --version` (should be 17+)
3. Check database connection: Review `DATABASE_URL` in `.env` files
4. Consult `/context/errors-solved.md` for known database issues

## References

- Main Spec: `.agent-os/specs/2025-10-10-langchain-ai-email-generation/spec.md`
- Database Schema Spec: `.agent-os/specs/2025-10-10-langchain-ai-email-generation/sub-specs/database-schema.md`
- Prisma Schema: `/packages/database/prisma/schema.prisma`
- Seed File: `/packages/database/prisma/seed.ts`
