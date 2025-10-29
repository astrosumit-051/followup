# Post-Merge Steps for RelationHub → Cordiq Rebrand

> **Important**: Follow these steps after merging PR #48 to complete the rebrand locally.

## Overview

PR #48 renames all package scopes, imports, Docker containers, and documentation from "RelationHub" to "Cordiq". This checklist ensures your local development environment is properly updated.

## Required Steps

### 1. Pull Latest Changes

```bash
git checkout main
git pull origin main
```

### 2. Reinstall Dependencies

The package scopes have changed from `@relationhub/*` to `@cordiq/*`, so you must regenerate the lockfile:

```bash
pnpm install
```

**Expected**: You should see all packages resolve to `@cordiq/*` scopes.

### 3. Rename Local Database

Your existing local database is named `relationhub_dev`, but Docker Compose now expects `cordiq_dev`.

**Option A: Rename Existing Database** (preserves data)

```bash
# Connect to PostgreSQL and rename
psql -U postgres -c "ALTER DATABASE relationhub_dev RENAME TO cordiq_dev;"
```

**Option B: Fresh Start** (clean slate, no data preservation)

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh containers with new database name
docker-compose up -d

# Run migrations
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed
```

### 4. Update Local Environment Files

If you have custom `.env` files (not using `.env.example`), update any references:

**Frontend** (`apps/web/.env.local`):
- No changes needed unless you have custom database references

**Backend** (`apps/api/.env`):
```bash
# Old:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/relationhub_dev?schema=public"

# New:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cordiq_dev?schema=public"
```

**Docker** (`.env.docker`):
```bash
# Old:
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/relationhub_dev?schema=public

# New:
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cordiq_dev?schema=public
```

### 5. Restart Docker Containers

```bash
docker-compose down
docker-compose up -d
```

**Verify containers are running**:
```bash
docker ps
```

Expected containers:
- `cordiq-postgres`
- `cordiq-redis`
- `cordiq-redis-commander`
- `cordiq-web`
- `cordiq-api`

### 6. Verify Build

```bash
# Build all packages
pnpm build

# Should complete without errors
```

### 7. Verify Tests

```bash
# Run test suite
pnpm test

# Note: Some tests may fail due to pre-existing issues unrelated to the rename
# Check that import errors are resolved
```

### 8. Verify Development Servers

```bash
# Start dev servers
pnpm dev

# Frontend should be at http://localhost:3000
# Backend should be at http://localhost:4000
# GraphQL playground at http://localhost:4000/graphql
```

## Troubleshooting

### Issue: "Cannot find module '@relationhub/database'"

**Solution**: You didn't run `pnpm install`. Delete `node_modules` and `pnpm-lock.yaml`, then run `pnpm install` again.

### Issue: "database 'cordiq_dev' does not exist"

**Solution**: You didn't rename your local database. Follow Step 3 above.

### Issue: Docker containers have old names

**Solution**: Run `docker-compose down` then `docker-compose up -d` to recreate containers with new names.

### Issue: GraphQL types not resolving

**Solution**: Regenerate Prisma client:
```bash
cd apps/api
pnpm prisma generate
```

## Verification Checklist

- [ ] Pulled latest `main` branch
- [ ] Ran `pnpm install` (lockfile regenerated)
- [ ] Renamed local database: `relationhub_dev` → `cordiq_dev`
- [ ] Updated local `.env` files (if custom)
- [ ] Restarted Docker containers
- [ ] Verified build: `pnpm build` completes
- [ ] Verified tests: `pnpm test` runs
- [ ] Verified dev servers start without import errors
- [ ] GraphQL playground accessible at http://localhost:4000/graphql
- [ ] Frontend loads at http://localhost:3000

## Questions?

If you encounter issues not covered here, please:
1. Check the PR #48 description for additional context
2. Ask in the team chat
3. File a GitHub issue with the `rebrand` label

---

**Status**: Complete! Your local environment is now fully rebranded to Cordiq. 🚀
