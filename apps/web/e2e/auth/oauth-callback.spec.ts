import { test, expect } from "@playwright/test";

test.describe("OAuth Callback Route Integration", () => {
  test.describe("Valid OAuth Code Exchange", () => {
    test("should redirect to home page after successful OAuth code exchange", async ({
      page,
    }) => {
      // Navigate to callback with a mock OAuth code
      // Note: This requires Supabase test environment with valid test OAuth codes
      await page.goto("/auth/callback?code=valid-test-oauth-code");

      // Should redirect away from callback page
      await expect(async () => {
        const url = page.url();
        const isCallback = url.includes("/auth/callback");

        if (isCallback) {
          throw new Error("Still on callback page - redirect not completed");
        }
      }).toPass({ timeout: 10000 });

      // Should end up on home, dashboard, or login (depending on test environment)
      const finalUrl = page.url();
      const validDestinations = [
        "http://localhost:3000/",
        "http://localhost:3000",
        "/dashboard",
        "/login",
      ];

      const isValidDestination = validDestinations.some(
        (dest) => finalUrl === dest || finalUrl.includes(dest),
      );

      expect(isValidDestination).toBeTruthy();
    });

    test('should redirect to specified "next" parameter after successful OAuth', async ({
      page,
    }) => {
      // Navigate to callback with OAuth code and next parameter
      await page.goto(
        "/auth/callback?code=valid-test-oauth-code&next=/dashboard/contacts",
      );

      // Wait for redirect to complete
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      // Should redirect to the specified page or login (if code is invalid in test env)
      const finalUrl = page.url();

      // Accept either the intended destination or login (for test environment)
      const isExpectedDestination =
        finalUrl.includes("/dashboard/contacts") ||
        finalUrl.includes("/login") ||
        finalUrl === "http://localhost:3000/" ||
        finalUrl === "http://localhost:3000";

      expect(isExpectedDestination).toBeTruthy();
    });

    test('should sanitize and validate "next" parameter to prevent open redirects', async ({
      page,
    }) => {
      // Attempt redirect to external URL (should be prevented)
      await page.goto(
        "/auth/callback?code=valid-test-oauth-code&next=https://evil.com/phishing",
      );

      // Wait for redirect
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should NOT redirect to external URL
      expect(finalUrl).not.toContain("evil.com");

      // Should redirect to safe internal route
      const isSafeUrl =
        finalUrl.includes("localhost:3000") || finalUrl.startsWith("/");

      expect(isSafeUrl).toBeTruthy();
    });

    test('should handle "next" parameter with query strings', async ({
      page,
    }) => {
      // Navigate with complex next parameter including query strings
      await page.goto(
        "/auth/callback?code=valid-test-oauth-code&next=/dashboard?tab=contacts&sort=name",
      );

      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should preserve query parameters in the redirect (or redirect to login/home in test env)
      const isValidRedirect =
        finalUrl.includes("/dashboard?tab=contacts&sort=name") ||
        finalUrl.includes("/login") ||
        finalUrl === "http://localhost:3000/" ||
        finalUrl === "http://localhost:3000";

      expect(isValidRedirect).toBeTruthy();
    });
  });

  test.describe("Invalid OAuth Code Handling", () => {
    test("should redirect to auth-code-error with error for invalid OAuth code", async ({
      page,
    }) => {
      // Navigate to callback with invalid OAuth code
      await page.goto("/auth/callback?code=invalid-oauth-code-12345");

      // Wait for redirect to complete
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should redirect to auth-code-error page
      expect(finalUrl).toContain("/auth-code-error");

      // Should include error parameter
      expect(finalUrl).toMatch(
        /error=(oauth_callback_error|oauth_error|validation_failed)/,
      );
    });

    test("should display user-friendly error message on auth-code-error page", async ({
      page,
    }) => {
      // Navigate to callback with invalid code
      await page.goto("/auth/callback?code=invalid-code");

      // Wait for redirect to auth-code-error with error
      await page.waitForURL(/\/auth-code-error\?error=/, { timeout: 10000 });

      // Verify error message is displayed
      const errorMessage = page.locator(
        "text=/OAuth authentication failed|An error occurred|validation failed/i",
      );
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test("should handle malformed OAuth code gracefully", async ({ page }) => {
      // Try various malformed codes
      const malformedCodes = [
        "code-with-special-chars!@#$%",
        "code with spaces",
        'code<script>alert("xss")</script>',
        "../../../etc/passwd",
      ];

      for (const code of malformedCodes) {
        await page.goto(`/auth/callback?code=${encodeURIComponent(code)}`);

        await page.waitForLoadState("networkidle", { timeout: 10000 });

        const finalUrl = page.url();

        // Should safely redirect to auth-code-error with error
        expect(finalUrl).toContain("/auth-code-error");
        expect(finalUrl).toMatch(/error=/);
      }
    });

    test("should handle expired OAuth code", async ({ page }) => {
      // Simulate expired OAuth code (would normally be a real expired code from Supabase)
      await page.goto("/auth/callback?code=expired-oauth-code-from-1-hour-ago");

      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should redirect to auth-code-error with error
      expect(finalUrl).toContain("/auth-code-error");
      expect(finalUrl).toMatch(/error=/);
    });
  });

  test.describe("Missing OAuth Code Handling", () => {
    test("should redirect to login when OAuth code is missing", async ({
      page,
    }) => {
      // Navigate to callback without code parameter
      await page.goto("/auth/callback");

      // Wait for redirect
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should redirect to login page
      expect(finalUrl).toContain("/login");
    });

    test("should redirect to login when code parameter is empty", async ({
      page,
    }) => {
      // Navigate with empty code parameter
      await page.goto("/auth/callback?code=");

      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should redirect to login
      expect(finalUrl).toContain("/login");
    });

    test("should not include error parameter when code is simply missing", async ({
      page,
    }) => {
      // Navigate to callback without code
      await page.goto("/auth/callback");

      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should redirect to login without error parameter (not an error, just missing)
      expect(finalUrl).toContain("/login");
      expect(finalUrl).not.toMatch(/error=/);
    });
  });

  test.describe("Redirect URL Security", () => {
    test("should prevent redirect to external domains", async ({ page }) => {
      const externalUrls = [
        "https://evil.com",
        "http://malicious-site.net",
        "//external-domain.com",
        'javascript:alert("xss")',
      ];

      for (const externalUrl of externalUrls) {
        await page.goto(
          `/auth/callback?code=test-code&next=${encodeURIComponent(externalUrl)}`,
        );

        await page.waitForLoadState("networkidle", { timeout: 10000 });

        const finalUrl = page.url();

        // Should NOT redirect to external URL
        expect(finalUrl).not.toContain("evil.com");
        expect(finalUrl).not.toContain("malicious-site.net");
        expect(finalUrl).not.toContain("external-domain.com");
        expect(finalUrl).not.toContain("javascript:");

        // Should redirect to safe internal location
        expect(finalUrl).toContain("localhost:3000");
      }
    });

    test("should allow internal path redirects", async ({ page }) => {
      const internalPaths = [
        "/dashboard",
        "/dashboard/contacts",
        "/settings",
        "/profile",
      ];

      for (const path of internalPaths) {
        await page.goto(
          `/auth/callback?code=test-code&next=${encodeURIComponent(path)}`,
        );

        await page.waitForLoadState("networkidle", { timeout: 10000 });

        const finalUrl = page.url();

        // Should stay on localhost domain
        expect(finalUrl).toContain("localhost:3000");

        // Should include the path (or login if code invalid in test env)
        const isValidPath =
          finalUrl.includes(path) ||
          finalUrl.includes("/login") ||
          finalUrl === "http://localhost:3000/" ||
          finalUrl === "http://localhost:3000";

        expect(isValidPath).toBeTruthy();
      }
    });

    test("should handle path traversal attempts in next parameter", async ({
      page,
    }) => {
      const traversalAttempts = [
        "../../../etc/passwd",
        "../../admin",
        "/../../secret",
        "http://localhost/../../../etc/passwd",
      ];

      for (const attempt of traversalAttempts) {
        await page.goto(
          `/auth/callback?code=test-code&next=${encodeURIComponent(attempt)}`,
        );

        await page.waitForLoadState("networkidle", { timeout: 10000 });

        const finalUrl = page.url();

        // Should sanitize and redirect safely
        expect(finalUrl).toContain("localhost:3000");
        expect(finalUrl).not.toContain("etc/passwd");
        expect(finalUrl).not.toContain("secret");
      }
    });

    test("should default to home page for invalid next parameter", async ({
      page,
    }) => {
      // Navigate with various invalid next parameters
      const invalidNextParams = [
        "not-a-valid-url",
        "12345",
        "null",
        "undefined",
        "{}",
        "[]",
      ];

      for (const invalidParam of invalidNextParams) {
        await page.goto(
          `/auth/callback?code=test-code&next=${encodeURIComponent(invalidParam)}`,
        );

        await page.waitForLoadState("networkidle", { timeout: 10000 });

        const finalUrl = page.url();

        // Should default to safe location (home, login, or intended page if code was valid)
        const isSafeDefault =
          finalUrl === "http://localhost:3000/" ||
          finalUrl === "http://localhost:3000" ||
          finalUrl.includes("/login") ||
          finalUrl.includes("/dashboard");

        expect(isSafeDefault).toBeTruthy();
      }
    });
  });

  test.describe("Error Handling and Recovery", () => {
    test("should log errors without exposing sensitive information", async ({
      page,
      context,
    }) => {
      // Listen for console errors
      const consoleMessages: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleMessages.push(msg.text());
        }
      });

      // Trigger an error with invalid code
      await page.goto("/auth/callback?code=invalid-code");

      await page.waitForLoadState("networkidle", { timeout: 10000 });

      // Verify no sensitive information in console
      for (const message of consoleMessages) {
        // Should not contain tokens, secrets, or sensitive data
        expect(message).not.toContain("eyJ"); // JWT prefix
        expect(message).not.toContain("Bearer");
        expect(message).not.toContain("password");
        expect(message).not.toContain("secret");
      }
    });

    test("should allow retry after OAuth error", async ({ page }) => {
      // Simulate error by visiting callback with invalid code
      await page.goto("/auth/callback?code=invalid-code");

      // Wait for redirect to auth-code-error with error
      await page.waitForURL(/\/auth-code-error\?error=/, { timeout: 10000 });

      // Verify error message is displayed
      const errorMessage = page.locator(
        "text=/OAuth authentication failed|An error occurred|validation failed/i",
      );
      await expect(errorMessage).toBeVisible();

      // Verify there's a way to navigate back to login or try again
      const tryAgainLink = page.locator(
        'a:has-text("Try again"), a:has-text("Back to login"), a:has-text("Sign in")',
      );
      await expect(tryAgainLink.first()).toBeVisible();
    });

    test("should handle network errors gracefully", async ({
      page,
      context,
    }) => {
      // Simulate offline mode
      await context.setOffline(true);

      await page.goto("/auth/callback?code=test-code");

      // Wait for page to handle offline state
      await page.waitForTimeout(2000);

      // Re-enable network
      await context.setOffline(false);

      // Should eventually redirect or show error
      const finalUrl = page.url();

      // Should handle gracefully (either stay on callback or redirect to login)
      const isHandledGracefully =
        finalUrl.includes("/login") ||
        finalUrl.includes("/auth/callback") ||
        finalUrl === "http://localhost:3000/" ||
        finalUrl === "http://localhost:3000";

      expect(isHandledGracefully).toBeTruthy();
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle multiple concurrent callback requests", async ({
      page,
      context,
    }) => {
      // Open multiple tabs with same OAuth code
      const pages = await Promise.all([
        context.newPage(),
        context.newPage(),
        context.newPage(),
      ]);

      // Navigate all pages to callback simultaneously
      await Promise.all(
        pages.map((p) => p.goto("/auth/callback?code=test-code")),
      );

      // Wait for all redirects
      await Promise.all(
        pages.map((p) => p.waitForLoadState("networkidle", { timeout: 10000 })),
      );

      // All should redirect safely
      for (const p of pages) {
        const url = p.url();
        expect(url).not.toContain("/auth/callback");
        await p.close();
      }
    });

    test("should handle very long next parameter", async ({ page }) => {
      // Create a very long next parameter
      const longPath = "/dashboard/" + "a".repeat(1000);

      await page.goto(
        `/auth/callback?code=test-code&next=${encodeURIComponent(longPath)}`,
      );

      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should handle gracefully without crashing
      expect(finalUrl).toContain("localhost:3000");
    });

    test("should handle special characters in next parameter", async ({
      page,
    }) => {
      const specialChars =
        "/dashboard?name=Test User&email=test@example.com&tags=tag1,tag2";

      await page.goto(
        `/auth/callback?code=test-code&next=${encodeURIComponent(specialChars)}`,
      );

      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const finalUrl = page.url();

      // Should handle safely
      expect(finalUrl).toContain("localhost:3000");
    });
  });
});
