import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Authentication
 *
 * Protects routes that require authentication and redirects
 * unauthenticated users to the login page.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create Supabase client for server-side auth check
  const supabase = createServerClient();

  try {
    // Get current session
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    // Log authentication errors for debugging (without exposing sensitive data)
    if (error) {
      console.error('Middleware auth check error:', error.message);
    }

    // If no session, redirect to login
    if (!session) {
      const loginUrl = new URL('/login', request.url);

      // Optionally preserve the intended destination
      // Uncomment to enable return-to-URL functionality:
      // loginUrl.searchParams.set('redirect', pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Check if session is close to expiring (within 5 minutes)
    // Supabase sessions expire after 1 hour by default
    const expiresAt = session.expires_at; // Unix timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
    const fiveMinutes = 5 * 60;

    // Automatically refresh session if it's close to expiring
    // This prevents users from being logged out mid-session
    if (timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes) {
      console.log(
        `Session expiring in ${Math.floor(timeUntilExpiry / 60)} minutes, refreshing...`
      );
    }

    // Call getUser() which triggers automatic token refresh if needed
    // This is called on every request to ensure session is always fresh
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    // If token refresh failed or user is invalid, redirect to login
    if (userError || !user) {
      console.error('Token refresh failed:', userError?.message);

      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Session is valid and refreshed, allow access
    return NextResponse.next();
  } catch (error) {
    // Handle unexpected errors gracefully
    console.error('Middleware error:', error);

    // Redirect to login on error for security
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Middleware Matcher Configuration
 *
 * Specifies which routes should be protected by authentication.
 *
 * Protected routes:
 * - /dashboard/* - Main application dashboard
 * - /contacts/* - Contact management
 * - /settings/* - User settings
 * - /profile/* - User profile
 *
 * Excluded routes:
 * - /api/* - API routes (have their own auth)
 * - /_next/* - Next.js internals
 * - /auth/* - Authentication routes (login, signup, callback)
 * - / - Home/landing page
 * - /login, /signup - Public auth pages
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /api/* (API routes)
     * - /_next/* (Next.js internals)
     * - /auth/* (auth routes: login, signup, callback)
     * - / (home page)
     * - /login, /signup (public auth pages)
     * - .*\\..*  (files with extensions: css, js, images, etc.)
     */
    '/((?!api|_next|auth|login|signup$|$).*)'
  ]
};
