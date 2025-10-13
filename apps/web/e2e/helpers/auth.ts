import { Page, expect } from "@playwright/test";

/**
 * Test helper functions for authentication flows
 */

/**
 * Fill email and password fields in auth forms
 */
export async function fillAuthCredentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
}

/**
 * Submit auth form by clicking submit button
 */
export async function submitAuthForm(page: Page): Promise<void> {
  await page.click('button[type="submit"]');
}

/**
 * Verify that an error message is visible on the page
 */
export async function expectErrorMessage(
  page: Page,
  pattern: RegExp,
  timeout: number = 5000,
): Promise<void> {
  const errorMessage = page.locator(`text=${pattern}`);
  await expect(errorMessage).toBeVisible({ timeout });
}

/**
 * Generate unique test email with timestamp
 */
export function generateTestEmail(prefix: string = "test"): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}@example.com`;
}

/**
 * Verify page has redirected to expected URL patterns
 */
export async function expectRedirectTo(
  page: Page,
  patterns: string[],
  timeout: number = 10000,
): Promise<void> {
  await expect(async () => {
    const url = page.url();
    const matchesAny = patterns.some((pattern) => url.includes(pattern));

    if (!matchesAny) {
      throw new Error(
        `Not redirected to any expected pattern. Current URL: ${url}`,
      );
    }
  }).toPass({ timeout });
}

/**
 * Common test credentials
 */
export const TEST_CREDENTIALS = {
  validEmail: "test@example.com",
  validPassword: "ValidPass123!",
  weakPassword: "weak",
  invalidEmail: "invalid-email",
} as const;
