# Security & Credential Management

## Overview

This repository is **open source** and publicly accessible. Follow these guidelines to protect sensitive credentials while contributing to RelationHub.

---

## 🔒 Protected Files

The following files contain sensitive credentials and are **git-ignored**:

```
apps/web/.env
apps/web/.env.local
apps/api/.env
apps/api/.env.local
packages/**/.env
```

**NEVER commit these files to the repository.**

---

## ✅ What IS Committed (Safe)

Template files with placeholder values:

- `apps/web/.env.local.example` - Frontend environment template
- `apps/api/.env.example` - Backend environment template

These files show the **structure** of required environment variables without exposing actual credentials.

---

## 🛠️ Setting Up Your Environment

### 1. Copy Template Files

For the **frontend** (Next.js):
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

For the **backend** (NestJS):
```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Fill In Your Credentials

Edit the copied `.env` and `.env.local` files with your actual credentials:

**Frontend (`apps/web/.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon (public) key

**Backend (`apps/api/.env`):**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_JWT_SECRET` - Supabase JWT secret
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (⚠️ **NEVER expose this publicly**)
- `DATABASE_URL` - PostgreSQL connection string

### 3. Verify .gitignore Protection

Before committing, run:
```bash
git status
```

You should **NOT** see:
- `apps/web/.env.local`
- `apps/api/.env`

If these appear, **DO NOT COMMIT**. They should be git-ignored.

---

## 🚨 Credential Security Best Practices

### DO:
✅ Use `.env.example` templates for documentation
✅ Store credentials in local `.env` files (git-ignored)
✅ Use environment variables in CI/CD (GitHub Secrets, Vercel, etc.)
✅ Rotate credentials if accidentally exposed
✅ Use different credentials for dev/staging/production

### DON'T:
❌ Hardcode credentials in source code
❌ Commit `.env` files to the repository
❌ Share credentials in pull request descriptions
❌ Store credentials in screenshots or logs
❌ Use production credentials in development

---

## 🔄 Supabase Credentials

### Where to Find Your Credentials

1. **Project URL**: `https://YOUR_PROJECT_REF.supabase.co`
2. **Anon Key**: Project Settings → API → Project API keys → `anon` `public`
3. **Service Role Key**: Project Settings → API → Project API keys → `service_role` (⚠️ **Secret**)
4. **JWT Secret**: Project Settings → API → JWT Settings → JWT Secret

### Credential Types

| Credential | Exposure Level | Usage |
|------------|----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (in frontend bundle) | Frontend API calls |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (in frontend bundle) | Frontend authentication |
| `SUPABASE_JWT_SECRET` | **Secret** | Backend JWT verification |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Backend admin operations |
| `DATABASE_URL` | **Secret** | Direct database access |

**Note:** `NEXT_PUBLIC_` variables are exposed in the browser. Only use for non-sensitive, client-safe keys.

---

## 🚀 Production Deployment

### Recommended Platforms

**Frontend (Next.js):**
- Vercel
- Netlify
- AWS Amplify

**Backend (NestJS):**
- Railway
- Render
- AWS ECS/EKS
- DigitalOcean App Platform

### Setting Environment Variables

**Vercel:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

**Railway:**
```bash
railway variables set SUPABASE_URL=https://...
railway variables set SUPABASE_JWT_SECRET=...
railway variables set SUPABASE_SERVICE_ROLE_KEY=...
railway variables set DATABASE_URL=postgresql://...
```

**GitHub Actions (CI/CD):**
Add secrets in: `Repository → Settings → Secrets and variables → Actions`

---

## 🔍 Accidental Exposure Response

If you accidentally commit credentials:

### Immediate Actions:

1. **Rotate Credentials Immediately**
   - Go to Supabase → Project Settings → API
   - Generate new service role key
   - Update JWT secret if exposed

2. **Remove from Git History**
   ```bash
   # Remove sensitive file from all commits
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch apps/api/.env" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (⚠️ Coordinate with team first)
   git push origin --force --all
   ```

3. **Notify Team**
   - Alert collaborators about credential rotation
   - Update environment variables in all deployments

---

## 📝 Adding New Secrets

When introducing new environment variables:

1. Add placeholder to `.env.example` files:
   ```env
   # New Service API Key
   NEW_SERVICE_API_KEY=your-api-key-here
   ```

2. Document in this `SECURITY.md` file

3. Update deployment documentation

4. Verify git-ignore protection

---

## 🆘 Support

If you discover a security vulnerability, please email: **security@relationhub.io** (or your security contact).

Do **not** open a public issue for security vulnerabilities.

---

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)

---

**Last Updated:** 2025-10-04
