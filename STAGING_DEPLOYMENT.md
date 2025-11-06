# Cordiq Staging Environment Deployment Guide

> Complete guide for setting up and deploying the Cordiq staging environment
> Last Updated: 2025-11-05
> Status: Phase 2 (86% Complete) - Ready for Staging Testing

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Options](#architecture-options)
3. [Prerequisites](#prerequisites)
4. [Quick Start (Local Staging)](#quick-start-local-staging)
5. [Cloud Deployment Options](#cloud-deployment-options)
6. [Environment Configuration](#environment-configuration)
7. [Production Credentials Setup](#production-credentials-setup)
8. [Testing Checklist](#testing-checklist)
9. [Monitoring & Debugging](#monitoring--debugging)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The staging environment is a production-like environment used for final testing before deploying to production. It mirrors production infrastructure but uses separate databases, credentials, and resources.

**Phase 2 Status (86% Complete):**
- ✅ All backend APIs implemented (GraphQL + REST)
- ✅ All frontend components and UI complete
- ✅ Gmail OAuth integration (backend + frontend)
- ✅ Email composition with rich text editor
- ✅ AI template generation with 4 styles
- ✅ File attachments with S3 integration
- ✅ Polish Draft feature with 4 options
- ✅ Comprehensive test suite (93% pass rate)
- ✅ Security scans passing (0 critical findings)
- ⏳ **Pending: Staging environment testing (1-2 weeks)**

**What staging testing validates:**
1. Production Gmail OAuth credentials work correctly
2. Production AWS S3 bucket handles file uploads
3. Email sending via Gmail API functions end-to-end
4. AI template generation performs under load
5. Performance meets acceptance criteria
6. Security configurations are correct
7. Error handling works as expected

---

## Architecture Options

### Option 1: Local Staging (Recommended for Initial Testing)

**Use Case:** Test production build locally before cloud deployment

```
┌─────────────────────────────────────────────┐
│  Docker Compose (Local Machine)             │
│  ├─ PostgreSQL (staging database)           │
│  ├─ Redis (staging cache)                   │
│  ├─ API (production build)                  │
│  └─ Web (production build)                  │
└─────────────────────────────────────────────┘
         │
         ├─→ External: Supabase Auth
         ├─→ External: AWS S3 (staging bucket)
         ├─→ External: Gmail API (staging OAuth)
         └─→ External: AI Providers (OpenRouter/Gemini)
```

**Pros:**
- Fast setup (~30 minutes)
- No cloud costs for infrastructure
- Easy debugging with local logs
- Rapid iteration

**Cons:**
- Not publicly accessible (use ngrok for external testing)
- Limited to single machine resources
- Not representative of distributed production environment

---

### Option 2: Cloud Staging (Recommended for Final Testing)

**Use Case:** Full production-like environment for comprehensive testing

```
┌──────────────────────────────────────────────┐
│  Vercel (Frontend)                           │
│  ├─ Next.js Production Build                 │
│  └─ CDN + Edge Functions                     │
└──────────────────────────────────────────────┘
         │
         v
┌──────────────────────────────────────────────┐
│  Railway/Render (Backend)                    │
│  ├─ NestJS API                               │
│  ├─ PostgreSQL Database                      │
│  └─ Redis Cache                              │
└──────────────────────────────────────────────┘
         │
         ├─→ External: AWS S3 (staging bucket)
         ├─→ External: Gmail API (staging OAuth)
         └─→ External: AI Providers
```

**Pros:**
- Production-like performance and scalability
- Publicly accessible for stakeholder testing
- Representative of actual production deployment
- Built-in monitoring and logging

**Cons:**
- Setup time (~2-3 hours)
- Monthly costs (~$10-$20 for staging)
- More complex debugging

---

## Prerequisites

### Required Accounts

- [ ] **Supabase Account** - For authentication
  - Create project at: https://supabase.com
  - Get API keys from Settings → API

- [ ] **AWS Account** - For S3 file storage
  - Create IAM user with S3 permissions
  - Create staging S3 bucket: `cordiq-attachments-staging`
  - See: `docs/S3_ATTACHMENT_SETUP.md`

- [ ] **Google Cloud Console** - For Gmail OAuth
  - Enable Gmail API
  - Create OAuth 2.0 credentials
  - Configure staging redirect URI
  - See: `docs/GMAIL_OAUTH_SETUP.md`

- [ ] **AI Provider Account** - At least one required
  - **Gemini** (Recommended): https://aistudio.google.com/app/apikey
  - OpenRouter: https://openrouter.ai/keys
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com/settings/keys

### Optional Cloud Services (for Option 2)

- [ ] **Vercel Account** - Frontend hosting
  - Sign up: https://vercel.com
  - Connect GitHub repository

- [ ] **Railway Account** - Backend hosting (Recommended)
  - Sign up: https://railway.app
  - Connect GitHub repository

- [ ] **Render Account** - Alternative backend hosting
  - Sign up: https://render.com
  - Free tier available

### Required Tools

```bash
# Node.js 22+
node --version  # Should be v22.x.x

# pnpm 8+
pnpm --version  # Should be 8.x.x

# Docker and Docker Compose
docker --version  # For local staging
docker compose version

# OpenSSL (for generating encryption keys)
openssl version

# Git
git --version
```

---

## Quick Start (Local Staging)

### Step 1: Clone and Install Dependencies

```bash
# Clone repository (if not already)
git clone <your-repo-url>
cd followup

# Install dependencies
pnpm install
```

### Step 2: Create Staging Environment File

```bash
# Copy staging environment template
cp .env.staging.example .env.staging

# Edit with your favorite editor
nano .env.staging  # or vim, code, etc.
```

**Minimum required configuration:**

```bash
# Database (use local staging database)
DATABASE_URL=postgresql://postgres:staging_password@localhost:5433/cordiq_staging

# Supabase (from your Supabase dashboard)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (local staging Redis)
REDIS_URL=redis://:staging_redis_password@localhost:6380

# AWS S3 (create staging bucket first)
AWS_REGION=us-east-1
S3_BUCKET=cordiq-attachments-staging
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Gmail OAuth (staging credentials)
GOOGLE_CLIENT_ID=your-staging-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-staging-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4001/api/auth/gmail/callback

# Generate encryption key: openssl rand -hex 32
ENCRYPTION_KEY=your-64-character-hex-key

# AI Provider (at least one required)
GEMINI_API_KEY=your-gemini-key
# OPENAI_API_KEY=your-openai-key  # Optional fallback
# ANTHROPIC_API_KEY=your-anthropic-key  # Optional fallback
```

### Step 3: Start Staging Environment

```bash
# Option A: Using startup script (recommended)
./scripts/start-staging.sh

# Option B: Using docker-compose directly
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d

# Wait for services to be healthy (~30-60 seconds)
docker compose -f docker-compose.staging.yml ps
```

### Step 4: Run Database Migrations

```bash
# Connect to API container
docker exec -it cordiq-api-staging sh

# Run Prisma migrations
cd /app/packages/database
pnpm prisma migrate deploy

# Exit container
exit
```

### Step 5: Verify Deployment

```bash
# Check API health
curl http://localhost:4001/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-05T..."}

# Check frontend
open http://localhost:3001
# Or visit in browser: http://localhost:3001

# Check logs
docker compose -f docker-compose.staging.yml logs -f api
docker compose -f docker-compose.staging.yml logs -f web
```

### Step 6: Run Staging Tests

See [Testing Checklist](#testing-checklist) section below.

---

## Cloud Deployment Options

### Option A: Vercel (Frontend) + Railway (Backend)

**Recommended for most projects due to ease of use and included database.**

#### Deploy Backend to Railway

1. **Create Railway Project**
   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli

   # Or use web interface: https://railway.app
   ```

2. **Add PostgreSQL Service**
   - In Railway dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Note the connection string

3. **Deploy Backend**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Configure:
     ```
     Root Directory: apps/api
     Build Command: pnpm install && pnpm --filter @cordiq/api build
     Start Command: pnpm --filter @cordiq/api start:prod
     ```

4. **Add Redis Service**
   - Click "New" → "Database" → "Redis"
   - Note the connection URL

5. **Configure Environment Variables**
   - In Railway dashboard → Variables
   - Add all variables from `.env.staging.example`
   - Use Railway's database URLs for DATABASE_URL and REDIS_URL

6. **Deploy**
   - Click "Deploy"
   - Wait for build (~3-5 minutes)
   - Note the public URL: `https://cordiq-api-staging.up.railway.app`

#### Deploy Frontend to Vercel

Follow the comprehensive guide: [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)

**Quick steps:**
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   ```
   Framework: Next.js
   Root Directory: ./
   Build Command: cd apps/web && pnpm build
   Output Directory: apps/web/.next
   ```
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://cordiq-api-staging.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Deploy

---

### Option B: Render (Full Stack)

**Alternative with free tier available.**

#### Deploy Backend

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   ```
   Root Directory: apps/api
   Build Command: pnpm install && cd apps/api && pnpm build
   Start Command: cd apps/api && pnpm start:prod
   Instance Type: Starter ($7/month)
   ```
5. Add PostgreSQL database (separate service)
6. Add environment variables from `.env.staging.example`

#### Deploy Frontend

1. New → Static Site
2. Configure:
   ```
   Root Directory: apps/web
   Build Command: pnpm install && cd apps/web && pnpm build
   Publish Directory: apps/web/out
   ```
3. Add environment variables

**Note:** Render's free tier has limitations (spins down after inactivity).

---

## Environment Configuration

### Critical Environment Variables

#### Must Have (Required for Basic Functionality)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Supabase/Railway/RDS |
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_JWT_SECRET` | JWT verification secret | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Supabase Dashboard → Settings → API |
| `REDIS_URL` | Redis connection string | Railway/Upstash/Self-hosted |

#### Email Functionality (Required for Phase 2 Features)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GOOGLE_CLIENT_ID` | Gmail OAuth client ID | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Gmail OAuth client secret | Google Cloud Console → Credentials |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `https://your-api-url/api/auth/gmail/callback` |
| `ENCRYPTION_KEY` | Token encryption key (64 hex chars) | Generate: `openssl rand -hex 32` |
| `AWS_REGION` | S3 bucket region | AWS Console |
| `S3_BUCKET` | S3 bucket name | `cordiq-attachments-staging` |
| `AWS_ACCESS_KEY_ID` | AWS access key | AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | AWS IAM Console |

#### AI Providers (At Least One Required)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GEMINI_API_KEY` | Google Gemini API key (Recommended) | https://aistudio.google.com/app/apikey |
| `OPENAI_API_KEY` | OpenAI API key (Optional fallback) | https://platform.openai.com/api-keys |
| `ANTHROPIC_API_KEY` | Anthropic API key (Optional fallback) | https://console.anthropic.com/settings/keys |
| `OPENROUTER_API_KEY` | OpenRouter API key (Optional) | https://openrouter.ai/keys |

#### Optional (Monitoring & Security)

| Variable | Description | Default |
|----------|-------------|---------|
| `SENTRY_DSN` | Error tracking | None |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `RATE_LIMIT_MAX` | Max requests per minute | `100` |
| `GRAPHQL_PLAYGROUND` | Enable GraphQL playground | `false` (staging) |

---

## Production Credentials Setup

### 1. Gmail OAuth Production Credentials

**Complete guide:** `docs/GMAIL_OAUTH_SETUP.md`

**Quick steps:**

1. **Create OAuth 2.0 Client in Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/apis/credentials
   - Create OAuth client ID (Web application)
   - Add authorized redirect URI:
     ```
     # Local staging:
     http://localhost:4001/api/auth/gmail/callback

     # Cloud staging:
     https://cordiq-api-staging.up.railway.app/api/auth/gmail/callback
     ```

2. **Add Test Users** (if using External + Testing mode)
   - Go to OAuth consent screen → Test users
   - Add email addresses that will test Gmail integration
   - Limit: 100 test users during testing phase

3. **Copy Credentials**
   ```bash
   # Add to .env.staging
   GOOGLE_CLIENT_ID=123456789012-abc...xyz.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEf...XyZ
   GOOGLE_REDIRECT_URI=https://your-api-url/api/auth/gmail/callback
   ```

4. **Generate Encryption Key**
   ```bash
   openssl rand -hex 32
   # Output: a1b2c3d4e5f6...xyz (64 characters)

   # Add to .env.staging
   ENCRYPTION_KEY=a1b2c3d4e5f6...xyz
   ```

---

### 2. AWS S3 Production Bucket

**Complete guide:** `docs/S3_ATTACHMENT_SETUP.md`

**Quick steps:**

1. **Create Staging S3 Bucket**
   ```bash
   aws s3api create-bucket \
     --bucket cordiq-attachments-staging \
     --region us-east-1

   # Enable encryption
   aws s3api put-bucket-encryption \
     --bucket cordiq-attachments-staging \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

2. **Configure CORS Policy**
   ```json
   [
     {
       "AllowedHeaders": ["Content-Type", "Content-Length", "Authorization", "x-amz-*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": [
         "http://localhost:3001",
         "https://cordiq-staging.vercel.app"
       ],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

   ```bash
   # Apply CORS policy
   aws s3api put-bucket-cors \
     --bucket cordiq-attachments-staging \
     --cors-configuration file://cors-policy.json
   ```

3. **Create IAM User with S3 Permissions**
   - Create user: `cordiq-s3-staging`
   - Attach policy (see `docs/S3_ATTACHMENT_SETUP.md` for full policy)
   - Generate access keys
   - Copy credentials to `.env.staging`

---

### 3. Supabase Configuration

1. **Update Redirect URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add staging URLs:
     ```
     http://localhost:3001
     https://cordiq-staging.vercel.app
     https://cordiq-staging-*.vercel.app/**
     ```

2. **Configure Google OAuth Provider**
   - Go to Authentication → Providers → Google
   - Enable Google provider
   - Add client ID and secret
   - Configure redirect URI:
     ```
     https://YOUR-PROJECT.supabase.co/auth/v1/callback
     ```

---

## Testing Checklist

### Phase 2 Staging Testing Requirements

Use this checklist to validate all Phase 2 features before production:

#### ✅ Authentication & User Management

- [ ] User can sign up with email
- [ ] User can log in with email
- [ ] User can log in with Google OAuth
- [ ] User can access dashboard after login
- [ ] User can log out successfully
- [ ] Session persists on page refresh
- [ ] Logout redirects to login page

#### ✅ Contact Management

- [ ] User can create a contact
- [ ] User can view contact list
- [ ] User can search contacts
- [ ] User can filter contacts by priority/company/industry
- [ ] User can view contact details
- [ ] User can edit contact
- [ ] User can delete contact
- [ ] Pagination works correctly

#### ✅ Email Composition (Core Phase 2)

**AI Template Generation:**
- [ ] User can navigate to `/compose`
- [ ] User can select a contact
- [ ] User can click "Generate with AI"
- [ ] Two templates (Formal + Casual) generate successfully
- [ ] Templates include contact context (name, notes, etc.)
- [ ] A/B templates display side-by-side
- [ ] User can select a template
- [ ] Selected template loads into editor
- [ ] Generation completes within 10 seconds
- [ ] Error handling works if AI fails

**Email Editor:**
- [ ] Rich text editor loads without errors
- [ ] Formatting toolbar works (bold, italic, underline, lists)
- [ ] User can type and edit content
- [ ] Auto-save indicator shows "Saving..." and "Saved"
- [ ] Draft persists on page refresh
- [ ] Browser crash recovery works (test by force-closing browser)

**Polish Draft Feature:**
- [ ] User can write a draft email
- [ ] User can click "Polish Draft"
- [ ] Four style options appear (Formal, Casual, Elaborate, Concise)
- [ ] Each option shows polished version with word count diff
- [ ] User can select a polished version
- [ ] Selected version replaces draft
- [ ] Error handling works if polish fails

**Email Signatures:**
- [ ] User can create email signature
- [ ] User can set default signature
- [ ] Signature auto-loads in compose view
- [ ] User can change signature via dropdown
- [ ] User can edit signature
- [ ] User can delete signature

**File Attachments:**
- [ ] User can click "Attach File"
- [ ] User can select file from system dialog
- [ ] File uploads with progress indicator
- [ ] File appears in attachment list with name and size
- [ ] User can drag-and-drop file to upload
- [ ] User can remove attachment before sending
- [ ] Supported file types work (PDF, DOCX, XLSX, images)
- [ ] File size limit enforced (25MB)
- [ ] Error handling for unsupported types

**Gmail Integration:**
- [ ] User can click "Connect Gmail"
- [ ] OAuth popup opens
- [ ] User can authenticate with Google
- [ ] Connection status shows "Connected" with email address
- [ ] User can compose email to selected contact
- [ ] User can click "Send"
- [ ] Email sends successfully via Gmail API
- [ ] Sent email appears in user's Gmail "Sent" folder
- [ ] Error handling works if send fails
- [ ] User can disconnect Gmail

**Template Library:**
- [ ] User can save current draft as template
- [ ] Template saves with name and category
- [ ] User can view template library
- [ ] Templates grouped by category
- [ ] User can load saved template
- [ ] User can edit template
- [ ] User can delete template

**Bulk Campaign Mode:**
- [ ] User can enable bulk mode
- [ ] User can select multiple contacts (up to 100)
- [ ] Contact list shows selected count
- [ ] User can compose single message for all
- [ ] User can preview personalization for each contact
- [ ] User can send to all selected contacts
- [ ] Progress indicator shows sending status
- [ ] Error handling for partial failures

#### ✅ Performance & Load Testing

- [ ] AI template generation: < 10 seconds (95th percentile)
- [ ] Page load time: < 3 seconds (home, dashboard, compose)
- [ ] Email send: < 5 seconds
- [ ] File upload: < 30 seconds for 25MB file
- [ ] Auto-save: Triggers within 2 seconds of typing
- [ ] Database sync: Triggers within 10 seconds
- [ ] No memory leaks during extended session (1+ hour)
- [ ] API endpoints respond within 500ms (95th percentile)

#### ✅ Security Testing

- [ ] All API endpoints require authentication
- [ ] Users can only access their own data (test with 2 accounts)
- [ ] File uploads validate file type and size
- [ ] S3 presigned URLs expire after 15 minutes
- [ ] Gmail tokens stored encrypted in database
- [ ] XSS protection works (test with `<script>alert('xss')</script>` in email)
- [ ] SQL injection protection works (test with `' OR '1'='1` in search)
- [ ] CORS configured correctly (only allows staging domains)
- [ ] Rate limiting prevents abuse (test with 101 requests in 1 minute)
- [ ] Semgrep scan passes with 0 critical findings

#### ✅ Error Handling & Edge Cases

- [ ] Network error during AI generation shows user-friendly message
- [ ] Network error during email send shows retry option
- [ ] Gmail OAuth failure shows clear instructions
- [ ] S3 upload failure shows retry option
- [ ] Invalid file type shows error message
- [ ] File too large shows error message
- [ ] Browser offline mode handled gracefully
- [ ] Draft recovery works after browser crash
- [ ] Concurrent edits handled (open 2 tabs, edit same draft)

#### ✅ Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

#### ✅ Monitoring & Logging

- [ ] Application logs visible in Railway/Render dashboard
- [ ] Error tracking working (Sentry if configured)
- [ ] Prometheus metrics accessible (if enabled)
- [ ] Health check endpoint responds: `/health`
- [ ] Database connection monitored
- [ ] Redis connection monitored

---

## Monitoring & Debugging

### Application Health Checks

```bash
# API health check
curl https://cordiq-api-staging.up.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-05T10:30:00.000Z",
  "uptime": 3600,
  "database": "healthy",
  "redis": "healthy"
}

# GraphQL endpoint check
curl https://cordiq-api-staging.up.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Expected response:
{ "data": { "__typename": "Query" } }
```

### Viewing Logs

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs --service api
railway logs --service web
```

**Render:**
- Navigate to Render dashboard
- Select your service
- Click "Logs" tab
- Real-time logs stream automatically

**Docker (Local Staging):**
```bash
# View all logs
docker compose -f docker-compose.staging.yml logs -f

# View specific service
docker compose -f docker-compose.staging.yml logs -f api
docker compose -f docker-compose.staging.yml logs -f web

# View last 100 lines
docker compose -f docker-compose.staging.yml logs --tail 100 api
```

### Debugging Common Issues

#### Issue: API responds with 500 errors

**Diagnosis:**
```bash
# Check API logs
docker compose -f docker-compose.staging.yml logs api

# Common causes:
# - Database connection failed
# - Redis connection failed
# - Missing environment variable
# - Prisma schema mismatch
```

**Solutions:**
1. Verify DATABASE_URL is correct
2. Verify Redis is running: `docker ps`
3. Check environment variables: `docker exec cordiq-api-staging env`
4. Re-run migrations: `docker exec -it cordiq-api-staging sh -c "cd /app/packages/database && pnpm prisma migrate deploy"`

#### Issue: CORS errors in frontend

**Diagnosis:**
```bash
# Open browser console (F12)
# Look for error: "CORS policy: No 'Access-Control-Allow-Origin' header"
```

**Solutions:**
1. Verify FRONTEND_URL in backend .env.staging matches frontend URL
2. Check CORS configuration in API main.ts
3. Add frontend URL to CORS allowed origins
4. Restart API after changes

#### Issue: Gmail OAuth fails

**Diagnosis:**
```bash
# Check error message in UI
# Common errors:
# - "redirect_uri_mismatch"
# - "access_denied"
# - "invalid_grant"
```

**Solutions:**
- See `docs/GMAIL_OAUTH_SETUP.md` → Troubleshooting section
- Verify redirect URI matches exactly in Google Console
- Add test user email to Google OAuth consent screen
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env

#### Issue: File upload to S3 fails

**Diagnosis:**
```bash
# Check browser console for CORS error
# Check API logs for S3 SDK errors
```

**Solutions:**
- See `docs/S3_ATTACHMENT_SETUP.md` → Troubleshooting section
- Verify S3 CORS policy includes frontend URL
- Check AWS credentials are correct
- Verify IAM user has s3:PutObject permission

---

## Troubleshooting

### Quick Diagnostic Commands

```bash
# Check all services running
docker compose -f docker-compose.staging.yml ps

# Restart all services
docker compose -f docker-compose.staging.yml restart

# Restart specific service
docker compose -f docker-compose.staging.yml restart api

# View resource usage
docker stats

# Check service health
docker inspect cordiq-api-staging --format='{{.State.Health.Status}}'

# Shell into API container
docker exec -it cordiq-api-staging sh

# Shell into database container
docker exec -it cordiq-postgres-staging psql -U postgres -d cordiq_staging
```

### Common Error Patterns

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot connect to database` | DATABASE_URL incorrect or database not running | Check connection string, ensure PostgreSQL running |
| `Redis connection refused` | Redis not running or wrong URL | Check REDIS_URL, ensure Redis running |
| `CORS error` | Frontend URL not in allowed origins | Add frontend URL to CORS config |
| `401 Unauthorized` | Invalid JWT token | Check SUPABASE_JWT_SECRET matches |
| `Gmail OAuth redirect_uri_mismatch` | Redirect URI doesn't match Google Console | Update Google Console with exact staging URL |
| `S3 Access Denied` | IAM permissions insufficient | Check IAM policy includes s3:PutObject |
| `AI generation timeout` | AI provider API key invalid or quota exceeded | Check API key, verify provider status |

### Performance Troubleshooting

```bash
# Check database query performance
docker exec -it cordiq-postgres-staging psql -U postgres -d cordiq_staging

# Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries >100ms
SELECT pg_reload_conf();

# View slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

# Check Redis cache hit rate
docker exec -it cordiq-redis-staging redis-cli
INFO stats
# Look for: keyspace_hits / (keyspace_hits + keyspace_misses)
```

---

## Next Steps After Staging Validation

Once all tests pass in staging:

1. **Document any issues found**
   - Update `/context/errors-solved.md` with new solutions
   - Create GitHub issues for bugs
   - Update specs with any changes

2. **Performance benchmarks**
   - Record load testing results
   - Document average response times
   - Identify optimization opportunities

3. **Security review**
   - Final Semgrep scan
   - Manual penetration testing (optional)
   - Review all environment variables

4. **Production deployment preparation**
   - Create production environment files
   - Set up production database backups
   - Configure production monitoring
   - Set up error tracking (Sentry)

5. **Production deployment**
   - Follow production deployment guide
   - Enable blue-green deployment if available
   - Monitor closely for first 24 hours

---

## Support & Resources

**Documentation:**
- Gmail OAuth Setup: `docs/GMAIL_OAUTH_SETUP.md`
- S3 Setup: `docs/S3_ATTACHMENT_SETUP.md`
- Vercel Deployment: `VERCEL_DEPLOYMENT.md`
- General Troubleshooting: `docs/TROUBLESHOOTING.md`
- Error Knowledge Base: `/context/errors-solved.md`

**Spec Documentation:**
- Email Composition Feature: `.agent-os/specs/2025-10-15-email-composition-gmail-integration/`
- Contact CRUD: `.agent-os/specs/2025-10-06-contact-crud-operations/`
- User Authentication: `.agent-os/specs/2025-10-04-user-authentication/`

**External Resources:**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs

---

## Summary

**Staging environment is critical for Phase 2 completion (86% → 100%).**

**Quick Setup Paths:**

1. **Local Testing (30 minutes):**
   ```bash
   cp .env.staging.example .env.staging
   # Edit .env.staging with credentials
   ./scripts/start-staging.sh
   # Run testing checklist
   ```

2. **Cloud Deployment (2-3 hours):**
   - Deploy backend to Railway
   - Deploy frontend to Vercel
   - Configure production credentials
   - Run comprehensive testing

**What success looks like:**
- ✅ All 50+ test cases passing
- ✅ Emails sending via Gmail API
- ✅ File uploads working with S3
- ✅ AI templates generating correctly
- ✅ Performance meeting targets
- ✅ Zero critical security issues
- ✅ Error handling working as expected

**Ready to proceed to production!**

---

**Last Updated:** 2025-11-05
**Phase 2 Status:** 86% Complete → Staging Testing Required
**Estimated Completion:** 1-2 weeks after staging validation
