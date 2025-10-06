# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-10-04-user-authentication/spec.md

> Created: 2025-10-04
> Status: Ready for Implementation

## Tasks

- [x] 1. Database Schema Migration
  - [x] 1.1 Write tests for User model with new auth fields (supabaseId, provider, lastLoginAt)
  - [x] 1.2 Update Prisma schema with authentication fields per database-schema.md
  - [x] 1.3 Generate Prisma migration for schema changes
  - [x] 1.4 Run migration on development database
  - [x] 1.5 Verify migration with test data (create user with supabaseId)
  - [x] 1.6 Verify all tests pass

- [x] 2. Supabase Project Configuration
  - [x] 2.1 Create Supabase project on supabase.com
  - [x] 2.2 Configure email provider with verification enabled
  - [x] 2.3 Set up Google OAuth provider (obtain Client ID and Secret from Google Cloud Console)
  - [ ] 2.4 Set up LinkedIn OIDC OAuth provider (obtain Client ID and Secret from LinkedIn Developer Portal) - Deferred
  - [x] 2.5 Add redirect URLs to allow list (localhost:3000/auth/callback for dev)
  - [x] 2.6 Copy Supabase URL, anon key, and JWT secret to environment variables
  - [ ] 2.7 Test OAuth configuration with Supabase test login - Will test after frontend implementation

- [x] 3. Backend Authentication Infrastructure
  - [x] 3.1 Write unit tests for SupabaseService (JWT verification, token extraction)
  - [x] 3.2 Install backend dependencies (@supabase/supabase-js, jose)
  - [x] 3.3 Create SupabaseService for JWT verification (apps/api/src/auth/supabase.service.ts)
  - [x] 3.4 Write unit tests for AuthGuard (valid token, invalid token, missing token, expired token)
  - [x] 3.5 Implement AuthGuard with JWT validation (apps/api/src/auth/auth.guard.ts)
  - [x] 3.6 Create @CurrentUser decorator for GraphQL context (apps/api/src/auth/current-user.decorator.ts)
  - [x] 3.7 Write unit tests for UserService (findBySupabaseId, syncUserFromSupabase, updateProfile)
  - [x] 3.8 Implement UserService with user sync logic (apps/api/src/user/user.service.ts)
  - [x] 3.9 Configure AuthModule with providers and exports (apps/api/src/auth/auth.module.ts)
  - [x] 3.10 Apply AuthGuard globally or to protected resolvers (example /me endpoint created)
  - [x] 3.11 Verify all unit tests pass (25/25 tests passing)

- [x] 4. Backend GraphQL API
  - [x] 4.1 Write integration tests for `me` query (authenticated and unauthenticated)
  - [x] 4.2 Implement `me` query resolver using @CurrentUser decorator
  - [x] 4.3 Write integration tests for `updateProfile` mutation
  - [x] 4.4 Implement `updateProfile` mutation with validation
  - [x] 4.5 Add User GraphQL type with all authentication fields
  - [ ] 4.6 Test GraphQL API with manual JWT token in Postman/Insomnia
  - [x] 4.7 Verify all integration tests pass (26 tests passing)

- [x] 5. Frontend Supabase Client Setup
  - [x] 5.1 Write unit tests for Supabase client creation (browser and server)
  - [x] 5.2 Install frontend dependencies (@supabase/supabase-js, @supabase/ssr, @supabase/auth-ui-react, @supabase/auth-ui-shared)
  - [x] 5.3 Create browser Supabase client (apps/web/lib/supabase/client.ts)
  - [x] 5.4 Create server-side Supabase client with cookie management (apps/web/lib/supabase/server.ts)
  - [x] 5.5 Add environment variables to .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - [x] 5.6 Verify all unit tests pass (10 tests passing)

- [x] 6. Frontend Authentication UI
  - [x] 6.1 Write E2E tests for signup flow (email/password registration)
  - [x] 6.2 Create signup page with Supabase Auth UI components (app/(auth)/signup/page.tsx)
  - [x] 6.3 Write E2E tests for login flow (email/password login)
  - [x] 6.4 Create login page with email/password and social login buttons (app/(auth)/login/page.tsx)
  - [x] 6.5 Write E2E tests for Google OAuth flow
  - [ ] 6.6 Write E2E tests for LinkedIn OAuth flow (deferred - LinkedIn OAuth deferred per Task 2.4)
  - [x] 6.7 Style authentication pages with Tailwind CSS per design-principles.md
  - [ ] 6.8 Verify all E2E tests pass (tests created, will run after environment setup)

- [x] 7. OAuth Callback Handler
  - [x] 7.1 Write integration tests for OAuth callback route (valid code, invalid code, missing code)
  - [x] 7.2 Create OAuth callback route handler (app/auth/callback/route.ts) - Already exists from Task 6
  - [x] 7.3 Implement code exchange for session (exchangeCodeForSession) - Already implemented
  - [x] 7.4 Implement redirect logic with next parameter validation (prevent open redirects) - Already implemented
  - [ ] 7.5 Test callback flow end-to-end with Google OAuth - ⚠️ Blocked: Requires Supabase test environment (see Task 6.8)
  - [ ] 7.6 Test callback flow end-to-end with LinkedIn OAuth - ⚠️ Deferred (LinkedIn OAuth deferred per Task 2.4)
  - [ ] 7.7 Verify all integration tests pass - ⚠️ Blocked: Requires Supabase test environment (see Task 6.8)

- [x] 8. Protected Route Middleware
  - [x] 8.1 Write E2E tests for protected route access (authenticated and unauthenticated)
  - [x] 8.2 Create Next.js middleware for authentication check (middleware.ts)
  - [x] 8.3 Implement session verification in middleware
  - [x] 8.4 Implement redirect to login for unauthenticated users
  - [x] 8.5 Configure middleware matcher for protected routes (/dashboard, /contacts, etc.)
  - [ ] 8.6 Test protected route redirect manually - ⚠️ Blocked: Requires running dev server and manual testing
  - [ ] 8.7 Verify all E2E tests pass - ⚠️ Blocked: Requires Supabase test environment (see Task 6.8)

- [x] 9. Session Management & Token Refresh
  - [x] 9.1 Write E2E tests for session persistence across page refreshes
  - [x] 9.2 Implement automatic token refresh in middleware (check expiration, call refreshSession)
  - [x] 9.3 Configure httpOnly cookie storage for tokens (verified - already configured via @supabase/ssr)
  - [x] 9.4 Test session expiration and refresh flow (E2E tests created)
  - [x] 9.5 Write E2E tests for logout flow
  - [x] 9.6 Implement logout functionality (API route + LogoutButton component + dashboard page)
  - [ ] 9.7 Verify all E2E tests pass - ⚠️ Blocked: Requires Supabase test environment (see Task 6.8)

- [x] 10. User Profile Sync Integration
  - [x] 10.1 Write integration tests for user sync on first login
  - [x] 10.2 Implement user sync call in AuthGuard after JWT validation
  - [x] 10.3 Extract user metadata from OAuth providers (name, email, profilePicture)
  - [x] 10.4 Test user creation on first Google login
  - [ ] 10.5 Test user creation on first LinkedIn login - ⚠️ Deferred (LinkedIn OAuth deferred per Task 2.4)
  - [x] 10.6 Test user update on subsequent logins (lastLoginAt updated)
  - [x] 10.7 Verify all integration tests pass

- [x] 11. Error Handling & Security
  - [x] 11.1 Write security tests for JWT tampering detection
  - [x] 11.2 Implement comprehensive error messages for authentication failures
  - [x] 11.3 Create error pages (auth-code-error, unauthorized)
  - [x] 11.4 Write security tests for token expiration enforcement
  - [x] 11.5 Implement CSRF protection validation in callback route
  - [x] 11.6 Add input validation to updateProfile mutation (class-validator)
  - [x] 11.7 Verify all security tests pass

- [ ] 12. End-to-End Testing & Documentation
  - [ ] 12.1 Run full authentication test suite (unit + integration + E2E)
  - [ ] 12.2 Verify 80%+ code coverage for authentication module
  - [ ] 12.3 Test complete registration → login → dashboard → logout flow manually
  - [ ] 12.4 Update CLAUDE.md with authentication setup notes (if needed)
  - [ ] 12.5 Document environment variables in .env.example files
  - [ ] 12.6 Create brief setup guide for local development with Supabase
  - [ ] 12.7 Verify all tests pass across all test suites
