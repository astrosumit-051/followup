# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-04-user-authentication/spec.md

> Created: 2025-10-04
> Version: 1.0.0

## Overview

The authentication system leverages Supabase Auth for primary authentication (email/password, OAuth), while syncing user data to our PostgreSQL database for application-specific features. The existing `User` model in Prisma schema requires minor modifications to support authentication integration.

## Schema Changes

### Existing User Model (Current State)

```prisma
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  name           String?
  profilePicture String?
  settings       Json?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  contacts   Contact[]
  emails     Email[]
  activities Activity[]
  reminders  Reminder[]
  tags       Tag[]

  @@map("users")
}
```

### Modified User Model (Required Changes)

```prisma
model User {
  id             String    @id @default(uuid())
  supabaseId     String    @unique  // NEW: Link to Supabase Auth user
  email          String    @unique
  name           String?
  profilePicture String?
  provider       String?   // NEW: OAuth provider (google, linkedin_oidc, email)
  settings       Json?
  lastLoginAt    DateTime? // NEW: Track last login timestamp
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  contacts   Contact[]
  emails     Email[]
  activities Activity[]
  reminders  Reminder[]
  tags       Tag[]

  @@index([supabaseId])
  @@index([email])
  @@map("users")
}
```

### Field Descriptions

- **supabaseId** (String, unique, required): The UUID from Supabase Auth (`auth.users.id`). This is the primary foreign key linking our User table to Supabase's authentication system.
- **email** (String, unique, required): User's email address, synced from Supabase Auth or OAuth provider.
- **name** (String, nullable): User's display name, populated from OAuth provider profile or manually set.
- **profilePicture** (String, nullable): URL to user's profile picture from OAuth provider or manual upload.
- **provider** (String, nullable): Authentication provider used (`google`, `linkedin_oidc`, `email`). Useful for analytics and conditional features.
- **settings** (Json, nullable): User preferences and application settings (theme, notifications, etc.).
- **lastLoginAt** (DateTime, nullable): Timestamp of most recent successful login, updated on each authentication.
- **createdAt** (DateTime, required): Account creation timestamp.
- **updatedAt** (DateTime, required): Last modification timestamp.

### Indexes

- **supabaseId**: Frequent lookups when verifying authentication and syncing data from Supabase.
- **email**: Required for email-based queries and preventing duplicates.

## Migration Strategy

### Migration File: `add_auth_fields_to_user`

```sql
-- Add new fields to users table
ALTER TABLE "users" ADD COLUMN "supabaseId" TEXT;
ALTER TABLE "users" ADD COLUMN "provider" TEXT;
ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- Create unique constraint on supabaseId
ALTER TABLE "users" ADD CONSTRAINT "users_supabaseId_key" UNIQUE ("supabaseId");

-- Create indexes for performance
CREATE INDEX "users_supabaseId_idx" ON "users"("supabaseId");
CREATE INDEX "users_email_idx" ON "users"("email");

-- Backfill existing users (if any) with placeholder supabaseId
-- This assumes no existing users; otherwise, manual migration needed
-- UPDATE "users" SET "supabaseId" = gen_random_uuid()::TEXT WHERE "supabaseId" IS NULL;

-- Make supabaseId required after backfill
ALTER TABLE "users" ALTER COLUMN "supabaseId" SET NOT NULL;
```

### Rollback Strategy

```sql
-- Remove indexes
DROP INDEX IF EXISTS "users_supabaseId_idx";
DROP INDEX IF EXISTS "users_email_idx";

-- Remove unique constraint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_supabaseId_key";

-- Remove columns
ALTER TABLE "users" DROP COLUMN IF EXISTS "supabaseId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "provider";
ALTER TABLE "users" DROP COLUMN IF EXISTS "lastLoginAt";
```

## Data Synchronization

### User Creation Flow

When a new user registers via Supabase Auth:

1. Supabase creates record in `auth.users` table (managed by Supabase)
2. Application receives authentication event or detects new login
3. Backend `UserService.syncUserFromSupabase()` method:
   - Extracts user metadata from Supabase JWT payload
   - Creates new User record in PostgreSQL:
     ```typescript
     await prisma.user.create({
       data: {
         supabaseId: supabaseUser.id,
         email: supabaseUser.email,
         name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
         profilePicture: supabaseUser.user_metadata?.avatar_url,
         provider: supabaseUser.app_metadata?.provider,
         lastLoginAt: new Date(),
       },
     });
     ```

### User Update Flow

When user profile is updated:

1. Frontend calls backend mutation/endpoint with updated data
2. Backend updates PostgreSQL User record via Prisma
3. Optional: Sync certain fields back to Supabase via Admin API if needed (e.g., email change)

### Supabase Auth Schema (Reference)

Supabase maintains the following tables (not directly modified by application):

- **auth.users**: Primary authentication table with email, encrypted password, OAuth tokens
- **auth.identities**: OAuth provider identities linked to users
- **auth.sessions**: Active user sessions with refresh tokens
- **auth.refresh_tokens**: Refresh token management

Our application only reads from these tables via Supabase SDK; we never write directly.

## Rationale

### Why Not Use Supabase Database for User Table?

**Considered Approach:** Use Supabase's PostgreSQL database for both auth and application data.

**Rejected Because:**
- NestJS backend requires direct Prisma connection to PostgreSQL
- Dual data sources (Supabase + separate PostgreSQL) adds complexity
- Better to maintain single source of truth for application data
- Supabase Auth is authentication-only; application user data lives in our schema

### Why supabaseId Instead of Reusing id?

**Considered Approach:** Use same UUID as Supabase Auth user ID for our User.id.

**Rejected Because:**
- Requires coordinating UUID generation between systems
- Complicates testing with mock data
- Breaks existing Prisma conventions (auto-generated UUIDs)
- Foreign key references would be fragile

**Selected Approach:** Separate `id` (application-generated) and `supabaseId` (Supabase Auth reference) for clear separation of concerns.

## Performance Considerations

- Index on `supabaseId` ensures O(log n) lookup during authentication (verified on every API request)
- Index on `email` supports quick user searches and duplicate prevention
- lastLoginAt updated asynchronously to avoid blocking authentication flow

## Security Considerations

- Never store passwords in application database (handled by Supabase Auth)
- `supabaseId` is trusted identifier; validate JWT before using
- Ensure row-level security (RLS) policies are not needed for this table (application controls access via API guards)
