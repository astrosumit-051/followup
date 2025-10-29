/**
 * Contact Performance Tests
 *
 * Tests performance metrics for contact CRUD operations with 1000+ contacts:
 * - List page load time
 * - Search response time
 * - Form submission time
 * - Pagination performance
 *
 * Prerequisites:
 * - Backend running with performance test data (1000+ contacts)
 * - Run seed script: cd apps/api && pnpm prisma db seed:performance
 * - Authenticated session with performance.test@cordiq.com user
 */

import { test, expect, Page } from "@playwright/test";

const PERFORMANCE_THRESHOLDS = {
  LIST_PAGE_LOAD: 3000, // 3 seconds max for initial load
  SEARCH_RESPONSE: 500, // 500ms max for search results
  FORM_SUBMISSION: 1000, // 1 second max for form submission
  PAGINATION_LOAD: 2000, // 2 seconds max for pagination
};

// Helper function to measure page load performance
async function measurePageLoad(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url, { waitUntil: "domcontentloaded" }); // Changed from networkidle - unreliable with GraphQL
  const endTime = Date.now();
  return endTime - startTime;
}

// Helper function to measure interaction performance
async function measureInteraction(
  page: Page,
  action: () => Promise<void>,
): Promise<number> {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();
  return endTime - startTime;
}

test.describe("Contact Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Implement authentication for performance.test@cordiq.com user
    // This will be implemented once Supabase test environment is set up
    // For now, tests will be skipped with annotation
    test.skip(true, "Skipping until backend with test data is available");
  });

  test.describe("List Page Performance", () => {
    test("should load contact list page with 1000+ contacts in under 3 seconds", async ({
      page,
    }) => {
      const loadTime = await measurePageLoad(page, "/contacts");

      console.log(`📊 Contact list load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LIST_PAGE_LOAD);

      // Verify contacts are displayed
      const contactCards = page.locator('[data-testid^="contact-card-"]');
      const count = await contactCards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(20); // Default page size
    });

    test("should display loading indicators during initial load", async ({
      page,
    }) => {
      await page.goto("/contacts");

      // Check for loading skeleton or spinner
      const loadingIndicator = page
        .locator('[data-testid="contacts-loading"]')
        .or(page.locator("text=Loading..."));

      // Loading should appear briefly
      const isVisible = await loadingIndicator.isVisible().catch(() => false);
      console.log(`📊 Loading indicator visible: ${isVisible}`);
    });
  });

  test.describe("Search Performance", () => {
    test("should return search results in under 500ms", async ({ page }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      const searchInput = page.locator('[data-testid="contact-search-input"]');

      const searchTime = await measureInteraction(page, async () => {
        await searchInput.fill("John");
        await page.waitForResponse(
          (response) =>
            response.url().includes("graphql") && response.status() === 200,
        );
      });

      console.log(`🔍 Search response time: ${searchTime}ms`);
      expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE);

      // Verify filtered results
      const contactCards = page.locator('[data-testid^="contact-card-"]');
      const count = await contactCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should handle debounced search efficiently", async ({ page }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      const searchInput = page.locator('[data-testid="contact-search-input"]');

      // Type multiple characters rapidly
      await searchInput.type("John", { delay: 50 }); // 50ms between keystrokes

      // Wait for debounce and response
      await page.waitForTimeout(500); // Debounce delay
      await page.waitForResponse(
        (response) =>
          response.url().includes("graphql") && response.status() === 200,
      );

      // Only one request should be made after debounce
      const contactCards = page.locator('[data-testid^="contact-card-"]');
      const count = await contactCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should handle empty search results quickly", async ({ page }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      const searchInput = page.locator('[data-testid="contact-search-input"]');

      const searchTime = await measureInteraction(page, async () => {
        await searchInput.fill("NONEXISTENT_CONTACT_XYZ123");
        await page.waitForResponse(
          (response) =>
            response.url().includes("graphql") && response.status() === 200,
        );
      });

      console.log(`🔍 Empty search response time: ${searchTime}ms`);
      expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE);

      // Verify empty state
      const emptyState = page.locator('[data-testid="contacts-empty"]');
      await expect(emptyState).toBeVisible();
    });
  });

  test.describe("Form Submission Performance", () => {
    test("should submit new contact form in under 1 second", async ({
      page,
    }) => {
      await page.goto("/contacts/new");
      // Wait removed - networkidle unreliable with GraphQL

      const submitTime = await measureInteraction(page, async () => {
        await page.fill(
          '[data-testid="contact-form-name"]',
          "Performance Test Contact",
        );
        await page.fill(
          '[data-testid="contact-form-email"]',
          "perf.test@example.com",
        );
        await page.fill(
          '[data-testid="contact-form-phone"]',
          "+1 (555) 123-4567",
        );
        await page.selectOption(
          '[data-testid="contact-form-priority"]',
          "MEDIUM",
        );

        await page.click('[data-testid="contact-form-submit"]');

        await page.waitForResponse(
          (response) =>
            response.url().includes("graphql") && response.status() === 200,
        );
      });

      console.log(`📝 Form submission time: ${submitTime}ms`);
      expect(submitTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_SUBMISSION);

      // Verify redirect to detail page
      await expect(page).toHaveURL(/\/contacts\/[a-f0-9-]+$/);
    });

    test("should submit edit contact form in under 1 second", async ({
      page,
    }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      // Click first contact
      const firstContact = page
        .locator('[data-testid^="contact-card-"]')
        .first();
      await firstContact.click();

      // Navigate to edit
      await page.click('[data-testid="contact-detail-edit-button"]');
      // Wait removed - networkidle unreliable with GraphQL

      const submitTime = await measureInteraction(page, async () => {
        await page.fill(
          '[data-testid="contact-form-notes"]',
          "Updated via performance test",
        );

        await page.click('[data-testid="contact-form-submit"]');

        await page.waitForResponse(
          (response) =>
            response.url().includes("graphql") && response.status() === 200,
        );
      });

      console.log(`✏️ Edit form submission time: ${submitTime}ms`);
      expect(submitTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_SUBMISSION);
    });

    test("should show optimistic UI updates immediately", async ({ page }) => {
      await page.goto("/contacts/new");
      // Wait removed - networkidle unreliable with GraphQL

      await page.fill(
        '[data-testid="contact-form-name"]',
        "Optimistic Test Contact",
      );
      await page.fill(
        '[data-testid="contact-form-email"]',
        "optimistic@example.com",
      );
      await page.selectOption('[data-testid="contact-form-priority"]', "HIGH");

      await page.click('[data-testid="contact-form-submit"]');

      // Button should be disabled immediately
      const submitButton = page.locator('[data-testid="contact-form-submit"]');
      await expect(submitButton).toBeDisabled();

      // Loading state should appear within 100ms
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="contact-form-loading"]', {
        timeout: 100,
      });
      const loadingAppearTime = Date.now() - startTime;

      console.log(`⚡ Optimistic UI response time: ${loadingAppearTime}ms`);
      expect(loadingAppearTime).toBeLessThan(100);
    });
  });

  test.describe("Pagination Performance", () => {
    test("should load next page in under 2 seconds", async ({ page }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      // Scroll to load more button
      const loadMoreButton = page.locator('[data-testid="contacts-load-more"]');
      await loadMoreButton.scrollIntoViewIfNeeded();

      const paginationTime = await measureInteraction(page, async () => {
        await loadMoreButton.click();

        await page.waitForResponse(
          (response) =>
            response.url().includes("graphql") && response.status() === 200,
        );
      });

      console.log(`📄 Pagination load time: ${paginationTime}ms`);
      expect(paginationTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.PAGINATION_LOAD,
      );

      // Verify more contacts loaded
      const contactCards = page.locator('[data-testid^="contact-card-"]');
      const count = await contactCards.count();
      expect(count).toBeGreaterThan(20); // Should have more than initial page
    });

    test("should handle rapid pagination clicks gracefully", async ({
      page,
    }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      const loadMoreButton = page.locator('[data-testid="contacts-load-more"]');
      await loadMoreButton.scrollIntoViewIfNeeded();

      // Click load more multiple times rapidly
      await loadMoreButton.click();
      await loadMoreButton.click();
      await loadMoreButton.click();

      // Wait for responses
      await page.waitForTimeout(2000);

      // Should not cause errors
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).not.toBeVisible();
    });

    test("should maintain scroll position during pagination", async ({
      page,
    }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      const loadMoreButton = page.locator('[data-testid="contacts-load-more"]');
      await loadMoreButton.scrollIntoViewIfNeeded();

      const scrollPositionBefore = await page.evaluate(() => window.scrollY);

      await loadMoreButton.click();
      await page.waitForResponse(
        (response) =>
          response.url().includes("graphql") && response.status() === 200,
      );

      const scrollPositionAfter = await page.evaluate(() => window.scrollY);

      console.log(
        `📜 Scroll position change: ${Math.abs(scrollPositionAfter - scrollPositionBefore)}px`,
      );

      // Scroll position should not jump significantly
      expect(Math.abs(scrollPositionAfter - scrollPositionBefore)).toBeLessThan(
        200,
      );
    });
  });

  test.describe("Filter Performance", () => {
    test("should apply filters in under 500ms", async ({ page }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      const priorityFilter = page.locator(
        '[data-testid="contact-filter-priority"]',
      );

      const filterTime = await measureInteraction(page, async () => {
        await priorityFilter.selectOption("HIGH");

        await page.waitForResponse(
          (response) =>
            response.url().includes("graphql") && response.status() === 200,
        );
      });

      console.log(`🎯 Filter response time: ${filterTime}ms`);
      expect(filterTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE);

      // Verify filtered results
      const contactCards = page.locator('[data-testid^="contact-card-"]');
      const count = await contactCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should combine multiple filters efficiently", async ({ page }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      const startTime = Date.now();

      await page.selectOption(
        '[data-testid="contact-filter-priority"]',
        "HIGH",
      );
      await page.waitForTimeout(100);

      await page.fill('[data-testid="contact-search-input"]', "Smith");
      await page.waitForTimeout(100);

      await page.selectOption('[data-testid="contact-sort"]', "name");

      await page.waitForResponse(
        (response) =>
          response.url().includes("graphql") && response.status() === 200,
      );

      const totalTime = Date.now() - startTime;

      console.log(`🎯 Combined filter time: ${totalTime}ms`);
      expect(totalTime).toBeLessThan(1500); // 1.5 seconds for multiple filters
    });
  });

  test.describe("Memory and Resource Management", () => {
    test("should not cause memory leaks during rapid navigation", async ({
      page,
    }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      // Navigate between pages rapidly
      for (let i = 0; i < 10; i++) {
        await page.goto("/contacts/new");
        await page.waitForTimeout(200);
        await page.goto("/contacts");
        await page.waitForTimeout(200);
      }

      // Check for console errors
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          console.error("❌ Console error:", msg.text());
        }
      });

      // Page should still be responsive
      const searchInput = page.locator('[data-testid="contact-search-input"]');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
    });

    test("should handle large contact lists without crashing", async ({
      page,
    }) => {
      await page.goto("/contacts");
      // Wait removed - networkidle unreliable with GraphQL

      // Load multiple pages
      const loadMoreButton = page.locator('[data-testid="contacts-load-more"]');

      for (let i = 0; i < 5; i++) {
        if (await loadMoreButton.isVisible()) {
          await loadMoreButton.scrollIntoViewIfNeeded();
          await loadMoreButton.click();
          await page.waitForTimeout(500);
        }
      }

      // Verify page is still responsive
      const contactCards = page.locator('[data-testid^="contact-card-"]');
      const count = await contactCards.count();
      console.log(`📊 Total contacts loaded: ${count}`);
      expect(count).toBeGreaterThan(20);

      // Search should still work
      const searchInput = page.locator('[data-testid="contact-search-input"]');
      await searchInput.fill("Test");
      await page.waitForTimeout(500);
      await expect(searchInput).toHaveValue("Test");
    });
  });
});
