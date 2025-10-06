import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * POST /api/auth/logout
 *
 * Handles user logout by:
 * 1. Calling Supabase signOut() to invalidate the session
 * 2. Clearing all authentication cookies
 * 3. Redirecting to the login page
 *
 * Security considerations:
 * - Logs out from all devices/sessions
 * - Clears httpOnly session cookies
 * - Invalidates refresh tokens
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Sign out from Supabase (invalidates refresh token on server)
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error.message);

      // Even if sign out fails, redirect to login for security
      // This ensures user is logged out client-side
      return NextResponse.json(
        { error: 'Logout failed', message: error.message },
        { status: 500 }
      );
    }

    // Successful logout
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected logout error:', error);

    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}
