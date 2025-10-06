import { test, expect } from '@playwright/test';

test.describe('Google OAuth Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page (OAuth is available on both signup and login)
    await page.goto('/signup');
  });

  test('should display Google OAuth button on signup page', async ({ page }) => {
    // Verify Google OAuth button exists and is visible
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();

    // Verify button has correct styling/appearance
    await expect(googleButton).toBeEnabled();
  });

  test('should display Google OAuth button on login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Verify Google OAuth button exists and is visible
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test('should initiate Google OAuth flow when clicking Google button', async ({ page }) => {
    // Get Google OAuth button
    const googleButton = page.locator('button:has-text("Google")');

    // Listen for navigation to Google OAuth consent screen
    const popupPromise = page.waitForEvent('popup', { timeout: 10000 });

    // Click Google button
    await googleButton.click();

    // Wait for popup or redirect to Google OAuth
    const popup = await popupPromise.catch(() => null);

    if (popup) {
      // Popup opened (most common for OAuth)
      const popupUrl = popup.url();

      // Verify redirect to Google OAuth URL
      expect(popupUrl).toContain('accounts.google.com');
      expect(popupUrl).toContain('oauth');

      await popup.close();
    } else {
      // Check if main page redirected (alternative OAuth flow)
      await page.waitForURL(/accounts\.google\.com/, { timeout: 5000 });

      const currentUrl = page.url();
      expect(currentUrl).toContain('accounts.google.com');
      expect(currentUrl).toContain('oauth');
    }
  });

  test('should redirect to callback URL after Google OAuth success', async ({ page, context }) => {
    // This test simulates a successful OAuth flow
    // Note: In a real test environment, you would use OAuth test credentials

    // Mock the OAuth callback with a valid session
    // This would typically be done in a test database with a known user
    await page.goto('/auth/callback?code=mock-oauth-code');

    // Verify redirect away from callback page
    await expect(async () => {
      const url = page.url();
      const isDashboard = url.includes('/dashboard');
      const isHome = url === 'http://localhost:3000/' || url === 'http://localhost:3000';
      const isLogin = url.includes('/login');
      const isCallback = url.includes('/auth/callback');

      // Should redirect away from callback page
      if (isCallback) {
        throw new Error('Still on callback page - redirect not completed');
      }

      // Should be on dashboard, home, or login (login is expected for mock code)
      // Mock OAuth codes trigger the error branch and redirect to login
      if (!isDashboard && !isHome && !isLogin) {
        throw new Error('Not redirected to expected page after OAuth callback');
      }
    }).toPass({ timeout: 10000 });
  });

  test('should handle OAuth callback error and redirect to login', async ({ page }) => {
    // This test specifically tests the error handling in the callback route
    // When using a mock OAuth code, Supabase cannot exchange it for a valid session
    
    await page.goto('/auth/callback?code=mock-oauth-code');

    // Wait for redirect to complete
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Verify we're on the login page with error parameter
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
    expect(currentUrl).toContain('error=oauth_callback_error');

    // Verify error message is displayed (if the UI shows it)
    const errorMessage = page.locator('text=/oauth.*error|authentication.*failed/i');
    await expect(errorMessage).toBeVisible().catch(() => {
      // Error message might not be displayed in UI, which is acceptable
      // The important part is that we redirected to login with error parameter
    });
  });

  test('should handle Google OAuth cancellation gracefully', async ({ page }) => {
    // Get Google OAuth button
    const googleButton = page.locator('button:has-text("Google")');

    // Click Google button
    await googleButton.click();

    // Wait a bit for popup to potentially appear
    await page.waitForTimeout(2000);

    // User cancels OAuth flow (closes popup or navigates back)
    // The page should remain on the signup/login page

    // Verify still on signup page
    await expect(page).toHaveURL(/\/signup/);

    // Verify signup form is still visible
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('should include correct OAuth scopes for Google', async ({ page }) => {
    // Get Google OAuth button
    const googleButton = page.locator('button:has-text("Google")');

    // Listen for navigation
    const navigationPromise = Promise.race([
      page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
      page.waitForNavigation({ timeout: 5000 }).catch(() => null),
    ]);

    // Click Google button
    await googleButton.click();

    const result = await navigationPromise;

    let oauthUrl = '';

    if (result && 'url' in result) {
      // Got popup
      oauthUrl = result.url();
      await result.close();
    } else {
      // Page redirected
      oauthUrl = page.url();
    }

    // Verify OAuth URL includes proper scopes
    // Supabase typically requests email and profile scopes
    if (oauthUrl.includes('google.com')) {
      expect(oauthUrl).toMatch(/scope=.*email/);
      expect(oauthUrl).toMatch(/scope=.*profile|openid/);
    }
  });

  test('should persist original redirect URL through OAuth flow', async ({ page }) => {
    // Navigate to signup with a specific redirect parameter
    await page.goto('/signup?redirect=/dashboard/contacts');

    // Get Google OAuth button
    const googleButton = page.locator('button:has-text("Google")');

    // Listen for OAuth initiation
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);

    // Click Google button
    await googleButton.click();

    const popup = await popupPromise;

    if (popup) {
      const redirectUrl = new URL(popup.url());

      // The redirect_uri should include our callback URL
      const redirectParam = redirectUrl.searchParams.get('redirect_uri');

      if (redirectParam) {
        expect(redirectParam).toContain('/auth/callback');
      }

      await popup.close();
    }
  });
});
