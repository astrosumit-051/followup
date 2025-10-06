import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page before each test
    await page.goto('/signup');
  });

  test('should display signup form with email and password fields', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Sign Up/i);

    // Verify email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Verify password input exists
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();

    // Verify submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill in invalid email
    await page.fill('input[type="email"]', 'invalid-email');

    // Fill in valid password
    await page.fill('input[type="password"]', 'ValidPass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify error message appears
    const errorMessage = page.locator('text=/invalid.*email/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should show error for weak password', async ({ page }) => {
    // Fill in valid email
    await page.fill('input[type="email"]', 'test@example.com');

    // Fill in weak password (less than 8 characters)
    await page.fill('input[type="password"]', 'weak');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify error message appears (Supabase requires 6+ chars by default)
    const errorMessage = page.locator('text=/password.*short|weak.*password/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should show error for duplicate email registration', async ({ page }) => {
    // Use a known test email that exists in the database
    const duplicateEmail = 'existing@example.com';

    // Fill in duplicate email
    await page.fill('input[type="email"]', duplicateEmail);

    // Fill in valid password
    await page.fill('input[type="password"]', 'ValidPass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify error message for duplicate email
    const errorMessage = page.locator('text=/already.*registered|user.*exists/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should successfully register with valid credentials', async ({ page }) => {
    // Generate unique email for test
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;

    // Fill in unique email
    await page.fill('input[type="email"]', testEmail);

    // Fill in valid password
    await page.fill('input[type="password"]', 'ValidPass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message or redirect
    // Option 1: Success message appears
    const successMessage = page.locator('text=/check.*email|verification.*sent/i');

    // Option 2: Redirected to email verification page
    const verificationPage = page.url().includes('/verify-email');

    // Wait for either success message or redirect
    await expect(async () => {
      const messageVisible = await successMessage.isVisible().catch(() => false);
      const isVerificationPage = page.url().includes('/verify-email');

      if (!messageVisible && !isVerificationPage) {
        throw new Error('Neither success message nor verification redirect occurred');
      }
    }).toPass({ timeout: 10000 });
  });

  test('should show email verification requirement message after signup', async ({ page }) => {
    // Generate unique email for test
    const timestamp = Date.now();
    const testEmail = `verify-test-${timestamp}@example.com`;

    // Fill in credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'ValidPass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify email verification message
    const verificationMessage = page.locator('text=/check.*email|confirm.*email|verify.*email/i');
    await expect(verificationMessage).toBeVisible({ timeout: 10000 });
  });

  test('should have working link to login page', async ({ page }) => {
    // Find link to login page
    const loginLink = page.locator('a[href*="/login"]');
    await expect(loginLink).toBeVisible();

    // Click login link
    await loginLink.click();

    // Verify redirected to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Login|Sign In/i);
  });

  test('should display Google OAuth button', async ({ page }) => {
    // Verify Google OAuth button exists
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();
  });

  test('should not display LinkedIn OAuth button (deferred)', async ({ page }) => {
    // Verify LinkedIn OAuth button does NOT exist (Task 2.4 deferred)
    const linkedinButton = page.locator('button:has-text("LinkedIn")');
    await expect(linkedinButton).not.toBeVisible();
  });
});
