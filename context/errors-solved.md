# Errors Solved - RelationHub Development Log

> **Purpose**: Document all errors encountered during development and their solutions for quick reference
> **Last Updated**: 2025-10-04
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
- **Prisma Errors**: Shadow database, Schema validation
- **Environment Errors**: Missing variables, Wrong instances

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
