# Security Documentation

> Last Updated: 2025-10-06
> Version: 1.0.0

This document outlines the security measures implemented in Cordiq to protect against common vulnerabilities and attacks.

## Security Features

### 1. Authentication & Authorization

**Implementation:**
- Supabase Auth with OAuth 2.0 and PKCE flow
- JWT token verification with `jose` library
- HTTP-only cookies for session storage
- Automatic token refresh before expiration

**Protection Against:**
- Unauthorized access (OWASP A01:2021)
- Session hijacking
- Token theft
- CSRF attacks (via PKCE)

**Files:**
- `apps/api/src/auth/auth.guard.ts` - Authentication guard
- `apps/api/src/auth/supabase.service.ts` - JWT verification
- `apps/web/middleware.ts` - Session management
- `apps/web/lib/supabase/server.ts` - Cookie-based client

### 2. Rate Limiting

**Implementation:**
- Global rate limiting with `@nestjs/throttler`
- 10 requests per 60 seconds per IP address
- Applied to all API endpoints

**Protection Against:**
- Brute-force attacks
- DDoS attempts
- API abuse

**Configuration:**
\`\`\`typescript
// apps/api/src/app.module.ts
ThrottlerModule.forRoot([
  {
    name: 'default',
    ttl: 60000, // 60 seconds
    limit: 10, // 10 requests per minute
  },
])
\`\`\`

### 3. Security Headers

**Implementation:**
- Helmet middleware on NestJS API
- Custom security headers on Next.js frontend

**Protection Against:**
- Clickjacking (X-Frame-Options)
- MIME type sniffing (X-Content-Type-Options)
- XSS attacks (Content-Security-Policy)
- Protocol downgrade attacks (Strict-Transport-Security)

**Backend Headers (Helmet):**
\`\`\`typescript
// apps/api/src/main.ts
app.use(helmet({
  contentSecurityPolicy: { ... },
  hsts: { maxAge: 31536000 },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
\`\`\`

**Frontend Headers (Next.js):**
\`\`\`javascript
// apps/web/next.config.mjs
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=()...' },
    ],
  }];
}
\`\`\`

### 4. Input Validation

**Implementation:**
- \`class-validator\` decorators on all DTOs
- Unicode-aware regex patterns
- Strict type checking with TypeScript

**Protection Against:**
- XSS attacks
- SQL injection (via Prisma ORM)
- Command injection
- Path traversal

### 5. CORS Configuration

**Implementation:**
- Environment-based origin whitelist
- Credentials support for cookies
- Explicit method and header allowlist

**Protection Against:**
- Cross-origin attacks
- Unauthorized API access

**Configuration:**
\`\`\`typescript
// apps/api/src/main.ts
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
\`\`\`

## Production Security Checklist

### Before Deployment

- [ ] Update \`FRONTEND_URL\` to production domain(s)
- [ ] Set \`PORT\` if not using default 3001
- [ ] Verify \`SUPABASE_URL\` points to production Supabase project
- [ ] Rotate \`SUPABASE_JWT_SECRET\` and \`SUPABASE_SERVICE_ROLE_KEY\`
- [ ] Update \`DATABASE_URL\` to production database
- [ ] Enable HTTPS in production (required for Helmet HSTS)
- [ ] Configure CSP directives for production (remove 'unsafe-inline')
- [ ] Set up monitoring for rate limit violations

### Environment Variables

**Required:**
\`\`\`bash
# Backend (apps/api/.env)
SUPABASE_URL=https://YOUR-PRODUCTION-PROJECT.supabase.co
SUPABASE_JWT_SECRET=your-production-jwt-secret
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
DATABASE_URL=postgresql://postgres:PASSWORD@production-db:5432/postgres
FRONTEND_URL=https://your-production-domain.com
PORT=3001

# Frontend (apps/web/.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PRODUCTION-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
\`\`\`

## Security Testing

**Total Tests:** 91 passing
- Authentication: 25 tests
- Input Validation: 33 tests
- Security Configuration: 7 tests
- User Service: 19 tests
- Integration: 7 tests

**Run Security Tests:**
\`\`\`bash
cd apps/api && pnpm jest
\`\`\`

## Changelog

### v1.0.0 (2025-10-06)
- Initial security implementation
- Rate limiting with @nestjs/throttler (10 req/min)
- Helmet security headers
- Next.js security headers
- Environment-based CORS configuration
- Input validation with Unicode support
- Open redirect prevention
- Sanitized error logging
- Comprehensive security test suite (91 tests)

---

**Note:** This document should be reviewed and updated whenever security features are added, modified, or removed.
