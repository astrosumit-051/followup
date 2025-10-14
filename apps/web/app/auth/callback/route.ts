import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * OAuth callback route handler
 * Exchanges OAuth code for session and redirects user
 *
 * CSRF Protection Mechanisms:
 * 1. PKCE (Proof Key for Code Exchange) - Supabase automatically handles PKCE flow
 *    - Code verifier is generated and stored during authorization request
 *    - Code challenge is sent to OAuth provider
 *    - Callback validates code verifier matches code challenge
 *    - Prevents authorization code interception attacks
 *
 * 2. Authorization Code Single-Use - Supabase enforces one-time code usage
 *    - Each authorization code can only be exchanged once
 *    - Replay attacks are automatically prevented
 *
 * 3. Code Expiration - Authorization codes expire after 10 minutes
 *    - Reduces window for code theft and reuse
 *
 * 4. Same-Origin Redirect Validation - Prevents open redirect attacks
 *    - Only allows redirects to same origin
 *    - Blocks external domains, javascript: protocol, and malformed URLs
 *
 * @see https://supabase.com/docs/guides/auth/server-side/pkce-flow
 * @see https://datatracker.ietf.org/doc/html/rfc7636
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  // Validate code parameter exists and is non-empty
  if (!code || code.trim() === "") {
    console.warn("OAuth callback called without valid code parameter");
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  if (code) {
    const supabase = createServerClient();

    try {
      // Exchange code for session with PKCE verification
      // Supabase automatically validates:
      // - Code verifier matches code challenge (PKCE)
      // - Authorization code hasn't been used before
      // - Code hasn't expired (10 minute window)
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        // Log only safe error details (avoid exposing sensitive OAuth data)
        console.error("OAuth callback error:", {
          code: error.code || "oauth_callback_error",
          message: error.message || "Failed to complete authentication",
          // Omit: error.details, full stack traces, tokens
        });
        // Redirect to auth-code-error page with error details
        const errorUrl = new URL("/auth-code-error", requestUrl.origin);
        errorUrl.searchParams.set(
          "error",
          error.code || "oauth_callback_error",
        );
        errorUrl.searchParams.set(
          "error_description",
          error.message || "Failed to complete authentication",
        );
        return NextResponse.redirect(errorUrl);
      }

      // Validate and sanitize redirect URL to prevent open redirects
      const safeNext = validateRedirectUrl(next, requestUrl.origin);

      return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
    } catch (error) {
      // Log only safe error details (avoid exposing sensitive OAuth data)
      console.error("Unexpected OAuth error:", {
        message: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.constructor.name : typeof error,
        // Omit: full error object, stack traces, tokens
      });
      // Redirect to auth-code-error page for unexpected errors
      const errorUrl = new URL("/auth-code-error", requestUrl.origin);
      errorUrl.searchParams.set("error", "unexpected_error");
      errorUrl.searchParams.set(
        "error_description",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during authentication",
      );
      return NextResponse.redirect(errorUrl);
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}

/**
 * Validates redirect URL to prevent open redirects (OWASP A01:2021)
 *
 * Security Checks:
 * 1. Same-Origin Policy - Only allows redirects within the application
 * 2. Protocol Validation - Rejects javascript:, data:, file: protocols
 * 3. URL Parsing - Uses URL constructor to handle edge cases
 * 4. Fail-Safe Default - Returns "/" for any invalid input
 *
 * @param url - The redirect URL to validate
 * @param origin - The current origin (e.g., https://example.com)
 * @returns Safe redirect path (pathname + search only)
 *
 * @example
 * validateRedirectUrl('/dashboard', 'https://example.com') // Returns '/dashboard'
 * validateRedirectUrl('https://evil.com', 'https://example.com') // Returns '/'
 * validateRedirectUrl('javascript:alert(1)', 'https://example.com') // Returns '/'
 */
function validateRedirectUrl(url: string, origin: string): string {
  try {
    // Construct absolute URL for validation
    const redirectUrl = new URL(url, origin);

    // Security Check 1: Reject dangerous protocols
    const dangerousProtocols = ["javascript:", "data:", "file:", "vbscript:"];
    if (dangerousProtocols.some((proto) => redirectUrl.protocol === proto)) {
      console.warn(
        `Blocked redirect with dangerous protocol: ${redirectUrl.protocol}`,
      );
      return "/";
    }

    // Security Check 2: Enforce same-origin policy
    if (redirectUrl.origin === origin) {
      // Return only pathname and search params (no origin, protocol, or hash)
      return redirectUrl.pathname + redirectUrl.search;
    }

    // External origin attempted
    console.warn(`Blocked redirect to external origin: ${redirectUrl.origin}`);
  } catch (_error) {
    // Invalid URL format - error not needed, just log the URL
    console.warn(`Blocked redirect with invalid URL format: ${url}`);
  }

  // Default to home page for all rejected redirects
  return "/";
}
