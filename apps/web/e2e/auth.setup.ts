import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

/**
 * Global authentication setup for E2E tests
 *
 * This setup:
 * 1. Creates a Supabase test user if it doesn't exist
 * 2. Logs in the test user
 * 3. Stores the authenticated session state
 * 4. All subsequent tests will reuse this authenticated state
 *
 * Required environment variables:
 * - TEST_USER_EMAIL: Email for the test user (e.g., test@relationhub.com)
 * - TEST_USER_PASSWORD: Password for the test user
 */

setup("authenticate", async ({ page }) => {
  const testEmail = process.env.TEST_USER_EMAIL || "test@relationhub.com";
  const testPassword = process.env.TEST_USER_PASSWORD || "TestPassword123!";

  // Navigate to login page
  await page.goto("/login");

  // Wait for the Auth UI component to load
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Fill in login credentials
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);

  // Click the sign in button
  // The Supabase Auth UI uses a button with "Sign in" text
  await page.click('button:has-text("Sign in")');

  // Wait for redirect to dashboard or contacts page after successful login
  // This confirms authentication was successful
  await page.waitForURL(/\/(dashboard|contacts)/, { timeout: 30000 });

  // Verify we're actually authenticated by checking for user session
  const cookies = await page.context().cookies();
  const hasAuthCookie = cookies.some(
    (cookie) =>
      cookie.name.includes("sb-") && cookie.name.includes("auth-token"),
  );

  if (!hasAuthCookie) {
    throw new Error("Authentication failed - no auth cookie found");
  }

  console.log("✅ Authentication setup complete - test user logged in");

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
