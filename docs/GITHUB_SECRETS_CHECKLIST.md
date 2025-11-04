# GitHub Secrets Setup Checklist

> **Quick verification checklist for GitHub Actions configuration**
>
> ⏱️ Setup Time: 5-10 minutes

---

## Prerequisites

- [ ] GitHub repository admin access
- [ ] Supabase project created and configured
- [ ] Supabase Dashboard access

---

## Step-by-Step Setup

### Step 1: Navigate to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. Expand **Secrets and variables** in left sidebar
4. Click **Actions**
5. You should see "New repository secret" button

---

### Step 2: Gather Supabase Credentials

Open **Supabase Dashboard** in a new tab:

1. Go to https://supabase.com/dashboard
2. Select your **Cordiq project**
3. Navigate to **Settings** → **API**

**Keep this tab open** - you'll copy values from here.

---

### Step 3: Add Required Secrets

Add these **4 secrets** one by one:

#### Secret 1: SUPABASE_URL

- **Name (exact):** `SUPABASE_URL`
- **Value location:** Supabase Dashboard → Settings → API → Project URL
- **Format:** `https://xxxxxxxxxxxxx.supabase.co`
- **Example:** `https://abcdefghijklmn.supabase.co`

**✅ Checkpoint:** URL should start with `https://` and end with `.supabase.co`

---

#### Secret 2: SUPABASE_ANON_KEY

- **Name (exact):** `SUPABASE_ANON_KEY`
- **Value location:** Supabase Dashboard → Settings → API → Project API keys → anon public
- **Format:** Long JWT token starting with `eyJ...`
- **Length:** ~300-400 characters

**✅ Checkpoint:** Key should start with `eyJ` (JWT format)

---

#### Secret 3: SUPABASE_JWT_SECRET

- **Name (exact):** `SUPABASE_JWT_SECRET`
- **Value location:** Supabase Dashboard → Settings → API → JWT Settings → JWT Secret
- **Format:** Long random string
- **Length:** ~40-60 characters

**✅ Checkpoint:** This is **NOT** the same as service role key

---

#### Secret 4: SUPABASE_SERVICE_ROLE_KEY

- **Name (exact):** `SUPABASE_SERVICE_ROLE_KEY`
- **Value location:** Supabase Dashboard → Settings → API → Project API keys → service_role secret
- **Format:** Long JWT token starting with `eyJ...`
- **Length:** ~300-400 characters

**🔒 CRITICAL:** This key has **full database access**. Never commit to repository!

**✅ Checkpoint:** Key should start with `eyJ` and be different from anon key

---

## Step 4: Verify Secrets

After adding all 4 secrets, you should see:

```
Repository secrets (4)
├── SUPABASE_ANON_KEY           Updated 1 minute ago
├── SUPABASE_JWT_SECRET         Updated 1 minute ago
├── SUPABASE_SERVICE_ROLE_KEY   Updated 1 minute ago
└── SUPABASE_URL                Updated 1 minute ago
```

**✅ Verification Checklist:**
- [ ] All 4 secret names match exactly (case-sensitive)
- [ ] No typos in secret names
- [ ] All secrets show recent "Updated" timestamp
- [ ] SUPABASE_URL is a valid URL format
- [ ] Both keys (anon and service_role) start with `eyJ`
- [ ] JWT secret is different from both keys

---

## Step 5: Test CI/CD Pipeline

Create a test PR to verify everything works:

```bash
# Create test branch
git checkout -b test-ci-pipeline

# Make a trivial change
echo "# CI/CD Test" >> CI_TEST.md

# Commit and push
git add CI_TEST.md
git commit -m "test: Verify GitHub Actions configuration"
git push -u origin test-ci-pipeline
```

### Create PR via GitHub UI:

1. Go to your repository on GitHub
2. Click **"Pull requests"** tab
3. Click **"New pull request"**
4. Select `test-ci-pipeline` branch
5. Click **"Create pull request"**
6. Title: "Test: CI/CD Pipeline Verification"

---

## Step 6: Monitor Workflow

### Go to Actions Tab:

1. Click **"Actions"** tab
2. Find **"E2E Tests"** workflow run
3. Click to view details

### Expected Timeline:

- **0-2 min:** Checkout, setup, install dependencies
- **2-5 min:** Install Playwright browsers
- **5-7 min:** Setup database schema
- **7-15 min:** Run E2E tests
- **15 min:** Upload artifacts, complete

**Total time:** ~10-15 minutes

---

## Expected Results

### ✅ Success (All tests pass)

**You'll see:**
```
✓ Checkout repository
✓ Setup pnpm
✓ Setup Node.js 22
✓ Install dependencies
✓ Install Playwright browsers
✓ Setup database schema
✓ Setup environment variables
✓ Run E2E tests (Chromium only)
✓ Upload Playwright report
✓ Test Summary
```

**On PR page:**
- Green checkmark ✅
- "All checks have passed"
- You can safely merge

**🎉 CI/CD is now operational!**

---

### ❌ Failure (Tests fail or errors occur)

**Common Error 1: Missing Secret**

```
Error: SUPABASE_URL is not defined
```

**Solution:**
- Go back to Step 3
- Verify secret name is **exactly** `SUPABASE_URL` (case-sensitive)
- Check for typos

---

**Common Error 2: Invalid Credentials**

```
Error: Invalid JWT: signature verification failed
```

**Solution:**
- Re-copy `SUPABASE_JWT_SECRET` from Supabase Dashboard
- Ensure you copied the **JWT Secret**, not a key
- Check for extra spaces or newlines

---

**Common Error 3: Database Connection Failed**

```
Error: Can't reach database server at localhost:5432
```

**Solution:**
- This is usually a CI runner issue, not your configuration
- Wait 5 minutes and re-run workflow
- Check GitHub Actions status page

---

**Common Error 4: Authentication Failed**

```
Error: Failed to create test user
```

**Solution:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check your Supabase project is active (not paused)
- Ensure email auth is enabled in Supabase Dashboard

---

## Troubleshooting Commands

### View workflow logs:

1. Actions tab → Failed workflow
2. Click on failed job
3. Expand step to see detailed error

### Download test artifacts:

1. Scroll to bottom of workflow run
2. Click **"Artifacts"** section
3. Download relevant artifact:
   - `playwright-report` - Full HTML report
   - `screenshots` - Visual evidence
   - `videos` - Test recordings

### Re-run workflow:

1. Go to failed workflow run
2. Click **"Re-run all jobs"** button
3. Monitor for same/different errors

---

## Security Best Practices

### ✅ DO:

- Use separate Supabase projects for production and testing
- Rotate keys if accidentally exposed
- Verify secrets are added as **Actions secrets** (not environment variables)
- Keep Supabase Dashboard tab closed when done

### ❌ DON'T:

- Never commit secrets to repository (even in .env.example files)
- Never log secrets in GitHub Actions output
- Never share service role key in Slack/Discord
- Never use production database for testing

---

## Cleanup After Test

Once CI/CD is verified working:

```bash
# Switch back to main branch
git checkout main

# Delete test branch locally
git branch -D test-ci-pipeline

# Delete test branch remotely
git push origin --delete test-ci-pipeline

# Close/delete test PR on GitHub
```

Or keep it open to verify all tests continue passing!

---

## What Happens Next?

### Automatic CI/CD on Every PR:

1. **Developer creates PR** → E2E tests run automatically
2. **Tests pass** → Green checkmark, ready to merge
3. **Tests fail** → Red X, artifacts uploaded for debugging

### Cross-Browser Testing (main/staging only):

1. **PR merged to main/staging** → Full test suite runs
2. **Chromium tests** (always)
3. **Firefox + WebKit tests** (parallel execution)
4. **Total time:** ~30-40 minutes

---

## Quick Reference

### Secret Names (Copy-Paste Ready)

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_JWT_SECRET
SUPABASE_SERVICE_ROLE_KEY
```

### Test Command (Run Locally)

```bash
export CI=true
export DISABLE_RATE_LIMIT=true
pnpm --filter web test:e2e --project=chromium
```

---

## Need More Help?

📖 **Full Documentation:**
- [CI/CD Setup Guide](./ci-cd-setup.md) - Complete configuration guide
- [CI/CD Quick Start](./ci-cd-quick-start.md) - Fast setup guide
- [E2E Testing Guide](/context/e2e-testing-guide.md) - Test writing guide
- [Troubleshooting](./ci-cd-setup.md#troubleshooting) - Common issues

🐛 **Still Having Issues?**
- Check [Troubleshooting Section](./ci-cd-setup.md#troubleshooting)
- Review [E2E Infrastructure Validation](/context/e2e-test-infrastructure-validation.md)
- Search existing GitHub Issues
- Create new issue with workflow logs attached

---

**⏱️ Total Setup Time:** 5-10 minutes (secrets) + 10-15 minutes (first test run)

**✅ Status:** Production Ready

**📅 Last Updated:** 2025-11-04
