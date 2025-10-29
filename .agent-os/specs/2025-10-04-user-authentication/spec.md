# Spec Requirements Document

> Spec: User Authentication & Authorization
> Created: 2025-10-04
> Status: Planning

## Overview

Implement a secure authentication and authorization system using Supabase Auth that enables users to register, log in, and manage their Cordiq account with support for email/password and social login providers (Google, LinkedIn).

## User Stories

### New User Registration

As a new user, I want to register for Cordiq using my email or social accounts, so that I can start managing my professional relationships.

**Workflow:**
1. User visits landing page and clicks "Sign Up"
2. User chooses registration method: email/password, Google, or LinkedIn
3. For email: user enters email and password, receives verification email
4. For social: user redirects to provider, grants permissions, returns to app
5. User profile is created automatically with basic information from provider
6. User is redirected to dashboard with onboarding flow

**Problem Solved:** Users need a frictionless way to create accounts without complex forms, while maintaining security standards.

### Existing User Login

As an existing user, I want to securely log in to my account, so that I can access my contacts and relationship management tools.

**Workflow:**
1. User visits login page
2. User selects login method (same as registration)
3. For email: enters credentials, clicks "Sign In"
4. For social: redirects to provider for authentication
5. Session is established with secure token storage
6. User lands on personalized dashboard

**Problem Solved:** Users need quick, secure access to their account across devices without remembering multiple passwords.

### Session Management

As a logged-in user, I want my session to persist across page refreshes and remain secure, so that I don't have to constantly re-authenticate while staying protected.

**Workflow:**
1. User authenticates successfully
2. Access token and refresh token stored securely (httpOnly cookies)
3. Frontend detects authentication state on page load
4. Protected routes automatically verify authentication
5. Session refreshes automatically before expiration
6. User can log out from any page, clearing all session data

**Problem Solved:** Balancing user convenience with security by maintaining sessions without exposing tokens to XSS attacks.

## Spec Scope

1. **Supabase Auth Integration** - Configure Supabase project with authentication enabled, set up OAuth providers (Google, LinkedIn), and configure redirect URLs
2. **Frontend Authentication UI** - Build registration, login, and password reset pages using Next.js App Router with Supabase Auth UI components
3. **Backend Authentication Middleware** - Implement NestJS guards to validate Supabase JWT tokens and protect API routes
4. **Session Management** - Configure secure token storage using httpOnly cookies, implement automatic token refresh, and handle session expiration
5. **User Profile Sync** - Automatically create User records in PostgreSQL upon successful authentication, sync profile data from OAuth providers

## Out of Scope

- Multi-factor authentication (MFA) - deferred to Phase 5 security hardening
- Email/SMS verification for email signups - using Supabase's built-in email verification only
- Role-based access control (RBAC) - deferred to Phase 5 team features
- Password strength requirements beyond Supabase defaults
- Account deletion or data export functionality

## Expected Deliverable

1. **Users can register** using email/password or social providers (Google, LinkedIn) and receive confirmation
2. **Users can log in** with their chosen authentication method and access protected routes
3. **Sessions persist securely** across page refreshes and API calls remain authenticated
4. **Protected routes redirect** unauthenticated users to login page automatically
5. **User profile data syncs** from OAuth providers into PostgreSQL User table

## Spec Documentation

- Tasks: @.agent-os/specs/2025-10-04-user-authentication/tasks.md
- Technical Specification: @.agent-os/specs/2025-10-04-user-authentication/sub-specs/technical-spec.md
- API Specification: @.agent-os/specs/2025-10-04-user-authentication/sub-specs/api-spec.md
- Database Schema: @.agent-os/specs/2025-10-04-user-authentication/sub-specs/database-schema.md
- Tests Specification: @.agent-os/specs/2025-10-04-user-authentication/sub-specs/tests.md
