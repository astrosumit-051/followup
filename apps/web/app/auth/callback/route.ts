import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OAuth callback route handler
 * Exchanges OAuth code for session and redirects user
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = createServerClient();

    try {
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('OAuth callback error:', error);
        // Redirect to auth-code-error page with error details
        const errorUrl = new URL('/auth-code-error', requestUrl.origin);
        errorUrl.searchParams.set('error', error.code || 'oauth_callback_error');
        errorUrl.searchParams.set('error_description', error.message || 'Failed to complete authentication');
        return NextResponse.redirect(errorUrl);
      }

      // Validate and sanitize redirect URL to prevent open redirects
      const safeNext = validateRedirectUrl(next, requestUrl.origin);

      return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
    } catch (error) {
      console.error('Unexpected OAuth error:', error);
      // Redirect to auth-code-error page for unexpected errors
      const errorUrl = new URL('/auth-code-error', requestUrl.origin);
      errorUrl.searchParams.set('error', 'unexpected_error');
      errorUrl.searchParams.set(
        'error_description',
        error instanceof Error ? error.message : 'An unexpected error occurred during authentication'
      );
      return NextResponse.redirect(errorUrl);
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}

/**
 * Validates redirect URL to prevent open redirects
 * @param url - The redirect URL to validate
 * @param origin - The current origin
 * @returns Safe redirect path
 */
function validateRedirectUrl(url: string, origin: string): string {
  try {
    const redirectUrl = new URL(url, origin);

    // Only allow redirects to same origin
    if (redirectUrl.origin === origin) {
      return redirectUrl.pathname + redirectUrl.search;
    }
  } catch {
    // Invalid URL
  }

  // Default to home page for invalid or external URLs
  return '/';
}
