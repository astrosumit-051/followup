# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-10-04-user-authentication/spec.md

> Created: 2025-10-04
> Version: 1.0.0

## Test Coverage Overview

This specification outlines comprehensive testing for the authentication system across unit tests, integration tests, and end-to-end tests. Target coverage: 80%+ for all authentication-related code.

## Unit Tests

### Backend: AuthGuard (`apps/api/src/auth/auth.guard.spec.ts`)

**Class Under Test:** `AuthGuard`

**Test Cases:**

- **Valid JWT token with existing user**
  - Arrange: Mock valid JWT, mock user found in database
  - Act: Call `canActivate()` with mocked request containing Authorization header
  - Assert: Returns `true`, attaches user to `request.user`

- **Missing Authorization header**
  - Arrange: Request without Authorization header
  - Act: Call `canActivate()`
  - Assert: Throws `UnauthorizedException` with "Missing authentication token"

- **Invalid JWT signature**
  - Arrange: Mock JWT with invalid signature
  - Act: Call `canActivate()`
  - Assert: Throws `UnauthorizedException` with "Invalid or expired token"

- **Expired JWT token**
  - Arrange: Mock expired JWT (exp claim in past)
  - Act: Call `canActivate()`
  - Assert: Throws `UnauthorizedException`

- **Valid JWT but user not found in database**
  - Arrange: Mock valid JWT, mock user NOT found in database
  - Act: Call `canActivate()`
  - Assert: Throws `UnauthorizedException` with "User account not found"

- **Malformed Authorization header (missing Bearer prefix)**
  - Arrange: Authorization header with just token, no "Bearer" prefix
  - Act: Call `canActivate()`
  - Assert: Throws `UnauthorizedException`

**Mocking Requirements:**
- Mock `SupabaseService.verifyToken()` to return decoded payload or throw error
- Mock `UserService.findBySupabaseId()` to return user or throw NotFoundException

---

### Backend: UserService (`apps/api/src/user/user.service.spec.ts`)

**Class Under Test:** `UserService`

**Test Cases:**

- **findBySupabaseId - user exists**
  - Arrange: Mock Prisma to return user
  - Act: Call `findBySupabaseId('supabase-123')`
  - Assert: Returns User object

- **findBySupabaseId - user not found**
  - Arrange: Mock Prisma to return null
  - Act: Call `findBySupabaseId('invalid-id')`
  - Assert: Throws `NotFoundException`

- **syncUserFromSupabase - new user creation**
  - Arrange: Mock Prisma upsert to create new user (user doesn't exist)
  - Act: Call `syncUserFromSupabase()` with Supabase user data
  - Assert: User created with correct fields (supabaseId, email, name, profilePicture, provider)

- **syncUserFromSupabase - existing user update**
  - Arrange: Mock Prisma upsert to update existing user
  - Act: Call `syncUserFromSupabase()` with updated Supabase user data
  - Assert: User updated with new email, name, profilePicture, and lastLoginAt

- **updateProfile - successful update**
  - Arrange: Mock Prisma update
  - Act: Call `updateProfile(userId, { name: 'New Name' })`
  - Assert: Returns updated User with new name and updated `updatedAt`

- **updateProfile - validation failure**
  - Arrange: Invalid input (e.g., name too long)
  - Act: Call `updateProfile(userId, { name: 'x'.repeat(300) })`
  - Assert: Throws validation error

**Mocking Requirements:**
- Mock `PrismaService.user.findUnique()`, `.upsert()`, `.update()`

---

### Frontend: Supabase Client Utilities (`apps/web/lib/supabase/client.spec.ts`)

**Functions Under Test:** Supabase client creation and session management

**Test Cases:**

- **createClient - browser client initialization**
  - Arrange: Mock environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - Act: Call `createClient()`
  - Assert: Returns Supabase client instance with correct configuration

- **getSession - valid session exists**
  - Arrange: Mock Supabase to return valid session
  - Act: Call `getSession()`
  - Assert: Returns session with access_token and user

- **getSession - no session (logged out)**
  - Arrange: Mock Supabase to return null session
  - Act: Call `getSession()`
  - Assert: Returns null

**Mocking Requirements:**
- Mock `@supabase/supabase-js` createClient function
- Mock session storage (localStorage/cookies)

---

## Integration Tests

### Backend: Authentication Flow (`apps/api/test/auth.integration.spec.ts`)

**Test Cases:**

- **GraphQL query `me` with valid authentication**
  - Arrange: Create test user in database, generate valid Supabase JWT
  - Act: Send GraphQL query with Authorization header
  - Assert: Returns user data matching database record

- **GraphQL query `me` without authentication**
  - Arrange: No Authorization header
  - Act: Send GraphQL query
  - Assert: Returns 401 Unauthorized error

- **GraphQL mutation `updateProfile` with valid authentication**
  - Arrange: Authenticated user, valid input
  - Act: Send updateProfile mutation
  - Assert: User updated in database, returns updated data

- **User sync on first login**
  - Arrange: New Supabase user (not in database yet)
  - Act: Simulate login flow, trigger `syncUserFromSupabase`
  - Assert: User created in database with correct fields

**Setup Requirements:**
- Test database with migrations applied
- Supabase test project or mock Supabase JWT generation
- GraphQL test client

**Cleanup:**
- Clear test database after each test
- Reset Supabase test users

---

### Frontend: OAuth Callback Handling (`apps/web/app/auth/callback/route.spec.ts`)

**Test Cases:**

- **Valid OAuth callback with code**
  - Arrange: Mock Supabase `exchangeCodeForSession` to succeed
  - Act: Call GET `/auth/callback?code=abc123&next=/dashboard`
  - Assert: Redirects to `/dashboard`, sets httpOnly cookies

- **Invalid OAuth code**
  - Arrange: Mock Supabase to throw error on `exchangeCodeForSession`
  - Act: Call GET `/auth/callback?code=invalid`
  - Assert: Redirects to `/auth/auth-code-error`

- **Missing code parameter**
  - Arrange: No code in query params
  - Act: Call GET `/auth/callback`
  - Assert: Redirects to `/auth/auth-code-error`

- **Open redirect prevention**
  - Arrange: Malicious `next` parameter with external URL
  - Act: Call GET `/auth/callback?code=abc123&next=https://evil.com`
  - Assert: Redirects to default `/` instead of external URL

**Mocking Requirements:**
- Mock `createClient()` from `@/utils/supabase/server`
- Mock `exchangeCodeForSession()` response

---

## End-to-End Tests (Playwright)

### E2E: Email/Password Registration (`apps/web/e2e/auth-signup.spec.ts`)

**Test Scenario:** User registers with email and password

**Steps:**
1. Navigate to `/signup`
2. Fill in email input: `test@example.com`
3. Fill in password input: `SecurePassword123!`
4. Click "Sign Up" button
5. Verify redirect to email verification page
6. Mock email verification click (Supabase test environment)
7. Verify redirect to `/dashboard`
8. Verify user is authenticated (check for user menu/avatar)

**Assertions:**
- Email verification page displays correct message
- Dashboard loads with user data
- Session persists on page refresh

---

### E2E: Google OAuth Login (`apps/web/e2e/auth-google.spec.ts`)

**Test Scenario:** User logs in with Google OAuth

**Steps:**
1. Navigate to `/login`
2. Click "Continue with Google" button
3. Verify redirect to Google OAuth consent page (mock in test)
4. Mock user grants permissions
5. Verify redirect back to `/auth/callback` with code
6. Verify redirect to `/dashboard`
7. Verify user profile populated with Google data (name, email, profile picture)

**Assertions:**
- OAuth flow completes without errors
- User data synced from Google profile
- Session established (cookies set)

**Mocking Requirements:**
- Mock Google OAuth provider in Supabase test environment
- Use Playwright to intercept and mock OAuth redirect

---

### E2E: LinkedIn OAuth Login (`apps/web/e2e/auth-linkedin.spec.ts`)

**Test Scenario:** User logs in with LinkedIn OIDC

**Steps:**
1. Navigate to `/login`
2. Click "Continue with LinkedIn" button
3. Verify redirect to LinkedIn OAuth consent page (mock in test)
4. Mock user grants permissions
5. Verify redirect back to `/auth/callback` with code
6. Verify redirect to `/dashboard`
7. Verify user profile populated with LinkedIn data

**Assertions:**
- OAuth flow completes successfully
- Provider field set to `linkedin_oidc` in database
- Profile picture from LinkedIn displayed

---

### E2E: Session Persistence (`apps/web/e2e/auth-session.spec.ts`)

**Test Scenario:** Authenticated session persists across page refreshes and navigation

**Steps:**
1. Log in as test user
2. Navigate to `/dashboard`
3. Verify user is authenticated
4. Refresh page (F5)
5. Verify user still authenticated (no redirect to login)
6. Navigate to `/contacts`
7. Verify Authorization header sent with API requests
8. Verify user data available on page

**Assertions:**
- No re-authentication required after refresh
- API calls include valid JWT in Authorization header
- Session expires after token expiration (test with short expiration)

---

### E2E: Protected Route Redirect (`apps/web/e2e/auth-protected-route.spec.ts`)

**Test Scenario:** Unauthenticated user accessing protected route redirects to login

**Steps:**
1. Clear all cookies and session storage (ensure logged out)
2. Navigate directly to `/dashboard`
3. Verify redirect to `/login`
4. Verify URL includes `next=/dashboard` parameter
5. Log in as test user
6. Verify redirect back to `/dashboard` after successful login

**Assertions:**
- Protected route redirects to login
- After login, redirects back to original intended destination

---

### E2E: Logout Flow (`apps/web/e2e/auth-logout.spec.ts`)

**Test Scenario:** User logs out and session is cleared

**Steps:**
1. Log in as test user
2. Navigate to `/dashboard`
3. Click user menu → "Logout"
4. Verify redirect to `/login` or landing page
5. Verify cookies cleared
6. Attempt to navigate to `/dashboard`
7. Verify redirect to `/login` (no active session)

**Assertions:**
- Session cookies cleared on logout
- User cannot access protected routes after logout
- Subsequent login creates new session

---

## Performance Tests

### Token Validation Performance

**Test:** Measure AuthGuard token validation latency

**Setup:**
- Generate 1000 valid JWTs
- Send 1000 concurrent requests to protected GraphQL endpoint

**Assertions:**
- Average validation time < 50ms
- 99th percentile < 100ms
- No memory leaks or degradation over time

---

## Security Tests

### JWT Tampering Detection

**Test:** Verify AuthGuard rejects tampered tokens

**Steps:**
1. Generate valid JWT
2. Modify payload (change `sub` claim)
3. Send request with tampered token
4. Assert: 401 Unauthorized

### Token Expiration Enforcement

**Test:** Verify expired tokens are rejected

**Steps:**
1. Generate JWT with past `exp` claim
2. Send request with expired token
3. Assert: 401 Unauthorized

### CSRF Protection

**Test:** Verify authentication endpoints resist CSRF attacks

**Steps:**
1. Attempt to trigger OAuth callback from malicious origin
2. Assert: Request blocked or redirects fail due to origin mismatch

---

## Test Data Management

### Test Users

**Supabase Test Users:**
- `test-user-1@example.com` (email/password)
- `test-google@example.com` (Google OAuth)
- `test-linkedin@example.com` (LinkedIn OAuth)

**Database Seeding:**
- Create test users in PostgreSQL with known supabaseIds
- Seed with valid sessions for authenticated tests

**Cleanup:**
- Truncate `users` table after each integration test suite
- Clear Supabase test users after E2E tests

---

## Mocking Strategy

### Unit Tests
- Mock Supabase SDK entirely (no real API calls)
- Mock Prisma Client using `jest-mock-extended`

### Integration Tests
- Use Supabase test project with test database
- Mock OAuth providers (Google, LinkedIn) using test credentials

### E2E Tests
- Use Supabase local development environment (`supabase start`)
- Mock OAuth redirects using Playwright intercept
- Reset database state between tests

---

## CI/CD Integration

- Run unit tests on every commit
- Run integration tests on pull requests
- Run E2E tests on staging deployment
- Require 80% coverage for authentication module before merge
