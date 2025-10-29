# Vercel Staging Deployment Guide

> Complete guide for deploying Cordiq frontend to Vercel for staging testing

## Overview

This guide covers deploying the Next.js frontend (`apps/web`) to Vercel for staging environment testing of Phase 2 email composition features.

**What gets deployed**: Frontend only (Next.js app)
**What needs separate hosting**: Backend API (NestJS) - see Backend Deployment section

---

## Prerequisites

- ✅ Vercel account (sign up at https://vercel.com)
- ✅ GitHub repository access
- ✅ Supabase project configured (for authentication)
- ✅ Backend API deployed and accessible (Railway, Render, or other platform)

---

## Part 1: Frontend Deployment (Vercel)

### Step 1: Connect Repository to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import Git Repository**:
   - Select your GitHub account
   - Choose the `followup` repository
   - Click "Import"

### Step 2: Configure Project Settings

**Framework Preset**: Next.js (auto-detected)

**Build & Development Settings**:
```
Framework: Next.js
Root Directory: ./
Build Command: cd apps/web && pnpm build
Output Directory: apps/web/.next
Install Command: pnpm install
Development Command: cd apps/web && pnpm dev
```

**Project Settings**:
- **Project Name**: `cordiq-staging` (or your preferred name)
- **Framework Preset**: Next.js
- **Node.js Version**: 22.x (recommended)

### Step 3: Configure Environment Variables

In Vercel project settings → Environment Variables, add:

#### Required Variables

| Variable | Value | Where to Get It | Environment |
|----------|-------|-----------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` | Supabase Dashboard → Settings → API | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (long JWT token) | Supabase Dashboard → Settings → API | Production, Preview |

**How to add variables**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Enter variable name, value
4. Select environments: `Production` and `Preview`
5. Click "Save"

### Step 4: Deploy

1. Click **"Deploy"** button in Vercel
2. Wait for build to complete (~3-5 minutes)
3. Vercel will provide a URL: `https://cordiq-staging.vercel.app`

---

## Part 2: Backend API Deployment

**IMPORTANT**: The Next.js frontend requires a running backend API. The API must be deployed separately.

### Recommended Backend Platforms

#### Option A: Railway (Recommended)

**Pros**: PostgreSQL included, Docker support, easy setup
**Cost**: ~$5/month

**Steps**:
1. Go to https://railway.app
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && pnpm --filter @cordiq/api build`
   - **Start Command**: `pnpm --filter @cordiq/api start:prod`
6. Add PostgreSQL database service
7. Configure environment variables (see below)

#### Option B: Render

**Pros**: Free tier available, good documentation
**Cost**: Free tier (with limitations)

**Steps**:
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && cd apps/api && pnpm build`
   - **Start Command**: `cd apps/api && pnpm start:prod`
5. Add PostgreSQL database (separate service)
6. Configure environment variables

### Backend Environment Variables

Add these to your backend hosting platform:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/cordiq_staging

# Supabase (from Supabase Dashboard → Settings → API)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gmail OAuth (from Google Cloud Console)
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=https://your-api-url.com/api/gmail/callback
GMAIL_ENCRYPTION_KEY=your-32-byte-encryption-key

# AWS S3 (for attachments - from AWS Console)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=cordiq-attachments-staging

# OpenRouter (for AI email generation)
OPENROUTER_API_KEY=your-openrouter-key

# Redis (if using Redis provider, or use Railway's Redis add-on)
REDIS_URL=redis://host:6379

# Port
PORT=4000
```

**Where to get credentials**:
- **Supabase**: https://supabase.com/dashboard → Your Project → Settings → API
- **Gmail OAuth**: https://console.cloud.google.com → APIs & Services → Credentials
- **AWS S3**: https://console.aws.amazon.com/iam → Users → Create access key
- **OpenRouter**: https://openrouter.ai/keys

---

## Part 3: Connect Frontend to Backend

### Update API URL in Frontend

Once your backend is deployed, you need to tell the frontend where to find it.

**Option 1: Environment Variable (Recommended)**

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app
   ```
3. Redeploy: Vercel Dashboard → Deployments → Click "..." → Redeploy

**Option 2: Code Update**

If you hardcode the API URL in your GraphQL client setup, update it to point to your staging API.

---

## Part 4: Supabase Configuration for Staging

### Update Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel deployment URLs to allowed redirects:
   ```
   https://cordiq-staging.vercel.app
   https://cordiq-staging.vercel.app/**
   https://cordiq-staging-*.vercel.app
   ```

### Update OAuth Provider Redirect URIs

**Google OAuth**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   https://cordiq-staging.vercel.app/auth/callback
   ```

---

## Part 5: Testing Deployment

### Frontend Tests

1. **Visit your Vercel URL**: `https://cordiq-staging.vercel.app`
2. **Test Authentication**:
   - Click "Sign Up"
   - Try Google OAuth login
   - Verify redirect works
3. **Test Dashboard**:
   - After login, should see dashboard
   - Check if data loads (requires API connection)
4. **Check Browser Console**:
   - Open DevTools → Console
   - Look for any errors (API connection issues, etc.)

### Backend Tests

1. **Health Check**: `https://your-api-url.railway.app/health`
2. **GraphQL Playground**: `https://your-api-url.railway.app/graphql`
3. **Test Query**:
   ```graphql
   query {
     __schema {
       queryType {
         name
       }
     }
   }
   ```

### Email Composition Tests

Once both frontend and backend are deployed:

1. **Navigate to Compose** (`/compose`)
2. **Select a contact**
3. **Test AI Template Generation**:
   - Click "Generate with AI"
   - Verify both templates (Formal/Casual) load
   - Check for errors in console
4. **Test Email Sending**:
   - Connect Gmail account
   - Compose and send test email
   - Verify email is sent successfully

---

## Part 6: Monitoring & Debugging

### Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by:
   - **Build logs**: Check for build errors
   - **Runtime logs**: Check for runtime errors
   - **Function logs**: Check API route errors

### Backend Logs

- **Railway**: Dashboard → Your Service → Logs
- **Render**: Dashboard → Your Service → Logs tab

### Common Issues

#### Issue: "Failed to fetch" errors

**Cause**: Frontend can't reach backend API

**Solution**:
1. Verify backend is running: Visit `https://your-api-url/health`
2. Check CORS settings in backend (NestJS should allow your Vercel domain)
3. Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel

#### Issue: Authentication not working

**Cause**: Supabase redirect URLs not configured

**Solution**:
1. Add all Vercel URLs to Supabase → Authentication → URL Configuration
2. Update OAuth provider redirect URIs

#### Issue: Build failing on Vercel

**Cause**: Missing dependencies or incorrect build command

**Solution**:
1. Check build logs in Vercel
2. Verify `vercel.json` build command is correct
3. Ensure all dependencies are in `package.json`

#### Issue: Environment variables not loading

**Cause**: Variables not set for correct environment

**Solution**:
1. Check Vercel → Settings → Environment Variables
2. Ensure variables are enabled for "Preview" and "Production"
3. Redeploy after adding variables

---

## Part 7: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create/update a pull request

### Branch-Specific URLs

Each PR gets a unique URL:
```
https://cordiq-staging-git-<branch-name>-<your-account>.vercel.app
```

### Deployment Settings

Configure in Vercel → Project Settings → Git:
- **Production Branch**: `main`
- **Preview Deployments**: Enabled for all branches
- **Ignored Build Step**: Configured in `vercel.json`

---

## Part 8: Production Readiness Checklist

Before promoting staging to production:

- [ ] All staging tests passing
- [ ] Gmail OAuth working in staging
- [ ] Email sending functional
- [ ] AI template generation working
- [ ] File uploads to S3 working
- [ ] No console errors
- [ ] Performance acceptable (check Vercel Analytics)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate valid
- [ ] Environment variables reviewed for production
- [ ] Database migrations applied
- [ ] Monitoring/error tracking set up (Sentry, LogRocket, etc.)

---

## Part 9: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel → Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `staging.cordiq.com` or `cordiq.com`
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

### Update Supabase and OAuth

After adding custom domain, update:
1. Supabase redirect URLs
2. Google OAuth redirect URIs
3. Any hardcoded URLs in code

---

## Quick Reference

### Essential URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Google Cloud Console**: https://console.cloud.google.com
- **AWS Console**: https://console.aws.amazon.com

### Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Troubleshooting**: See `/context/errors-solved.md`

---

## Summary

**Deployment Architecture**:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  User Browser                                       │
│    │                                                │
│    ├─→ Vercel (Next.js Frontend)                   │
│    │   └─→ Railway/Render (NestJS API Backend)     │
│    │       ├─→ PostgreSQL Database                 │
│    │       ├─→ Redis Cache                         │
│    │       ├─→ Supabase Auth                       │
│    │       ├─→ AWS S3 (Attachments)                │
│    │       ├─→ Gmail API (Email sending)           │
│    │       └─→ OpenRouter (AI generation)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Next Steps**:
1. Deploy backend to Railway/Render (Part 2)
2. Deploy frontend to Vercel (Part 1)
3. Configure Supabase redirects (Part 4)
4. Test all features (Part 5)
5. Monitor and debug (Part 6)

---

**Need Help?**
- Check `/context/errors-solved.md` for common issues
- Review PR #48 for recent changes
- Consult `.agent-os/specs/2025-10-15-email-composition-gmail-integration/` for feature specs

🚀 **Ready to deploy!**
