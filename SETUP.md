# RelationHub Local Development Setup Guide

This guide will help you set up the RelationHub application for local development with Supabase authentication.

## Prerequisites

- **Node.js**: v22 LTS or higher
- **pnpm**: v8 or higher
- **PostgreSQL**: v17+ (or use Supabase managed database)
- **Supabase Account**: [Create one for free](https://supabase.com)
- **Google Cloud Console Account**: For Google OAuth (optional)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd relationhub

# Install dependencies
pnpm install
```

## Step 2: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Project name**: relationhub-dev (or your preferred name)
   - **Database password**: Save this password securely
   - **Region**: Choose closest to your location
4. Click "Create new project" and wait for provisioning (~2 minutes)

## Step 3: Configure Supabase Authentication

### Enable Email Provider

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Under **Email**, ensure it's enabled
3. Enable "Confirm email" for production (optional for development)
4. Click "Save"

### Enable Google OAuth (Optional)

1. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

2. **Configure in Supabase:**
   - In Supabase dashboard, go to **Authentication > Providers**
   - Find **Google** and toggle "Enabled"
   - Paste your **Client ID** and **Client Secret**
   - Click "Save"

## Step 4: Configure Environment Variables

### Frontend (apps/web)

```bash
cd apps/web
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

1. Go to Supabase dashboard > **Settings > API**
2. Copy **Project URL** to `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend (apps/api)

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` and add your credentials:

1. Go to Supabase dashboard > **Settings > API**
   - Copy **Project URL** to `SUPABASE_URL`
   - Under **JWT Settings**, copy **JWT Secret** to `SUPABASE_JWT_SECRET`
   - Under **Project API keys**, reveal and copy **service_role** to `SUPABASE_SERVICE_ROLE_KEY`

2. Go to Supabase dashboard > **Settings > Database**
   - Click **Connection string > URI**
   - Copy the URI and replace `[YOUR-PASSWORD]` with your actual database password
   - Paste to `DATABASE_URL`

**Example:**
```env
SUPABASE_URL=https://abcdefghijklmno.supabase.co
SUPABASE_JWT_SECRET=your-super-secret-jwt-secret-very-long-string
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:YourPassword123@db.abcdefghijklmno.supabase.co:5432/postgres
```

## Step 5: Run Database Migrations

```bash
# From project root
cd apps/api

# Run Prisma migrations
pnpm prisma migrate dev

# (Optional) Seed database with test data
pnpm prisma db seed
```

**Expected output:**
```
Applying migration `20250104_add_auth_fields`
✔ Generated Prisma Client
```

## Step 6: Configure Redirect URLs

1. In Supabase dashboard, go to **Authentication > URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
3. Click "Save"

## Step 7: Start Development Servers

### Option A: Start All Services (Recommended)

```bash
# From project root
pnpm dev
```

This starts:
- **Frontend (Next.js)**: http://localhost:3000
- **Backend (NestJS)**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql

### Option B: Start Services Individually

```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

## Step 8: Verify Setup

### Test Authentication Flow

1. **Open browser**: Navigate to http://localhost:3000
2. **Sign up**: Go to http://localhost:3000/signup
   - Enter email and password
   - Check your email for confirmation link (if email confirmation enabled)
3. **Log in**: Go to http://localhost:3000/login
   - Enter your credentials
   - Should redirect to dashboard
4. **Test Google OAuth** (if configured):
   - Click "Continue with Google" on login page
   - Complete Google authentication
   - Should redirect to dashboard
5. **Log out**: Click logout button on dashboard

### Run Test Suite

```bash
# Run all tests
pnpm test

# Run with coverage
cd apps/api && pnpm jest --coverage
cd apps/web && pnpm jest --coverage
```

**Expected results:**
- ✅ API: 84 tests passing
- ✅ Web: 21 tests passing
- ✅ Total: 105 tests passing

## Step 9: Access GraphQL Playground

1. Navigate to http://localhost:4000/graphql
2. Test the `me` query (requires authentication):

```graphql
query {
  me {
    id
    email
    name
    profilePicture
    lastLoginAt
  }
}
```

**Note**: You'll need to add an Authorization header with a valid JWT token from your login session.

## Troubleshooting

### "Invalid JWT" Error

**Problem**: API returns "Invalid JWT token" error

**Solution**:
1. Verify `SUPABASE_JWT_SECRET` in `apps/api/.env` matches Supabase dashboard
2. Check JWT secret under: Settings > API > JWT Settings > JWT Secret
3. Restart API server after updating `.env`

### "Connection refused" Database Error

**Problem**: Can't connect to PostgreSQL database

**Solution**:
1. Verify `DATABASE_URL` is correct in `apps/api/.env`
2. Check database password is correct (no special characters causing issues)
3. Ensure Supabase project is running (check dashboard)
4. Try connection string from: Settings > Database > Connection string

### OAuth Callback "Redirect URI mismatch"

**Problem**: Google OAuth fails with redirect URI error

**Solution**:
1. In Supabase, verify redirect URL: Authentication > URL Configuration
2. Should include: `http://localhost:3000/auth/callback`
3. In Google Cloud Console, verify authorized redirect URI
4. Should match: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

### "Multiple GoTrueClient instances" Warning

**Problem**: Console shows multiple Supabase client warnings

**Solution**:
- This is a known issue in development mode with hot reloading
- Safe to ignore - does not affect functionality
- Will not appear in production builds

### Tests Failing

**Problem**: Tests fail with "Playwright Test needs to be invoked" error

**Solution**:
```bash
# E2E tests use Playwright, run separately:
pnpm exec playwright test

# Unit/integration tests use Jest:
pnpm test
```

## Project Structure

```
relationhub/
├── apps/
│   ├── api/              # NestJS backend (port 4000)
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   └── user/     # User module
│   │   └── .env          # Backend environment variables
│   └── web/              # Next.js frontend (port 3000)
│       ├── app/
│       │   ├── (auth)/   # Auth pages (login, signup)
│       │   └── (protected)/ # Protected pages (dashboard)
│       └── .env.local    # Frontend environment variables
└── packages/
    └── database/         # Shared Prisma schema
```

## Next Steps

- [ ] Configure production environment variables
- [ ] Set up CI/CD pipeline
- [ ] Enable Row Level Security (RLS) policies in Supabase
- [ ] Configure email templates in Supabase
- [ ] Set up monitoring and error tracking
- [ ] Review security best practices in SECURITY.md

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **NestJS Documentation**: https://docs.nestjs.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs

## Support

For issues or questions:
- Check existing issues in the repository
- Review the troubleshooting section above
- Consult the comprehensive error log: `/context/errors-solved.md`

---

**Setup complete!** 🎉 You're ready to start developing.
