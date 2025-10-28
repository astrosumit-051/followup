# CI/CD Pipeline Setup Guide

> Complete guide for configuring GitHub Actions workflows for automated testing and deployment

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Required Secrets](#required-secrets)
- [Database Configuration](#database-configuration)
- [Testing Strategy](#testing-strategy)
- [Troubleshooting](#troubleshooting)

---

## Overview

The RelationHub project uses GitHub Actions for continuous integration and continuous deployment. The CI/CD pipeline includes:

1. **Unit Tests** - Jest tests for backend API and database packages
2. **E2E Tests** - Playwright browser automation tests for user workflows
3. **Multi-Browser Testing** - Cross-browser compatibility testing (Firefox, WebKit)
4. **Code Quality** - Automated code review and security scanning

---

## Workflows

### 1. Test Suite (`test.yml`)

**Triggers:**
- Push to `main`, `staging`, or `email-composition` branches
- Pull requests to `main` or `staging`

**What it does:**
- Runs Jest unit tests for database package
- Runs Jest unit tests for API package
- Uploads coverage reports
- Provides test summary

**Configuration:**
```yaml
runs-on: ubuntu-latest
timeout-minutes: 30
node-version: 22.x
```

---

### 2. E2E Tests (`e2e-tests.yml`)

**Triggers:**
- Push to `main` or `staging` branches
- Pull requests to `main` or `staging`

**What it does:**

**Job 1: Primary E2E Tests (Always runs)**
- Runs Playwright E2E tests with Chromium browser
- Uses sequential execution (workers: 1) for reliability
- Uploads test reports, screenshots, and videos on failure
- Provides detailed test summary

**Job 2: Cross-Browser Tests (Only on main/staging)**
- Runs E2E tests with Firefox and WebKit in parallel
- Only executes for main/staging branches (not PRs)
- Helps catch browser-specific issues

**Services:**
- PostgreSQL 17 (database)
- Redis 7 (caching)

**Test Coverage:**
- Contact CRUD operations (create, read, update, delete)
- Contact list and search functionality
- Responsive design (mobile and desktop viewports)
- Performance benchmarks
- Visual regression tests

**Configuration:**
```yaml
runs-on: ubuntu-latest
timeout-minutes: 60 (primary), 90 (cross-browser)
node-version: 22
browsers: chromium (always), firefox & webkit (main/staging only)
```

---

## Required Secrets

Configure these secrets in your GitHub repository settings:

**Path:** Repository → Settings → Secrets and variables → Actions

### Supabase Secrets (Required for E2E Tests)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Anonymous public key | Supabase Dashboard → Settings → API |
| `SUPABASE_JWT_SECRET` | JWT secret for token validation | Supabase Dashboard → Settings → API (under JWT Secret) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (full access) | Supabase Dashboard → Settings → API (keep secret!) |

### How to Add Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Enter secret name (exactly as shown above)
5. Paste the value from Supabase Dashboard
6. Click **"Add secret"**

**⚠️ SECURITY WARNING:**
- Never commit secrets to your repository
- Never log secrets in GitHub Actions output
- Rotate keys immediately if accidentally exposed
- Use different Supabase projects for production/testing

---

## Database Configuration

### PostgreSQL Service Container

The E2E tests use a PostgreSQL 17 service container that runs alongside the test job:

```yaml
services:
  postgres:
    image: postgres:17
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: relationhub_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Database Setup Steps

The workflow automatically:

1. **Starts PostgreSQL container** with health checks
2. **Runs Prisma migrations** to create schema:
   ```bash
   pnpm --filter database prisma migrate deploy
   ```
3. **Seeds test data** (if seed script exists)
4. **Connects to database** at `postgresql://postgres:postgres@localhost:5432/relationhub_test`

### Redis Service Container

Redis is used for caching AI responses and rate limiting:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - 6379:6379
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

---

## Testing Strategy

### Test Execution Flow

1. **Setup Phase** (backend-ready)
   - Wait for backend API to be healthy
   - Poll `http://localhost:3001/health` endpoint
   - Timeout: 90 seconds

2. **Authentication Setup** (auth-setup)
   - Create test user via Supabase
   - Store authentication state in `playwright/.auth/user.json`
   - Reuse session across all tests

3. **Test Execution**
   - Run tests sequentially (workers: 1) for reliability
   - Each test uses isolated test data (UUID-based contact IDs)
   - Automatic retries: 2 attempts on CI
   - Timeout: 90 seconds per test

4. **Cleanup**
   - Upload test artifacts on completion
   - Generate test summary report

### Test Isolation

**UUID-Based Contact IDs:**
```typescript
const contactId = `test-contact-${uuidv4()}`;
```

This ensures:
- No test interference
- Parallel execution possible (when enabled)
- Clean test data per run

### Rate Limiting

Rate limiting is **disabled** for E2E tests:

```bash
DISABLE_RATE_LIMIT=true pnpm dev
```

This prevents `ThrottlerException: Too Many Requests` errors during rapid test execution.

---

## Troubleshooting

### Common Issues

#### 1. "Secrets not configured" Error

**Error:**
```
Error: SUPABASE_URL is not defined
```

**Solution:**
- Verify all required secrets are added to GitHub repository
- Check secret names match exactly (case-sensitive)
- Ensure secrets are accessible to the workflow

---

#### 2. Database Migration Failures

**Error:**
```
Error: P1001: Can't reach database server
```

**Solution:**
- Check PostgreSQL service is healthy (logs show "database system is ready")
- Verify DATABASE_URL format: `postgresql://postgres:postgres@localhost:5432/relationhub_test`
- Ensure migrations are up-to-date in repository

---

#### 3. Playwright Browser Installation Fails

**Error:**
```
Error: Chromium is not installed
```

**Solution:**
- Ensure `playwright install` step runs with `--with-deps` flag
- Check disk space on runner (requires ~1GB for browser binaries)
- Try installing specific browser: `playwright install --with-deps chromium`

---

#### 4. Tests Timeout Waiting for Backend

**Error:**
```
Error: Timeout 90000ms exceeded waiting for backend
```

**Solution:**
- Check backend startup logs for errors
- Verify all environment variables are set correctly
- Increase `webServer.timeout` in `playwright.config.ts` if needed
- Ensure `DISABLE_RATE_LIMIT=true` is propagated to backend

---

#### 5. Authentication Setup Fails

**Error:**
```
Error: Failed to create test user
```

**Solution:**
- Verify Supabase secrets are correct
- Check Supabase project is active (not paused)
- Ensure email auth is enabled in Supabase dashboard
- Check rate limits on Supabase project

---

#### 6. Visual Regression Test Failures

**Error:**
```
Error: Screenshot comparison failed
```

**Solution:**
- Update snapshots locally: `pnpm --filter web test:e2e --update-snapshots`
- Commit updated snapshots to repository
- Check for font/rendering differences between local and CI
- Adjust `maxDiffPixels` or `threshold` in `playwright.config.ts`

---

### Debugging Tips

#### View Detailed Logs

1. Go to Actions tab in GitHub repository
2. Click on failed workflow run
3. Click on failed job
4. Expand step logs to see detailed error messages

#### Download Test Artifacts

Failed tests automatically upload:
- **Playwright Report** - HTML report with test results
- **Screenshots** - Visual evidence of failures
- **Videos** - Recording of test execution
- **Test Results** - Raw test output files

To download:
1. Go to failed workflow run
2. Scroll to **"Artifacts"** section at bottom
3. Click artifact name to download zip file

#### Run Tests Locally

Reproduce CI failures locally:

```bash
# Set environment variables
export CI=true
export DISABLE_RATE_LIMIT=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Run E2E tests with same configuration as CI
pnpm --filter web test:e2e --project=chromium --workers=1 --retries=2
```

---

## Performance Optimization

### Caching

The workflow uses pnpm caching to speed up dependency installation:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'pnpm'
```

**Cache hit:** Dependencies installed in ~30 seconds
**Cache miss:** Dependencies installed in ~2-3 minutes

### Parallel Execution

**Primary job (always runs):**
- Sequential execution (workers: 1)
- Chromium only
- Fastest feedback on PRs

**Cross-browser job (main/staging only):**
- Parallel execution across Firefox and WebKit
- Uses matrix strategy for concurrency
- Runs only on main/staging to save CI minutes

### Resource Limits

**Memory:**
```bash
NODE_OPTIONS: --max-old-space-size=4096
```

**Timeout:**
- Job: 60 minutes (primary), 90 minutes (cross-browser)
- Per test: 90 seconds
- Backend startup: 120 seconds

---

## Cost Optimization

### GitHub Actions Minutes

**Free tier:**
- 2,000 minutes/month for free
- Unlimited for public repositories

**Current usage estimate:**
- Primary E2E tests: ~15-20 minutes per run
- Cross-browser tests: ~30-40 minutes per run (only main/staging)
- Total per PR: ~15-20 minutes
- Total per main/staging push: ~50-60 minutes

### Tips to Reduce CI Time

1. **Run cross-browser tests only on main/staging**
   - Already configured in workflow
   - Saves ~30-40 minutes per PR

2. **Use test.only() for debugging**
   - Focus on specific failing tests
   - Blocked automatically by `forbidOnly: !!process.env.CI`

3. **Optimize test fixtures**
   - Create shared test data once
   - Reuse authentication across tests

4. **Skip visual regression on PRs**
   - Run only on main/staging
   - Update snapshots manually when needed

---

## Monitoring and Alerts

### GitHub Actions Status Badge

Add to README.md:

```markdown
![E2E Tests](https://github.com/YOUR_ORG/relationhub/actions/workflows/e2e-tests.yml/badge.svg)
```

### Email Notifications

Configure in GitHub repository settings:
- **Settings** → **Notifications**
- Enable "Email" for "Workflow runs on branches you've configured"

### Slack Integration

Use GitHub Actions Slack integration:

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Next Steps

After setting up CI/CD:

1. ✅ **Configure all required secrets** in GitHub repository
2. ✅ **Create a test PR** to verify workflow runs successfully
3. ✅ **Review test results** and fix any failures
4. ✅ **Update snapshots** if visual regression tests fail
5. ✅ **Monitor CI usage** and optimize as needed
6. ⏳ **Add deployment workflows** for staging/production (Phase 5)

---

## Related Documentation

- [E2E Testing Guide](/context/e2e-testing-guide.md)
- [E2E Infrastructure Validation Report](/context/e2e-test-infrastructure-validation.md)
- [E2E Follow-Up Tasks](/context/e2e-follow-up-tasks.md)
- [Setup Guide](/SETUP.md)

---

**Last Updated:** 2025-10-25
**Status:** Production Ready ✅
