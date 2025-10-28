# CI/CD Quick Start Guide

> Fast setup guide for getting GitHub Actions E2E testing up and running

## Prerequisites

✅ GitHub repository with admin access
✅ Supabase project configured
✅ E2E tests passing locally

---

## Step 1: Configure Secrets (5 minutes)

### Required Secrets

Go to **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**

Add these 4 secrets:

| Secret Name | Where to Find | Example Format |
|-------------|---------------|----------------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | `eyJhbGc...` (long string) |
| `SUPABASE_JWT_SECRET` | Supabase Dashboard → Settings → API → JWT Secret | `xxx-secret-key` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | `eyJhbGc...` (long string) |

**📝 Copy-paste each value exactly as shown in Supabase Dashboard**

---

## Step 2: Verify Workflow Files (1 minute)

Check that these files exist:

```bash
✅ .github/workflows/e2e-tests.yml
✅ .github/workflows/test.yml
✅ apps/web/playwright.config.ts
```

If missing, see [Full CI/CD Setup Guide](./ci-cd-setup.md).

---

## Step 3: Create Test PR (2 minutes)

### Create a test branch and PR:

```bash
# Create test branch
git checkout -b test-ci-pipeline

# Make a small change
echo "# CI/CD Pipeline Test" >> CI_TEST.md

# Commit and push
git add CI_TEST.md
git commit -m "test: Verify CI/CD pipeline configuration"
git push -u origin test-ci-pipeline

# Create PR via GitHub CLI
gh pr create \
  --title "Test: CI/CD Pipeline Verification" \
  --body "Testing E2E test workflow configuration" \
  --base main
```

---

## Step 4: Monitor Workflow (10-15 minutes)

### Go to GitHub Actions tab:

1. **Click "Actions"** tab in GitHub repository
2. **Find "E2E Tests"** workflow run
3. **Watch progress** - should see:
   - ✅ Checkout repository
   - ✅ Setup pnpm
   - ✅ Install dependencies
   - ✅ Install Playwright browsers
   - ✅ Setup database schema
   - ✅ Run E2E tests (Chromium)
   - ✅ Upload artifacts

**Expected duration:** 10-15 minutes

---

## Step 5: Review Results (2 minutes)

### If tests pass ✅

**You'll see:**
- Green checkmark on PR
- "All checks have passed" message
- Test summary in workflow run

**Next steps:**
- Merge the test PR
- Delete test branch
- CI/CD is now operational! 🎉

### If tests fail ❌

**Download artifacts:**
1. Scroll to bottom of workflow run
2. Click **"Artifacts"** section
3. Download:
   - `playwright-report` - HTML test report
   - `screenshots` - Visual evidence of failures
   - `videos` - Recording of test execution

**Common issues:**
- Missing/incorrect secrets → Double-check Step 1
- Database migration failures → Check Prisma schema is committed
- Timeout errors → Backend startup issue, check environment variables

See [Troubleshooting Guide](./ci-cd-setup.md#troubleshooting) for solutions.

---

## What Happens Next?

### On every PR:

1. **E2E Tests run automatically** with Chromium
2. **Results appear on PR** within 10-15 minutes
3. **Artifacts uploaded** if tests fail (screenshots, videos, reports)

### On main/staging push:

1. **E2E Tests run** with Chromium (always)
2. **Cross-browser tests run** with Firefox and WebKit (in parallel)
3. **Total time:** ~30-40 minutes for full suite

---

## Quick Commands

### Run tests locally (same as CI):

```bash
# Set CI environment variable
export CI=true
export DISABLE_RATE_LIMIT=true

# Run E2E tests with CI configuration
pnpm --filter web test:e2e --project=chromium --workers=1 --retries=2
```

### Update visual regression snapshots:

```bash
pnpm --filter web test:e2e --update-snapshots
```

### View local HTML report:

```bash
pnpm --filter web playwright show-report
```

---

## Cost Estimate

**GitHub Actions free tier:** 2,000 minutes/month

**Usage per run:**
- PR with E2E tests: ~15 minutes
- Push to main/staging: ~50 minutes (includes cross-browser)

**Monthly estimate:**
- 10 PRs/week × 15 min = 600 minutes
- 5 main pushes/week × 50 min = 1,000 minutes
- **Total:** ~1,600 minutes/month (within free tier)

---

## Need Help?

**Full documentation:** [CI/CD Setup Guide](./ci-cd-setup.md)

**Common issues:** [Troubleshooting Section](./ci-cd-setup.md#troubleshooting)

**E2E test guide:** [E2E Testing Guide](/context/e2e-testing-guide.md)

---

**Setup time:** ~20 minutes total
**Status:** Production Ready ✅
