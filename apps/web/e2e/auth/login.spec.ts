import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display login form with email and password fields', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Login|Sign In/i);

    // Verify email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Verify password input exists
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Verify submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill in invalid email
    await page.fill('input[type="email"]', 'invalid-email');

    // Fill in any password
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify error message appears
    const errorMessage = page.locator('text=/invalid.*email/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should show error for incorrect credentials', async ({ page }) => {
    // Fill in non-existent email
    await page.fill('input[type="email"]', 'nonexistent@example.com');

    // Fill in password
    await page.fill('input[type="password"]', 'WrongPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify error message for invalid credentials
    const errorMessage = page.locator('text=/invalid.*credentials|incorrect.*password|email.*password.*incorrect/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should show error for empty password', async ({ page }) => {
    // Fill in valid email
    await page.fill('input[type="email"]', 'test@example.com');

    // Leave password empty
    await page.fill('input[type="password"]', '');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify error message
    const errorMessage = page.locator('text=/password.*required|enter.*password/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Note: This test requires a pre-existing test user in Supabase
    // In a real scenario, this would be set up in a test database
    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPass123!';

    // Fill in valid credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard or home page
    await expect(async () => {
      const url = page.url();
      const isDashboard = url.includes('/dashboard');
      const isHome = url === 'http://localhost:3000/';

      if (!isDashboard && !isHome) {
        throw new Error('Not redirected to dashboard or home page');
      }
    }).toPass({ timeout: 10000 });
  });

  test('should have working "Forgot password?" link', async ({ page }) => {
    // Find forgot password link
    const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("password")');

    // Verify link is visible (Supabase Auth UI includes this)
    const linkExists = await forgotPasswordLink.count();
    expect(linkExists).toBeGreaterThan(0);
  });

  test('should have working link to signup page', async ({ page }) => {
    // Find link to signup page
    const signupLink = page.locator('a[href*="/signup"]');
    await expect(signupLink).toBeVisible();

    // Click signup link
    await signupLink.click();

    // Verify redirected to signup page
    await expect(page).toHaveURL(/\/signup/);
    await expect(page).toHaveTitle(/Sign Up/i);
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

  test('should allow typing in password field', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');

    // Type password
    await passwordInput.fill('TestPassword123!');

    // Verify password was entered (value should be set)
    const passwordValue = await passwordInput.inputValue();
    expect(passwordValue).toBe('TestPassword123!');
  });

  test('should maintain email value after invalid login attempt', async ({ page }) => {
    const testEmail = 'test@example.com';

    // Fill in email and wrong password
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'WrongPassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error
    await page.waitForSelector('text=/invalid.*credentials/i', { timeout: 5000 });

    // Verify email is still filled
    const emailInput = page.locator('input[type="email"]');
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBe(testEmail);
  });
});
