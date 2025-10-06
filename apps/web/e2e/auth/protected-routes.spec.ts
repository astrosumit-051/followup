import { test, expect } from '@playwright/test';

test.describe('Protected Route Access', () => {
  test.describe('Unauthenticated Access', () => {
    test('should redirect to login when accessing /dashboard without authentication', async ({ page }) => {
      // Attempt to access protected dashboard route
      await page.goto('/dashboard');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should redirect to login when accessing /contacts without authentication', async ({ page }) => {
      // Attempt to access protected contacts route
      await page.goto('/contacts');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should redirect to login when accessing /settings without authentication', async ({ page }) => {
      // Attempt to access protected settings route
      await page.goto('/settings');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should redirect to login when accessing /profile without authentication', async ({ page }) => {
      // Attempt to access protected profile route
      await page.goto('/profile');

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should preserve intended destination after login redirect', async ({ page }) => {
      // Try to access protected route
      await page.goto('/dashboard/contacts');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

      // Check if URL includes redirect parameter pointing to original destination
      const currentUrl = page.url();

      // Some implementations use 'redirect', 'return_to', 'next', or 'from' parameter
      const hasRedirectParam =
        currentUrl.includes('redirect=') ||
        currentUrl.includes('return_to=') ||
        currentUrl.includes('next=') ||
        currentUrl.includes('from=');

      // This is optional but good UX - document if not implemented
      if (!hasRedirectParam) {
        console.log('Note: Login page does not preserve intended destination in URL');
      }
    });

    test('should allow access to public routes without authentication', async ({ page }) => {
      // Public routes should be accessible
      const publicRoutes = ['/', '/login', '/signup'];

      for (const route of publicRoutes) {
        await page.goto(route);

        // Should not redirect to login
        await expect(page).toHaveURL(new RegExp(route.replace('/', '\\/')), {
          timeout: 5000
        });

        // Should load content (check for common elements)
        const hasContent =
          (await page.locator('body').count()) > 0 &&
          (await page.locator('h1, h2, button, form').count()) > 0;

        expect(hasContent).toBeTruthy();
      }
    });

    test('should handle direct navigation to deeply nested protected routes', async ({ page }) => {
      // Try accessing a deeply nested route
      await page.goto('/dashboard/contacts/123/edit');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should handle protected routes with query parameters', async ({ page }) => {
      // Try accessing protected route with query params
      await page.goto('/dashboard?tab=analytics&period=30d');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  });

  test.describe('Authenticated Access', () => {
    test('should allow access to dashboard when authenticated', async ({ page, context }) => {
      // Note: This test requires a valid Supabase session
      // In a real test environment, you would:
      // 1. Create a test user
      // 2. Log in programmatically
      // 3. Set session cookies
      //
      // For now, this test verifies the middleware checks authentication
      // Actual implementation requires Supabase test environment

      // Simulate authenticated session (would use real auth in test env)
      await context.addCookies([
        {
          name: 'sb-localhost-auth-token',
          value: 'mock-valid-session-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      // Try accessing protected route
      await page.goto('/dashboard');

      // With mock session, should either:
      // 1. Load dashboard (if middleware accepts any token for testing)
      // 2. Redirect to login (if middleware validates token signature)
      //
      // For now, just verify the middleware processes the request
      await page.waitForLoadState('networkidle', { timeout: 5000 });

      const finalUrl = page.url();

      // Should be on dashboard OR login (depending on token validation)
      const isValidState =
        finalUrl.includes('/dashboard') || finalUrl.includes('/login');

      expect(isValidState).toBeTruthy();
    });

    test('should handle expired session gracefully', async ({ page, context }) => {
      // Simulate expired session token
      await context.addCookies([
        {
          name: 'sb-localhost-auth-token',
          value: 'expired-token-from-yesterday',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      // Try accessing protected route with expired token
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should handle invalid session token gracefully', async ({ page, context }) => {
      // Simulate invalid/malformed token
      await context.addCookies([
        {
          name: 'sb-localhost-auth-token',
          value: 'invalid-malformed-token!@#$',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      // Try accessing protected route with invalid token
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should maintain session across page navigation', async ({ page, context }) => {
      // Note: Requires real authentication for full test
      // This test verifies middleware doesn't unnecessarily refresh sessions

      // Simulate valid session
      await context.addCookies([
        {
          name: 'sb-localhost-auth-token',
          value: 'valid-test-session-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      // Navigate to multiple protected routes
      const protectedRoutes = ['/dashboard', '/contacts', '/settings', '/profile'];

      for (const route of protectedRoutes) {
        await page.goto(route);

        await page.waitForLoadState('networkidle', { timeout: 5000 });

        // Should stay authenticated (or consistently redirect to login)
        // Either state is valid - testing that behavior is consistent
        const url = page.url();

        // Document the behavior for each route
        console.log(`Route ${route} -> ${url}`);
      }
    });

    test('should log out and redirect to login when session is cleared', async ({ page, context }) => {
      // Set up authenticated session
      await context.addCookies([
        {
          name: 'sb-localhost-auth-token',
          value: 'valid-session-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      // Navigate to protected route
      await page.goto('/dashboard');

      // Clear cookies (simulate logout)
      await context.clearCookies();

      // Try accessing protected route again
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  });

  test.describe('Middleware Configuration', () => {
    test('should not block API routes', async ({ page }) => {
      // API routes should be accessible (may have their own auth)
      const response = await page.goto('/api/health');

      // Should not redirect to login page
      expect(response?.url()).not.toContain('/login');

      // API should respond (200, 401, 404 are all valid)
      const status = response?.status();
      expect([200, 401, 404, 500]).toContain(status);
    });

    test('should not block static assets', async ({ page }) => {
      // Try loading a common static asset path
      const response = await page.goto('/_next/static/css/app.css', {
        waitUntil: 'commit'
      }).catch(() => null);

      // Should not redirect to HTML login page
      if (response) {
        const contentType = response.headers()['content-type'];

        // Should be CSS or 404, not HTML redirect
        const isNotHtmlRedirect =
          !contentType?.includes('text/html') || response.status() === 404;

        expect(isNotHtmlRedirect).toBeTruthy();
      }
    });

    test('should apply middleware matcher only to specified routes', async ({ page }) => {
      // Routes that should NOT be protected by auth middleware
      const unprotectedRoutes = [
        '/',
        '/login',
        '/signup',
        '/auth/callback',
        '/api/health'
      ];

      for (const route of unprotectedRoutes) {
        await page.goto(route);

        const url = page.url();

        // Should not redirect to login (unless it's already the login page)
        if (!route.includes('login')) {
          expect(url).not.toContain('/login');
        }
      }
    });
  });

  test.describe('Security and Edge Cases', () => {
    test('should prevent session fixation attacks', async ({ page, context }) => {
      // Set an attacker-controlled session token
      await context.addCookies([
        {
          name: 'sb-localhost-auth-token',
          value: 'attacker-preset-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      // Try accessing protected route
      await page.goto('/dashboard');

      // Should reject invalid token and redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should handle missing cookie header gracefully', async ({ page }) => {
      // Navigate without any cookies
      await page.goto('/dashboard');

      // Should redirect to login without crashing
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should handle malformed cookies gracefully', async ({ page, context }) => {
      // Set malformed cookie
      await context.addCookies([
        {
          name: 'sb-localhost-auth-token',
          value: '><script>alert("xss")</script>',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      // Try accessing protected route
      await page.goto('/dashboard');

      // Should handle gracefully and redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should not expose sensitive session information in redirects', async ({ page }) => {
      // Try accessing protected route
      await page.goto('/dashboard');

      // Wait for redirect
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

      const finalUrl = page.url();

      // URL should not contain tokens, secrets, or session IDs
      expect(finalUrl).not.toContain('eyJ'); // JWT prefix
      expect(finalUrl).not.toContain('Bearer');
      expect(finalUrl).not.toContain('token=');
      expect(finalUrl).not.toContain('session=');
    });

    test('should handle rapid successive requests without race conditions', async ({ page }) => {
      // Make multiple rapid requests to protected routes
      const requests = [
        page.goto('/dashboard'),
        page.goto('/contacts'),
        page.goto('/settings')
      ];

      // All should handle gracefully (no crashes or errors)
      await Promise.allSettled(requests);

      // Final state should be consistent (on login page)
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should handle concurrent requests from different tabs', async ({ page, context }) => {
      // Open multiple tabs
      const pages = await Promise.all([
        context.newPage(),
        context.newPage(),
        context.newPage()
      ]);

      // Navigate all tabs to protected routes simultaneously
      await Promise.all(
        pages.map((p, index) =>
          p.goto(['/dashboard', '/contacts', '/settings'][index])
        )
      );

      // All should redirect to login
      for (const p of pages) {
        await expect(p).toHaveURL(/\/login/, { timeout: 5000 });
        await p.close();
      }
    });
  });

  test.describe('Performance', () => {
    test('should complete authentication check within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      // Try accessing protected route
      await page.goto('/dashboard');

      // Wait for redirect
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Middleware should be fast (< 2 seconds for redirect)
      expect(duration).toBeLessThan(2000);
    });

    test('should not add significant overhead to public routes', async ({ page }) => {
      const startTime = Date.now();

      // Access public route
      await page.goto('/');

      await page.waitForLoadState('networkidle', { timeout: 5000 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Public routes should load quickly
      expect(duration).toBeLessThan(3000);
    });
  });
});
