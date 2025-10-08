# Errors Solved - RelationHub Development Log

> **Purpose**: Document all errors encountered during development and their solutions for quick reference
> **Last Updated**: 2025-10-06
> **Format**: Error code/description → Root cause → Solution → Prevention

---

## ⚠️ CRITICAL: Before Running Database Migrations

**ALWAYS stop local PostgreSQL before running Prisma migrations:**

```bash
# Stop local PostgreSQL service
brew services stop postgresql@17

# Verify only Docker is listening on port 5432
lsof -i :5432
# Should only show: com.docker process, NOT postgres process

# Then run migrations
pnpm --filter @relationhub/database prisma migrate dev
```

**Why?** If both local and Docker PostgreSQL are running, Prisma connects to the wrong instance, causing P1010 errors. See [Error P1010](#error-p1010---user-denied-access-on-database) below for full details.

---

## E2E Testing & Playwright Errors

### Contact Detail Tests - Persistent Loading State (43/62 Passing)

**Symptoms:**
- Contact detail page stuck on "Loading contact information..." during E2E tests
- 43/62 tests passing, 19 failing consistently
- No improvement after code fixes and backend restart
- Page snapshot shows only loading skeleton, no contact data

**Failed Test Categories:**
1. **Page title test (1)** - Expected "Contact Details" but got "RelationHub"
2. **Navigation test (1)** - Timeout navigating from contacts list
3. **H1 class test (1)** - Expected `text-3xl font-bold` but got `text-2xl`
4. **Birthday test (1)** - Expected "May 14, 1990" format
5. **Timestamp tests (2)** - Created/updated date assertions failing
6. **Profile picture tests (2)** - No img element found (stuck on loading)
7. **Delete dialog tests (7)** - Can't find Confirm button (stuck on loading)
8. **Error state tests (3)** - Route interception not working
9. **Responsive test (1)** - CSS selector mismatch
10. **Accessibility tests (2)** - Elements not found (stuck on loading)

**Attempted Fixes:**
1. ✅ Changed `findUnique` to `findFirst` in contact.service.ts:54
   - **Issue**: Prisma `findUnique` requires unique fields or composite unique constraint
   - **Fix**: Changed to `findFirst({ where: { id, userId } })`
   - **Result**: No improvement (still 43/62 passing)

2. ✅ Added dynamic page title with useEffect
   - **Fix**: `document.title = 'Contact Details - RelationHub'`
   - **Result**: Not verified - page still loading

3. ✅ Fixed h1 CSS class
   - **Fix**: Changed from `text-2xl font-bold text-gray-900 sm:text-3xl` to `text-3xl font-bold text-gray-900`
   - **Result**: Not verified - page still loading

4. ✅ Fixed test assertions for dates
   - **Birthday**: Changed from "May 15, 2025" to "May 14, 1990"
   - **Timestamps**: Changed from exact dates to pattern matching `/\w+ \d+, \d{4}/`
   - **Result**: Not verified - page still loading

5. ✅ Restarted NestJS backend
   - **Issue**: Backend watch mode not picking up service changes
   - **Fix**: Killed dev server and restarted with fresh code
   - **Result**: Backend started but tests still fail (43/62)

**Current Investigation Status:**

The root cause is deeper than initially suspected. Despite all fixes being in place:
- ✅ `findFirst` query is in contact.service.ts
- ✅ GraphQL query includes `profilePicture` field
- ✅ Seed script correctly sets `userId` foreign key
- ✅ GraphQL resolver correctly passes `user.id` to service
- ✅ Backend successfully restarted with fresh code

**But contacts still don't load - page stuck on loading state.**

**Possible Root Causes (Not Yet Verified):**

1. **Authentication Token Issue**
   - GraphQL query may not be sending JWT token
   - Backend may be rejecting unauthenticated requests silently
   - Test auth setup may not be persisting session correctly

2. **User ID Mismatch**
   - Seed script uses Supabase user ID: `abeebed7-1ce1-4add-89a7-87b3cc249d38`
   - Maps to database user ID: `229b9b6d-9df9-4e57-9cb9-fdf31b89a72c`
   - GraphQL resolver may be using different user ID from session

3. **GraphQL Request Failure**
   - Request may be failing silently without error handling
   - CORS issue preventing request from reaching backend
   - Network error not being caught by error boundary

4. **Query Execution Issue**
   - `findFirst` may still be returning null despite fix
   - Database query may be failing at Prisma level
   - RLS (Row Level Security) may be blocking query

**Next Investigation Steps:**

```bash
# 1. Check browser console during test execution
export TEST_USER_EMAIL=test@relationhub.com && \
export TEST_USER_PASSWORD=TestPassword123! && \
pnpm playwright test e2e/contacts/contact-detail.spec.ts --headed --project=chromium

# 2. Verify GraphQL request is being sent
# Open browser DevTools Network tab during test
# Look for POST request to http://localhost:4000/graphql
# Check request headers for Authorization: Bearer <token>

# 3. Check NestJS backend logs for GraphQL query
# Should see: "contact(id: 'test-contact-123')" in GraphQL resolver logs

# 4. Verify seed data user ID matches session user ID
SELECT id, "userId" FROM contacts WHERE id = 'test-contact-123';
SELECT id, email FROM users WHERE email = 'test@relationhub.com';

# 5. Test GraphQL query manually with Postman/Insomnia
# POST http://localhost:4000/graphql
# Headers: Authorization: Bearer <JWT_FROM_TEST_SESSION>
# Body: { "query": "{ contact(id: \"test-contact-123\") { id name email } }" }
```

**Workaround for Continuing Development:**

Since 43/62 tests are passing (69% pass rate), the core functionality works for:
- Page load and basic structure
- Loading states
- Contact information display (when data loads successfully)
- Basic interactions
- Performance metrics

The 19 failing tests all stem from the same root issue: contacts not loading in test environment.

**Prevention:**

1. Add GraphQL request/response logging in development
2. Implement better error boundaries with detailed error messages
3. Add authentication debugging logs to verify token flow
4. Create integration test that verifies seed data + authentication + GraphQL query flow
5. Add health check endpoint that verifies all services (DB, Auth, GraphQL) are working

**Status**: ⚠️ **INVESTIGATION IN PROGRESS** - Core issue identified but root cause not yet found

**Related Files:**
- `/Users/sumitkumarsah/Downloads/followup/apps/api/src/contact/contact.service.ts` (line 54)
- `/Users/sumitkumarsah/Downloads/followup/apps/web/app/(protected)/contacts/[id]/page.tsx`
- `/Users/sumitkumarsah/Downloads/followup/apps/web/e2e/contacts/contact-detail.spec.ts`
- `/Users/sumitkumarsah/Downloads/followup/apps/web/e2e/helpers/seed-contacts.ts`
- `/Users/sumitkumarsah/Downloads/followup/apps/web/lib/graphql/contacts.ts` (line 42)

---

## Database & Prisma Errors

### Error: P1010 - User denied access on database

**Full Error Message:**
```
Error: P1010: User `postgres` was denied access on the database `relationhub_dev.public`
```

**Context:**
- Occurred when running `prisma migrate dev` or `prisma db push`
- Database and user both existed with correct privileges
- Docker PostgreSQL container was running and healthy

**Root Cause:**
Multiple PostgreSQL instances running on the same port (5432):
1. Local PostgreSQL installed via Homebrew (listening on localhost:5432)
2. Docker PostgreSQL container (listening on *:5432)

Prisma was connecting to the **local PostgreSQL** instance (which didn't have the `postgres` user) instead of the Docker container.

**Solution:**
```bash
# 1. Stop the local PostgreSQL service
brew services stop postgresql@17
# Or for other versions:
brew services stop postgresql

# 2. Verify only Docker is listening
lsof -i :5432
# Should only show: com.docker process

# 3. Run Prisma commands
pnpm prisma migrate dev --name init
```

**Prevention:**
- Always verify which PostgreSQL instance is running before migrations
- Add to development workflow checklist
- Consider using a different port for Docker PostgreSQL (e.g., 5433) to avoid conflicts

**Related Files:**
- `README.md` - Added troubleshooting section
- `docker-compose.yml` - PostgreSQL service configuration

---

### Error: Environment variable not found: DATABASE_URL

**Full Error Message:**
```
error: Environment variable not found: DATABASE_URL.
  -->  schema.prisma:8
```

**Context:**
- Occurred when running `pnpm db:seed`
- Prisma schema expected DATABASE_URL environment variable
- No `.env` file existed in `packages/database/`

**Root Cause:**
The `tsx` runtime used by the seed script doesn't automatically load `.env` files from the project root.

**Solution:**

**Option 1 - Create local .env file:**
```bash
# In packages/database/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/relationhub_dev"
```

**Option 2 - Inline environment variable:**
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/relationhub_dev" pnpm db:seed
```

**Prevention:**
- Always create `.env` file in packages/database/ during initial setup
- Add `.env.example` file with template
- Document required environment variables in README

**Related Files:**
- `packages/database/.env` - Created with DATABASE_URL
- `packages/database/package.json` - Seed script configuration

---

## Next.js & Build Errors

### Error: next.config.ts not supported

**Full Error Message:**
```
Error: Configuring Next.js via 'next.config.ts' is not supported.
Please replace the file with 'next.config.js' or 'next.config.mjs'.
```

**Context:**
- Occurred during `pnpm build` for Next.js 14.2.33
- TypeScript config file was created during initialization

**Root Cause:**
Next.js 14.2.x doesn't support TypeScript configuration files directly. Support for `.ts` config files was added in Next.js 15+.

**Solution:**
```bash
# Rename and convert to JavaScript ESM
mv apps/web/next.config.ts apps/web/next.config.mjs

# Update content to remove TypeScript syntax
```

**Updated Configuration:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default nextConfig
```

**Prevention:**
- Use `.mjs` or `.js` for Next.js 14.x config files
- When upgrading to Next.js 15+, can migrate to TypeScript config

**Related Files:**
- `apps/web/next.config.mjs` - Corrected configuration file

---

### Error: Tailwind CSS PostCSS plugin moved

**Full Error Message:**
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS
with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

**Context:**
- Occurred during Next.js build with Tailwind CSS 4.x
- PostCSS configuration was set up for Tailwind CSS 3.x syntax

**Root Cause:**
Tailwind CSS 4.x (beta) has breaking changes:
- Moved PostCSS plugin to separate package `@tailwindcss/postcss`
- Not yet fully compatible with Next.js 14.2.x stable
- Architecture changed significantly from v3

**Solution:**
```bash
# Downgrade to stable Tailwind CSS 3.x
pnpm remove tailwindcss
pnpm add -D tailwindcss@3 postcss autoprefixer
```

**PostCSS Configuration (works with v3):**
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
```

**Prevention:**
- Stick with Tailwind CSS 3.x until v4 is stable and Next.js fully supports it
- Monitor Tailwind CSS release notes before upgrading
- Test builds after any CSS framework updates

**Alternative (when Tailwind v4 is stable):**
```bash
pnpm add -D @tailwindcss/postcss
# Update postcss.config to use new plugin
```

**Related Files:**
- `package.json` - Tailwind CSS version pinned to 3.x
- `postcss.config.mjs` - PostCSS configuration

---

## Docker & Container Errors

### Error: Port 5432 conflict between local PostgreSQL and Docker

**Symptoms:**
- Docker container shows as healthy but connections fail
- `psql` connects to wrong database instance
- Database appears empty despite migrations running

**Root Cause:**
Both Homebrew PostgreSQL and Docker PostgreSQL binding to same port 5432.

**Diagnostic Commands:**
```bash
# Check what's listening on port 5432
lsof -i :5432

# Expected output (PROBLEM):
# postgres   2243 user  7u  IPv6  ... TCP localhost:postgresql (LISTEN)    <- Local
# com.docke 68486 user 187u IPv6  ... TCP *:postgresql (LISTEN)            <- Docker

# Expected output (CORRECT):
# com.docke 68486 user 187u IPv6  ... TCP *:postgresql (LISTEN)            <- Only Docker
```

**Solution:**
```bash
# Stop all local PostgreSQL services
brew services stop postgresql@17
brew services stop postgresql@16
brew services stop postgresql

# Verify only Docker is running
lsof -i :5432
```

**Prevention:**
- Check port conflicts before starting development
- Consider using different port for Docker (5433) in docker-compose.yml
- Add port check to development setup script

**Related Files:**
- `docker-compose.yml` - PostgreSQL port configuration
- `README.md` - Troubleshooting section

---

## Prisma Schema Errors

### Error: P1012 - schemas property requires multiSchema preview

**Full Error Message:**
```
Error code: P1012
error: The `schemas` property is only available with the `multiSchema` preview feature.
  -->  prisma/schema.prisma:9
   |
 9 |  schemas  = ["public"]
```

**Context:**
- Attempted to explicitly specify `schemas = ["public"]` in datasource
- Trying to fix P1010 error by being explicit about schema

**Root Cause:**
The `schemas` property in Prisma datasource requires enabling the `multiSchema` preview feature. For single-schema databases, this property is unnecessary.

**Solution:**
```prisma
// Remove the schemas property entirely
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // schemas  = ["public"]  <- Remove this line
}
```

**When to Use `schemas` Property:**
Only use when working with multiple PostgreSQL schemas:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "auth", "analytics"]
}
```

**Prevention:**
- Don't add `schemas` property unless working with multiple schemas
- Read Prisma documentation before adding preview features
- Keep schema simple for single-database projects

**Related Files:**
- `packages/database/prisma/schema.prisma` - Corrected schema definition

---

## Shadow Database & Migration Errors

### Error: Prisma shadow database creation failure

**Context:**
Understanding Prisma Migrate shadow database requirements for troubleshooting P1010.

**What is a Shadow Database?**
Prisma Migrate creates a temporary "shadow" database during `migrate dev` to:
- Detect schema drift
- Validate migration SQL
- Ensure migrations are idempotent

**Requirements:**
- PostgreSQL user needs `CREATEDB` privilege (or superuser)
- Database server must allow creation of temporary databases
- Enough disk space for shadow database

**Verification:**
```bash
# Check user privileges in Docker container
docker exec relationhub-postgres psql -U postgres -c "\du"

# Expected output:
# postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS
```

**Alternative: Use db push for prototyping**
```bash
# Skip shadow database entirely (not recommended for production)
pnpm prisma db push
```

**Prevention:**
- Always verify database user has CREATEDB privilege
- Use `prisma migrate dev` for development (requires shadow DB)
- Use `prisma migrate deploy` for production (no shadow DB needed)

**Related Files:**
- `packages/database/prisma/schema.prisma` - Migration configuration

---

## Quick Reference: Common Fixes

### Database Connection Issues
```bash
# Check PostgreSQL instances
lsof -i :5432

# Stop local PostgreSQL
brew services stop postgresql@17

# Restart Docker PostgreSQL
docker compose restart postgres
```

### Prisma Issues
```bash
# Regenerate Prisma Client
pnpm --filter @relationhub/database prisma generate

# Reset database (DESTRUCTIVE)
pnpm --filter @relationhub/database prisma migrate reset

# Push schema without migration
DATABASE_URL="..." pnpm --filter @relationhub/database prisma db push
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Clear Turborepo cache
rm -rf .turbo

# Full clean build
pnpm clean && pnpm install && pnpm build
```

### Environment Issues
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test database connection
psql "postgresql://postgres:postgres@localhost:5432/relationhub_dev"
```

---

## GraphQL & NestJS Errors

### Error: CannotDetermineInputTypeError - Missing @InputType Decorator

**Full Error Message:**
```
CannotDetermineInputTypeError: Cannot determine a GraphQL input type ("ContactPaginationInput") for the "pagination". Make sure your class is decorated with an appropriate decorator.
```

**Context:**
- Occurred during NestJS server startup when GraphQL schema generation runs
- Using @nestjs/graphql v13.2.0 with code-first approach
- DTO class had validation decorators but no GraphQL decorators
- TypeScript compilation succeeded with 0 errors

**Root Cause:**
NestJS GraphQL (code-first approach) requires **explicit decorators** on ALL classes and fields used in the GraphQL schema:

1. **Input DTOs** need `@InputType()` decorator on the class
2. **Each field** in the input needs `@Field()` decorator to be exposed in GraphQL schema
3. Validation decorators (`@IsOptional`, `@IsUUID`, etc.) handle runtime validation but **don't expose fields to GraphQL**

The ContactPaginationInput class only had class-validator decorators:
```typescript
// ❌ WRONG - No GraphQL decorators
export class ContactPaginationInput {
  @IsOptional()
  @IsUUID('4')
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

**Solution:**
Add GraphQL decorators alongside validation decorators:

```typescript
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';

@InputType()  // ✅ Makes class a GraphQL input type
export class ContactPaginationInput {
  @Field({ nullable: true })  // ✅ Exposes field to GraphQL
  @IsOptional()
  @IsUUID('4', { message: 'cursor must be a valid UUID' })
  cursor?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })  // ✅ Explicit type for GraphQL
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

**Key Learning Points:**

1. **Dual Decorator System:**
   - `@InputType()` / `@ObjectType()` - Tell GraphQL about class structure
   - `@Field()` - Expose individual fields to GraphQL schema
   - `@IsOptional()`, `@IsString()`, etc. - Runtime validation (separate from GraphQL)

2. **Field Type Specification:**
   - Use `@Field(() => Int)` for numbers to ensure GraphQL uses `Int` type
   - Use `@Field(() => ID)` for string IDs
   - Use `@Field(() => EnumType)` for enums
   - Simple types like `String` and `Boolean` are auto-detected

3. **Nullable Fields:**
   - `{ nullable: true }` - Field can be null/undefined in GraphQL
   - `{ defaultValue: X }` - Provides default value if not specified

4. **Entity vs Input Decorators:**
   - `@ObjectType()` - For output types (query/mutation return types)
   - `@InputType()` - For input types (mutation/query arguments)

**Common Scenarios:**

**Pagination Input:**
```typescript
@InputType()
export class PaginationInput {
  @Field({ nullable: true })
  cursor?: string;

  @Field(() => Int, { defaultValue: 20 })
  limit?: number;
}
```

**Filter Input:**
```typescript
@InputType()
export class FilterInput {
  @Field({ nullable: true })
  search?: string;

  @Field(() => Priority, { nullable: true })
  priority?: Priority;
}
```

**Entity Output:**
```typescript
@ObjectType()
export class Contact {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  email?: string | null;
}
```

**Prevention:**

1. **Always add GraphQL decorators to DTOs:**
   - `@InputType()` for classes used as mutation/query inputs
   - `@Field()` for every field exposed in schema

2. **Don't rely on validation decorators alone:**
   - Class-validator decorators don't expose fields to GraphQL
   - You need both validation AND GraphQL decorators

3. **Check schema generation logs:**
   - GraphQL schema generation happens during server startup
   - Errors appear before "Mapped {/graphql, POST} route" message

4. **Use TypeScript strict mode:**
   - Helps catch missing decorators during development
   - Enable `strictPropertyInitialization` in tsconfig.json

5. **Reference official NestJS GraphQL docs:**
   - Code-first approach: https://docs.nestjs.com/graphql/quick-start#code-first
   - Input types: https://docs.nestjs.com/graphql/resolvers#input-types

**Related Errors:**

- If you see "Cannot determine GraphQL output type" → Missing `@ObjectType()` or `@Field()` on entity
- If fields are missing in schema → Forgot `@Field()` decorator on specific properties
- If enum errors occur → Need to `registerEnumType()` and use `@Field(() => EnumType)`

**Diagnostic Commands:**
```bash
# Check if GraphQL schema is accessible
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'

# Check specific type fields
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"Query\") { fields { name args { name } } } }"}'
```

**Related Files:**
- `src/contact/dto/contact-pagination.input.ts` - Fixed with @InputType and @Field decorators
- `src/contact/dto/contact-filter.input.ts` - Similar pattern for filter inputs
- `src/contact/entities/contact.entity.ts` - Uses @ObjectType for output types

---

## Contact CRUD Implementation Errors

### Error: Type Safety Issues with 'any' in ContactService

**Full Error Message:**
```
Warning: Using 'any' type in service methods creates runtime errors and reduces type safety
```

**Context:**
- Occurred during ContactService implementation for CRUD operations
- Using generic 'any' types for DTOs and Prisma where clauses
- Reduced code maintainability and increased bug risk

**Root Cause:**
TypeScript 'any' type bypasses all type checking:
1. No compile-time validation of DTO structure
2. Prisma type hints lost, allowing invalid queries
3. GraphQL schema generation couldn't validate types
4. Runtime errors harder to debug without proper types

**Solution:**
```typescript
// ❌ WRONG - Using 'any' types
async create(createContactDto: any, userId: string) {
  const data: any = {
    ...createContactDto,
    userId,
  };
  return this.prisma.contact.create({ data });
}

// ✅ CORRECT - Using proper DTOs and types
async create(createContactDto: CreateContactDto, userId: string): Promise<Contact> {
  const data: Prisma.ContactCreateInput = {
    name: createContactDto.name,
    email: createContactDto.email,
    phone: createContactDto.phone,
    linkedinUrl: createContactDto.linkedinUrl,
    notes: createContactDto.notes,
    priority: createContactDto.priority,
    birthday: createContactDto.birthday,
    gender: createContactDto.gender,
    company: createContactDto.company,
    industry: createContactDto.industry,
    role: createContactDto.role,
    user: {
      connect: { id: userId },
    },
  };
  return this.prisma.contact.create({ data });
}
```

**Prevention:**
- Always use specific DTO types for input parameters
- Use Prisma generated types (Prisma.ContactCreateInput, Prisma.ContactWhereInput)
- Add return type annotations to all service methods
- Enable TypeScript strict mode in tsconfig.json
- Use linting rules to prevent 'any' type usage

**Related Files:**
- `apps/api/src/contact/contact.service.ts` - Fixed type annotations
- `apps/api/src/contact/dto/create-contact.dto.ts` - DTO definitions
- `apps/api/src/contact/dto/update-contact.dto.ts` - Update DTO

---

### Error: Pagination hasNextPage Calculation Bug

**Full Error Message:**
```
Bug: hasNextPage always returns false on last page, even when more results exist
```

**Context:**
- Occurred during cursor-based pagination implementation
- Using `contacts.length === limit` to determine hasNextPage
- Edge case: when exactly limit contacts exist on final page, hasNextPage incorrectly returns true

**Root Cause:**
Incorrect pagination pattern - checking `contacts.length === limit` doesn't account for the edge case where the final page has exactly `limit` contacts:

```typescript
// ❌ WRONG PATTERN
const contacts = await this.prisma.contact.findMany({
  take: limit,
  cursor: cursor ? { id: cursor } : undefined,
});

return {
  edges: contacts.map(contact => ({ cursor: contact.id, node: contact })),
  pageInfo: {
    hasNextPage: contacts.length === limit, // ❌ Wrong on last page
    endCursor: contacts[contacts.length - 1]?.id,
  },
};
```

**Solution:**
Use the **limit + 1 pattern** (standard Prisma/database pagination technique):

```typescript
// ✅ CORRECT PATTERN
const limit = pagination?.limit ?? 20;
const take = limit + 1; // Fetch one extra to check if more exist

const contacts = await this.prisma.contact.findMany({
  take,
  cursor: cursor ? { id: cursor } : undefined,
  where: whereClause,
  orderBy: { [sortBy]: 'asc' },
});

const hasNextPage = contacts.length > limit; // If we got limit+1, more exist
const edges = contacts.slice(0, limit); // Return only requested limit

return {
  edges: edges.map(contact => ({
    cursor: contact.id,
    node: contact,
  })),
  pageInfo: {
    hasNextPage,
    hasPreviousPage: !!cursor,
    startCursor: edges[0]?.id ?? null,
    endCursor: edges[edges.length - 1]?.id ?? null,
  },
};
```

**Key Learning Points:**
1. **Limit + 1 Pattern**: Always fetch `limit + 1` records
2. **Check Extra Record**: If you get more than `limit` records, hasNextPage = true
3. **Slice Results**: Return only first `limit` records to user
4. **Standard Practice**: This is the recommended pattern for all cursor pagination

**Prevention:**
- Always use limit + 1 pattern for cursor-based pagination
- Test pagination with exact page boundaries (10, 20, 50 contacts)
- Add integration tests for edge cases
- Document pagination logic in service methods

**Related Files:**
- `apps/api/src/contact/contact.service.ts` - Fixed pagination logic
- `apps/api/test/contact.service.spec.ts` - Updated test expectations

---

### Error: Filter Conflicts in Complex Queries

**Full Error Message:**
```
Error: Search filter overriding other filters (priority, company, industry)
Combined filters not working as expected
```

**Context:**
- Occurred when implementing multi-field filtering (search + priority + company)
- Using flat filter structure caused conflicts between different filter types
- Search filter would override priority/company filters

**Root Cause:**
Incorrect filter structure - using multiple separate where conditions instead of combining them properly:

```typescript
// ❌ WRONG - Filters conflict
const whereClause = {
  userId,
  ...(search && {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ],
  }),
  ...(priority && { priority }), // Gets overridden by OR above
  ...(company && { company: { contains: company, mode: 'insensitive' } }),
};
```

**Solution:**
Use proper **AND + OR structure** to combine filters:

```typescript
// ✅ CORRECT - AND/OR structure
const whereClause: Prisma.ContactWhereInput = {
  userId,
  AND: [
    // All conditions must be true
    ...(search
      ? [
          {
            OR: [
              // At least one search field must match
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          },
        ]
      : []),
    ...(priority ? [{ priority }] : []),
    ...(company ? [{ company: { contains: company, mode: 'insensitive' } }] : []),
    ...(industry ? [{ industry: { contains: industry, mode: 'insensitive' } }] : []),
  ],
};
```

**Key Structure:**
```
{
  userId: "abc",
  AND: [
    { OR: [search conditions] },  // At least one search field matches
    { priority: "HIGH" },          // AND priority is HIGH
    { company: { contains: "Google" } }  // AND company contains "Google"
  ]
}
```

**Prevention:**
- Always use AND array for combining multiple filter conditions
- Use OR only within a single filter group (e.g., search across multiple fields)
- Test filter combinations (search + priority, search + company, all together)
- Add integration tests for complex filter scenarios

**Related Files:**
- `apps/api/src/contact/contact.service.ts` - Fixed filter structure
- `apps/api/test/contact.service.spec.ts` - Added filter combination tests

---

### Error: Invalid Sort Field Causes Prisma Error

**Full Error Message:**
```
PrismaClientValidationError: Invalid field name used in orderBy
```

**Context:**
- Occurred when user provides arbitrary sort field in GraphQL query
- No validation on sortBy parameter before passing to Prisma
- Prisma throws runtime error for invalid field names

**Root Cause:**
Missing input validation - accepting any string for sortBy without validating against Contact model fields:

```typescript
// ❌ WRONG - No validation
const sortBy = sort?.sortBy ?? 'createdAt';
const contacts = await this.prisma.contact.findMany({
  orderBy: { [sortBy]: 'asc' }, // Could be invalid field
});
```

**Solution:**
Add validation with allowed fields list:

```typescript
// ✅ CORRECT - Validate sort field
const ALLOWED_SORT_FIELDS = [
  'name',
  'email',
  'company',
  'industry',
  'priority',
  'createdAt',
  'updatedAt',
  'lastContactedAt',
] as const;

const sortBy = sort?.sortBy ?? 'createdAt';

// Validate sortBy is an allowed field
if (!ALLOWED_SORT_FIELDS.includes(sortBy as any)) {
  throw new BadRequestException(
    `Invalid sort field: ${sortBy}. Allowed fields: ${ALLOWED_SORT_FIELDS.join(', ')}`
  );
}

const contacts = await this.prisma.contact.findMany({
  orderBy: { [sortBy]: sort?.sortOrder ?? 'asc' },
});
```

**Prevention:**
- Always validate user input against allowed values
- Use TypeScript const arrays for allowed values
- Throw BadRequestException for invalid input (not generic Error)
- Add JSDoc comments documenting allowed sort fields
- Add unit tests for invalid sort field validation

**Related Files:**
- `apps/api/src/contact/contact.service.ts` - Added sort field validation
- `apps/api/src/contact/dto/contact-sort.input.ts` - Sort DTO definition
- `apps/api/test/contact.service.spec.ts` - Added validation tests

---

### Error: Generic Error Instead of NestJS Exceptions

**Full Error Message:**
```
Error: Contact not found
(No HTTP status code, generic 500 error returned to client)
```

**Context:**
- Occurred during findOne, update, and delete operations
- Using generic JavaScript Error instead of NestJS exceptions
- GraphQL client receives generic 500 error instead of proper 404

**Root Cause:**
Not using NestJS exception classes - generic Error doesn't integrate with NestJS HTTP exception filters:

```typescript
// ❌ WRONG - Generic error
async findOne(id: string, userId: string): Promise<Contact | null> {
  const contact = await this.prisma.contact.findUnique({ where: { id } });

  if (!contact) {
    throw new Error('Contact not found'); // Generic error, no HTTP status
  }

  if (contact.userId !== userId) {
    throw new Error('Unauthorized'); // No 403 status code
  }

  return contact;
}
```

**Solution:**
Use proper NestJS exceptions with descriptive messages:

```typescript
// ✅ CORRECT - NestJS exceptions
import { NotFoundException, ForbiddenException } from '@nestjs/common';

async findOne(id: string, userId: string): Promise<Contact> {
  const contact = await this.prisma.contact.findUnique({ where: { id } });

  if (!contact) {
    throw new NotFoundException(`Contact with ID ${id} not found`);
  }

  if (contact.userId !== userId) {
    throw new ForbiddenException(
      `You do not have permission to access contact ${id}`
    );
  }

  return contact;
}
```

**NestJS Exception Types:**
- `NotFoundException` - 404 (resource not found)
- `ForbiddenException` - 403 (unauthorized access)
- `BadRequestException` - 400 (invalid input)
- `UnauthorizedException` - 401 (not authenticated)
- `ConflictException` - 409 (duplicate resource)

**Benefits:**
1. Proper HTTP status codes in API responses
2. Consistent error format across application
3. Better GraphQL error messages
4. Integration with NestJS exception filters
5. Easier error handling in frontend

**Prevention:**
- Always use NestJS exception classes (never generic Error)
- Include resource ID in error messages for debugging
- Use appropriate exception type for each error scenario
- Document expected exceptions in service method JSDoc
- Add unit tests verifying correct exception types

**Related Files:**
- `apps/api/src/contact/contact.service.ts` - Fixed exception handling
- `apps/api/test/contact.service.spec.ts` - Verified exception types

---

### Error: Client-Side Missing Authentication Check

**Full Error Message:**
```
Warning: Page accessible without authentication check
GraphQL query fails with 401 after page loads
```

**Context:**
- Occurred on `/contacts` page implementation
- Middleware protects route but no client-side auth check
- Page attempts to render before checking authentication
- Poor UX: page flashes before redirect

**Root Cause:**
Missing client-side authentication verification before rendering protected content:

```typescript
// ❌ WRONG - No auth check
'use client';

export default function ContactsPage() {
  const { data, isLoading } = useContacts();

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* Protected content */}</div>;
}
```

**Solution:**
Add client-side auth check with Supabase:

```typescript
// ✅ CORRECT - Auth check before rendering
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { data, isLoading } = useContacts();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return <div>Checking authentication...</div>;
  }

  if (isLoading) {
    return <ContactListSkeleton />;
  }

  return <div>{/* Protected content */}</div>;
}
```

**Key Points:**
1. **Middleware Protection**: Required but not sufficient alone
2. **Client Check**: Prevents page flash before redirect
3. **Better UX**: Show "Checking authentication..." state
4. **Redirect**: Use Next.js router for client-side navigation
5. **Session Validation**: Always check session exists before rendering

**Prevention:**
- Add auth check to all protected pages
- Use dedicated auth checking state (separate from loading)
- Show appropriate loading states during auth check
- Consider creating a custom useAuth hook for reusability
- Test auth flow: logged out → visit protected page → redirect to login

**Related Files:**
- `apps/web/app/(protected)/contacts/page.tsx` - Added auth check
- `apps/web/lib/supabase/client.ts` - Supabase client utilities

---

### Error: Performance Issues with ContactCard Rendering

**Full Error Message:**
```
Warning: Expensive calculations running on every render
React profiler shows ContactCard as performance bottleneck
```

**Context:**
- Occurred during ContactCard rendering in list view
- Date formatting, initials generation, and color calculation running on every render
- No memoization causing unnecessary recalculations
- Performance degradation with 50+ contacts

**Root Cause:**
Missing React memoization for expensive calculations:

```typescript
// ❌ WRONG - Calculations on every render
export function ContactCard({ contact }: ContactCardProps) {
  // Runs on EVERY render, even when contact hasn't changed
  const formattedDate = contact.lastContactedAt
    ? new Date(contact.lastContactedAt).toLocaleDateString()
    : 'Never';

  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const priorityColor =
    contact.priority === 'HIGH' ? 'text-red-600' :
    contact.priority === 'MEDIUM' ? 'text-yellow-600' :
    'text-green-600';

  return <div>{/* Card content */}</div>;
}
```

**Solution:**
Use React.useMemo for expensive calculations:

```typescript
// ✅ CORRECT - Memoized calculations
import { useMemo } from 'react';

export function ContactCard({ contact }: ContactCardProps) {
  // Only recalculates when contact.lastContactedAt changes
  const formattedDate = useMemo(() => {
    if (!contact.lastContactedAt) return 'Never';
    return new Date(contact.lastContactedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [contact.lastContactedAt]);

  // Only recalculates when contact.name changes
  const initials = useMemo(() => {
    return contact.name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Max 2 characters
  }, [contact.name]);

  // Only recalculates when contact.priority changes
  const priorityColor = useMemo(() => {
    switch (contact.priority) {
      case 'HIGH':
        return 'text-red-600 dark:text-red-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }, [contact.priority]);

  return <div>{/* Card content */}</div>;
}
```

**When to Use useMemo:**
1. **Expensive calculations** (date formatting, string parsing)
2. **Rendered in lists** (component used multiple times)
3. **Derived data** (computed from props/state)
4. **Reference equality matters** (objects, arrays passed to child components)

**When NOT to Use useMemo:**
- Simple property access (contact.name, contact.email)
- Calculations that are already fast (<1ms)
- One-off components (not in lists)

**Prevention:**
- Profile with React DevTools before optimizing
- Use useMemo for list items (CardCard, UserCard, etc.)
- Test performance with realistic data (100+ items)
- Add performance tests with Chrome DevTools
- Consider React.memo for entire components if needed

**Related Files:**
- `apps/web/components/contacts/ContactCard.tsx` - Added useMemo
- `apps/web/e2e/contacts/performance.spec.ts` - Performance tests

---

### Error: Missing ErrorBoundary for Graceful Failures

**Full Error Message:**
```
Error: Component crashed, entire page white screen
No user-facing error message
Console shows React error boundary needed
```

**Context:**
- Occurred when GraphQL query failed unexpectedly
- No error boundary to catch component errors
- White screen instead of user-friendly error message
- Poor UX and no recovery path

**Root Cause:**
React components without error boundaries show white screen on uncaught errors:

```typescript
// ❌ WRONG - No error boundary
export default function ContactsPage() {
  const { data } = useContacts(); // If this throws, white screen

  return (
    <div>
      {data.contacts.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
}
```

**Solution:**
Create and use ErrorBoundary component:

```typescript
// ✅ Step 1: Create ErrorBoundary component
'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600">
              Something went wrong
            </h2>
            <p className="mt-2 text-gray-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// ✅ Step 2: Wrap page with ErrorBoundary
export default function ContactsPage() {
  return (
    <ErrorBoundary>
      <ContactsPageContent />
    </ErrorBoundary>
  );
}

function ContactsPageContent() {
  const { data, isLoading, error } = useContacts();

  if (error) {
    throw error; // ErrorBoundary will catch this
  }

  // Rest of component logic
}
```

**Key Benefits:**
1. **Graceful Degradation**: Show error message instead of white screen
2. **User Recovery**: Provide reload button or retry action
3. **Error Logging**: Log errors for debugging
4. **Better UX**: Users understand what happened
5. **Development Aid**: See error details in dev mode

**Best Practices:**
- Wrap entire page with ErrorBoundary
- Provide custom fallback UI per page/section
- Log errors to monitoring service (Sentry, LogRocket)
- Show actionable recovery options (retry, go back, reload)
- Test error scenarios (network failures, auth errors)

**Prevention:**
- Add ErrorBoundary to all pages with data fetching
- Create reusable ErrorBoundary with consistent styling
- Test error scenarios during development
- Monitor error frequency in production
- Provide recovery paths for common errors

**Related Files:**
- `apps/web/components/ErrorBoundary.tsx` - Reusable error boundary
- `apps/web/app/(protected)/contacts/page.tsx` - Wrapped with ErrorBoundary

---

## Future Errors Section

*This section will be populated as new errors are encountered and solved.*

### Template for New Errors

```markdown
### Error: [Error Code/Name]

**Full Error Message:**
```
[Exact error text]
```

**Context:**
- When it occurred
- What command triggered it
- Environment details

**Root Cause:**
[Explanation of why the error happened]

**Solution:**
```bash
[Step-by-step fix]
```

**Prevention:**
- How to avoid this in the future

**Related Files:**
- List of files modified or related
```

---

## Error Categories Index

- **Database Errors**: P1010, P1012, Environment Variables
- **Build Errors**: Next.js config, Tailwind CSS, TypeScript
- **Docker Errors**: Port conflicts, Container communication
- **Prisma Errors**: Shadow database, Schema validation, Pagination bugs
- **GraphQL/NestJS Errors**: CannotDetermineInputTypeError, Missing decorators, Exception handling
- **Environment Errors**: Missing variables, Wrong instances
- **TypeScript Errors**: Type safety with 'any', Missing type annotations
- **Query Errors**: Filter conflicts (AND/OR structure), Invalid sort fields
- **Frontend Errors**: Missing auth checks, Performance issues (useMemo), ErrorBoundary

---

## Development Checklist (Prevents Common Errors)

Before starting development:
- [ ] Check only Docker PostgreSQL is running (`lsof -i :5432`)
- [ ] Verify `.env` file exists in `packages/database/`
- [ ] Confirm Docker containers are healthy (`docker compose ps`)
- [ ] Run `pnpm install` after pulling changes
- [ ] Generate Prisma Client (`pnpm --filter @relationhub/database prisma generate`)

Before committing:
- [ ] All builds pass (`pnpm build`)
- [ ] Prisma migrations are generated
- [ ] No uncommitted migration files
- [ ] Documentation updated for new errors solved

---

*This document is living documentation. Update it whenever new errors are encountered and solved.*
