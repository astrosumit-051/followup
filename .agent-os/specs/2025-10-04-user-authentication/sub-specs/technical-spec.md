# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-04-user-authentication/spec.md

> Created: 2025-10-04
> Version: 1.0.0

## Technical Requirements

### Frontend Requirements

- Next.js 14+ App Router with server components and server actions
- Supabase Auth UI components (`@supabase/auth-ui-react`, `@supabase/auth-ui-shared`)
- Supabase client for browser (`@supabase/supabase-js`)
- Server-side Supabase client with cookie-based session management (`@supabase/ssr`)
- Protected route middleware using Next.js middleware
- TypeScript strict mode enabled for type safety
- Tailwind CSS for authentication UI styling

### Backend Requirements

- NestJS authentication guards using JWT validation
- Supabase JWT verification (`@supabase/supabase-js` or `jose` for manual verification)
- Middleware to extract and validate Supabase access tokens from Authorization header
- GraphQL context authentication (attach user to context)
- Prisma User model sync on successful authentication
- Environment variables for Supabase URL and anon key

### Security Requirements

- HttpOnly cookies for token storage (mitigate XSS attacks)
- Automatic token refresh before expiration
- CSRF protection for authentication endpoints
- Secure redirect URLs (whitelist configuration in Supabase)
- Password hashing handled by Supabase (bcrypt)
- Rate limiting on authentication endpoints (defer to infrastructure)

### Performance Requirements

- Authentication state check < 50ms on protected routes
- Token refresh should not block user interactions
- Lazy load Supabase Auth UI components to reduce initial bundle size

## Approach Options

### Option A: NextAuth.js with Supabase Adapter

**Description:** Use NextAuth.js as the authentication abstraction layer with a Supabase adapter for database storage.

**Pros:**
- Provider-agnostic (easy to add more OAuth providers)
- Built-in session management and CSRF protection
- Large community and extensive documentation

**Cons:**
- Additional abstraction layer adds complexity
- Not leveraging Supabase Auth's full feature set (email verification, password reset)
- Requires custom adapter configuration
- More dependencies to maintain

### Option B: Direct Supabase Auth Integration (Selected)

**Description:** Use Supabase Auth directly for all authentication flows with custom NestJS guards for API protection.

**Pros:**
- Native integration with Supabase ecosystem
- Built-in email verification, password reset, and magic links
- Automatic token management and refresh
- Simpler architecture with fewer dependencies
- Direct support for social OAuth providers

**Cons:**
- Tighter coupling to Supabase (vendor lock-in)
- Custom guard implementation required for NestJS
- Less flexibility for adding non-Supabase auth methods

**Rationale:** Option B is selected because it aligns with the tech stack decision to use Supabase, reduces complexity by eliminating an abstraction layer, and provides all required features out-of-the-box. The vendor lock-in risk is acceptable given Supabase's open-source nature and export capabilities.

## Architecture Overview

### Authentication Flow

```
User → Frontend (Next.js) → Supabase Auth → OAuth Provider (Google/LinkedIn)
                ↓
         Session Cookie (httpOnly)
                ↓
    Protected Route Middleware → Verify Token
                ↓
         API Request with Authorization Header
                ↓
    NestJS Auth Guard → Validate Supabase JWT
                ↓
         GraphQL Resolver (user in context)
                ↓
         Prisma (sync User record)
```

### Component Breakdown

**Frontend:**
- `app/(auth)/login/page.tsx` - Login page with Supabase Auth UI
- `app/(auth)/signup/page.tsx` - Registration page
- `app/(auth)/callback/route.ts` - OAuth callback handler (PKCE flow)
- `middleware.ts` - Protected route verification
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client (SSR)

**Backend:**
- `apps/api/src/auth/auth.guard.ts` - NestJS guard for JWT validation
- `apps/api/src/auth/auth.decorator.ts` - Custom decorator to extract user from request
- `apps/api/src/auth/auth.module.ts` - Auth module configuration
- `apps/api/src/user/user.service.ts` - User profile sync service
- `apps/api/src/common/middleware/auth.middleware.ts` - Global auth middleware

## External Dependencies

### New Libraries

- **@supabase/supabase-js** (v2.45.0+)
  - Purpose: Core Supabase client for authentication
  - Justification: Official client for Supabase Auth integration

- **@supabase/ssr** (v0.5.0+)
  - Purpose: Server-side rendering support with cookie-based sessions
  - Justification: Required for Next.js App Router server components

- **@supabase/auth-ui-react** (v0.4.7+)
  - Purpose: Pre-built authentication UI components
  - Justification: Accelerates development with production-ready login/signup forms

- **@supabase/auth-ui-shared** (v0.1.8+)
  - Purpose: Shared utilities for Auth UI
  - Justification: Peer dependency of auth-ui-react

- **jose** (v5.2.0+)
  - Purpose: JWT verification for NestJS guards (alternative to @supabase/supabase-js)
  - Justification: Lightweight, standards-compliant JWT library for manual token verification

### Configuration Requirements

- **Supabase Project:**
  - Create project on supabase.com
  - Enable Email provider with email confirmation
  - Configure Google OAuth (Client ID, Client Secret)
  - Configure LinkedIn OIDC OAuth (Client ID, Client Secret)
  - Add redirect URLs to allow list: `http://localhost:3000/auth/callback` (dev), `https://cordiq.com/auth/callback` (prod)

- **Environment Variables:**
  ```
  # Frontend (.env.local)
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

  # Backend (.env)
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_JWT_SECRET=your-jwt-secret
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (for admin operations)
  ```

## Data Flow

### Registration Flow

1. User clicks "Sign up with Google/LinkedIn/Email"
2. Frontend calls `supabase.auth.signInWithOAuth()` or `supabase.auth.signUp()`
3. OAuth: Redirect to provider → User grants permissions → Redirect to callback
4. Email: User enters credentials → Supabase sends verification email
5. Callback route exchanges code for session (`exchangeCodeForSession`)
6. Session stored in httpOnly cookie
7. Frontend redirects to dashboard
8. Backend webhook receives `auth.user.created` event (optional)
9. User service creates User record in PostgreSQL with profile data

### Login Flow

1. User enters credentials or selects social provider
2. Frontend calls `supabase.auth.signInWithOAuth()` or `supabase.auth.signInWithPassword()`
3. Supabase validates credentials
4. Access token and refresh token returned
5. Tokens stored in httpOnly cookies
6. Frontend redirects to dashboard
7. Subsequent API requests include token in Authorization header

### Token Refresh Flow

1. Frontend middleware detects token expiring soon (< 5 minutes)
2. Calls `supabase.auth.refreshSession()`
3. Supabase validates refresh token
4. New access token and refresh token returned
5. Cookies updated automatically
6. User session continues seamlessly

### Protected Route Access

1. User navigates to `/dashboard` or other protected route
2. Next.js middleware runs before page render
3. Middleware checks for valid session (`supabase.auth.getSession()`)
4. If invalid: redirect to `/login`
5. If valid: allow access, attach user to page props
6. Page component makes API call with Authorization header
7. NestJS AuthGuard extracts token from header
8. Guard verifies JWT signature using Supabase JWT secret
9. Guard decodes payload and attaches user to request
10. Resolver accesses `@CurrentUser()` decorator to get user data

## Testing Strategy

- Unit tests for auth guards and middleware
- Integration tests for OAuth callback handling
- E2E tests for full authentication flows (registration, login, logout)
- Security tests for token validation and session management
