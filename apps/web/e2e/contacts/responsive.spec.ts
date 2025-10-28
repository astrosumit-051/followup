import { test, expect } from "@playwright/test";
import {
  createMultipleContactsFixture,
  Priority,
  Gender,
} from "../helpers/test-isolation";

/**
 * Responsive Design E2E Tests
 *
 * ✅ Fully migrated to use test isolation (no shared test data)
 *
 * Migration Strategy:
 * - Uses createMultipleContactsFixture with 5 contacts for grid layout testing
 * - Replaces placeholder "/contacts/[id]" with actual fixture contact IDs
 * - All contacts have unique UUID-based IDs (no race conditions)
 *
 * Tests contact CRUD pages across mobile, tablet, and desktop viewports.
 * Verifies:
 * - Layout adaptations at each breakpoint
 * - Touch target sizes on mobile (min 44px)
 * - Button stacking on small screens
 * - Grid responsiveness
 * - Text readability and truncation
 *
 * Viewports tested:
 * - Mobile: 375x667 (iPhone SE)
 * - Tablet: 768x1024 (iPad)
 * - Desktop: 1440x900 (standard laptop)
 */

// Helper function to check if element meets touch target size
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkTouchTargetSize(element: any, minSize = 44) {
  const box = await element.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.height).toBeGreaterThanOrEqual(minSize);
  }
}

test.describe("Contact List Page - Responsive Design", () => {
  // Create 5 contacts for grid layout testing
  const contactsFixture = createMultipleContactsFixture([
    {
      name: "Alice Anderson",
      email: "alice@example.com",
      priority: Priority.HIGH,
      gender: Gender.FEMALE,
    },
    {
      name: "Bob Brown",
      email: "bob@example.com",
      priority: Priority.MEDIUM,
      gender: Gender.MALE,
    },
    {
      name: "Charlie Chen",
      email: "charlie@example.com",
      priority: Priority.LOW,
      gender: Gender.MALE,
    },
    {
      name: "Diana Davis",
      email: "diana@example.com",
      priority: Priority.HIGH,
      gender: Gender.FEMALE,
    },
    {
      name: "Edward Evans",
      email: "edward@example.com",
      priority: Priority.MEDIUM,
      gender: Gender.MALE,
    },
  ]);

  test.beforeEach(async () => {
    // Setup: Create 5 contacts for grid layout tests
    await contactsFixture.setup();
  });

  test.afterEach(async () => {
    // Cleanup: Delete all 5 test contacts
    await contactsFixture.teardown();
  });

  test.describe("Mobile Viewport (375px)", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should display contact cards in single column grid", async ({
      page,
    }) => {
      await page.goto("/contacts");

      // Wait for contacts to load
      await page.waitForSelector('[data-testid="contact-card"]', {
        state: "visible",
        timeout: 10000,
      });

      // Check grid layout - should be single column on mobile
      const grid = page.locator('[data-testid="contact-grid"]');
      await expect(grid).toBeVisible();
      await expect(grid).toHaveClass(/grid-cols-1/);

      // Verify cards stack vertically (we have 5 contacts)
      const cards = page.locator('[data-testid="contact-card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(5); // Should show our 5 test contacts

      // Verify first 2 cards stack vertically
      const firstBox = await cards.nth(0).boundingBox();
      const secondBox = await cards.nth(1).boundingBox();
      expect(firstBox).not.toBeNull();
      expect(secondBox).not.toBeNull();
      if (firstBox && secondBox) {
        // Second card should be below first card
        expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
      }
    });

    test("should have proper spacing and padding on mobile", async ({
      page,
    }) => {
      await page.goto("/contacts");
      await page.waitForSelector('[data-testid="contact-card"]', {
        state: "visible",
      });

      // Check page padding
      const container = page.locator(".max-w-7xl").first();
      const containerBox = await container.boundingBox();
      expect(containerBox).not.toBeNull();
      if (containerBox) {
        // Should have px-4 padding on mobile (16px)
        expect(containerBox.x).toBeGreaterThanOrEqual(14); // Allow 2px tolerance
      }
    });

    test("should display Create Contact button with adequate touch target", async ({
      page,
    }) => {
      await page.goto("/contacts");

      const createButton = page.getByRole("link", { name: /create contact/i });
      await expect(createButton).toBeVisible();

      // Check touch target size
      await checkTouchTargetSize(createButton);
    });

    test("should stack filter controls vertically", async ({ page }) => {
      await page.goto("/contacts");

      // Show filters
      const showFiltersButton = page.getByRole("button", {
        name: /show filters/i,
      });
      if (await showFiltersButton.isVisible()) {
        await showFiltersButton.click();

        // Filter controls should stack on mobile
        const filterGrid = page.locator(".grid.grid-cols-1").first();
        await expect(filterGrid).toBeVisible();
      }
    });

    test("should display contact card with proper mobile layout", async ({
      page,
    }) => {
      await page.goto("/contacts");
      await page.waitForSelector('[data-testid="contact-card"]', {
        state: "visible",
      });

      const firstCard = page.locator('[data-testid="contact-card"]').first();

      // Profile section should stack on mobile (flex-col)
      const profileSection = firstCard.locator(".flex.flex-col").first();
      await expect(profileSection).toBeVisible();

      // Footer should stack vertically on mobile
      const footer = firstCard.locator(".flex.flex-col.space-y-1").first();
      await expect(footer).toBeVisible();
    });
  });

  test.describe("Tablet Viewport (768px)", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("should display contact cards in 2-column grid", async ({ page }) => {
      await page.goto("/contacts");
      await page.waitForSelector('[data-testid="contact-card"]', {
        state: "visible",
      });

      // Should use sm:grid-cols-2 at tablet size (we have 5 contacts)
      const cards = page.locator('[data-testid="contact-card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(5); // Should show our 5 test contacts

      // Verify first 2 cards are side by side
      const firstBox = await cards.nth(0).boundingBox();
      const secondBox = await cards.nth(1).boundingBox();

      expect(firstBox).not.toBeNull();
      expect(secondBox).not.toBeNull();

      if (firstBox && secondBox) {
        // Cards should be side by side at same Y position
        expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(10); // Allow small diff
      }
    });

    test("should display horizontal filter layout", async ({ page }) => {
      await page.goto("/contacts");

      const showFiltersButton = page.getByRole("button", {
        name: /show filters/i,
      });
      if (await showFiltersButton.isVisible()) {
        await showFiltersButton.click();

        // Should use grid-cols-3 on tablet
        const filterGrid = page.locator(".sm\\:grid-cols-3").first();
        await expect(filterGrid).toBeVisible();
      }
    });

    test("should display header with horizontal layout", async ({ page }) => {
      await page.goto("/contacts");

      // Header should be flex-row on tablet
      const header = page.locator(".sm\\:flex-row").first();
      await expect(header).toBeVisible();
    });
  });

  test.describe("Desktop Viewport (1440px)", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("should display contact cards in 4-column grid", async ({ page }) => {
      await page.goto("/contacts");
      await page.waitForSelector('[data-testid="contact-card"]', {
        state: "visible",
      });

      // Should use xl:grid-cols-4 at desktop size (we have 5 contacts, so first 4 should be in one row)
      const cards = page.locator('[data-testid="contact-card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(5); // Should show our 5 test contacts

      // Verify first 4 cards are on same row
      const boxes = await Promise.all([
        cards.nth(0).boundingBox(),
        cards.nth(1).boundingBox(),
        cards.nth(2).boundingBox(),
        cards.nth(3).boundingBox(),
      ]);

      // All 4 cards should be on same row (similar Y position)
      const yPositions = boxes.filter((b) => b !== null).map((b) => b!.y);
      const maxYDiff = Math.max(...yPositions) - Math.min(...yPositions);
      expect(maxYDiff).toBeLessThan(20); // Allow small differences
    });

    test("should display full-width page with proper max-width", async ({
      page,
    }) => {
      await page.goto("/contacts");

      const container = page.locator(".max-w-7xl").first();
      const containerBox = await container.boundingBox();

      expect(containerBox).not.toBeNull();
      if (containerBox) {
        // Should be centered with max-width constraint
        expect(containerBox.width).toBeLessThanOrEqual(1280); // max-w-7xl = 80rem = 1280px
      }
    });
  });
});

test.describe("Contact Form - Responsive Design", () => {
  test.describe("Mobile Viewport (375px)", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should stack form buttons vertically on mobile", async ({ page }) => {
      await page.goto("/contacts/new");
      // Wait removed - networkidle unreliable with GraphQL

      // Submit button should be full width on mobile
      const submitButton = page.getByRole("button", {
        name: /create contact/i,
      });
      await expect(submitButton).toBeVisible();

      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox).not.toBeNull();

      if (buttonBox) {
        // Should be close to full container width (accounting for padding)
        const container = page.locator("form").first();
        const containerBox = await container.boundingBox();

        if (containerBox) {
          expect(buttonBox.width).toBeGreaterThan(containerBox.width * 0.8);
        }
      }
    });

    test("should have adequate touch targets for all form buttons", async ({
      page,
    }) => {
      await page.goto("/contacts/new");
      // Wait removed - networkidle unreliable with GraphQL

      const submitButton = page.getByRole("button", {
        name: /create contact/i,
      });
      await checkTouchTargetSize(submitButton);
    });

    test("should display form fields full width", async ({ page }) => {
      await page.goto("/contacts/new");

      const nameInput = page.getByLabel(/name/i);
      const inputBox = await nameInput.boundingBox();
      const form = page.locator("form").first();
      const formBox = await form.boundingBox();

      expect(inputBox).not.toBeNull();
      expect(formBox).not.toBeNull();

      if (inputBox && formBox) {
        // Input should span nearly full width of form (accounting for padding)
        expect(inputBox.width).toBeGreaterThan(formBox.width * 0.85);
      }
    });
  });

  test.describe("Tablet & Desktop Viewport", () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test("should display buttons horizontally", async ({ page }) => {
      await page.goto("/contacts/new");
      // Wait removed - networkidle unreliable with GraphQL

      // Buttons should be in horizontal row on larger screens
      const buttonContainer = page.locator(".sm\\:flex-row").last();
      await expect(buttonContainer).toBeVisible();
    });

    test("should have proper button widths (auto, not full)", async ({
      page,
    }) => {
      await page.goto("/contacts/new");

      const submitButton = page.getByRole("button", {
        name: /create contact/i,
      });
      const buttonBox = await submitButton.boundingBox();
      const form = page.locator("form").first();
      const formBox = await form.boundingBox();

      expect(buttonBox).not.toBeNull();
      expect(formBox).not.toBeNull();

      if (buttonBox && formBox) {
        // Button should NOT be full width on desktop
        expect(buttonBox.width).toBeLessThan(formBox.width * 0.5);
      }
    });
  });
});

test.describe("Contact Detail Page - Responsive Design", () => {
  // Create a single contact for detail page testing
  const contactFixture = createMultipleContactsFixture([
    {
      name: "Test User",
      email: "test@example.com",
      phone: "+1-555-100-0001",
      company: "Test Company",
      industry: "Technology",
      role: "Engineer",
      priority: Priority.HIGH,
      gender: Gender.MALE,
      notes: "Responsive design test contact",
    },
  ]);

  test.beforeEach(async () => {
    // Setup: Create 1 contact for detail page tests
    await contactFixture.setup();
  });

  test.afterEach(async () => {
    // Cleanup: Delete test contact
    await contactFixture.teardown();
  });

  test.describe("Mobile Viewport (375px)", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should stack header vertically on mobile", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactIds[0]}`);
      // Wait removed - networkidle unreliable with GraphQL

      // Header should stack on mobile
      const header = page.locator(".flex.flex-col").first();
      await expect(header).toBeVisible();
    });

    test("should have adequate touch targets for Edit and Delete buttons", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactIds[0]}`);
      // Wait removed - networkidle unreliable with GraphQL

      const editButton = page.getByRole("link", { name: /edit/i });
      const deleteButton = page.getByRole("button", { name: /delete/i });

      await expect(editButton).toBeVisible();
      await expect(deleteButton).toBeVisible();

      await checkTouchTargetSize(editButton);
      await checkTouchTargetSize(deleteButton);
    });

    test("should display buttons with equal width on mobile", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactIds[0]}`);
      // Wait removed - networkidle unreliable with GraphQL

      const editButton = page.getByRole("link", { name: /edit/i });
      const deleteButton = page.getByRole("button", { name: /delete/i });

      await expect(editButton).toBeVisible();
      await expect(deleteButton).toBeVisible();

      const editBox = await editButton.boundingBox();
      const deleteBox = await deleteButton.boundingBox();

      expect(editBox).not.toBeNull();
      expect(deleteBox).not.toBeNull();

      if (editBox && deleteBox) {
        // Buttons should have similar widths (flex-1)
        expect(Math.abs(editBox.width - deleteBox.width)).toBeLessThan(10);
      }
    });
  });

  test.describe("Desktop Viewport (1440px)", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("should display header horizontally", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactIds[0]}`);
      // Wait removed - networkidle unreliable with GraphQL

      // Header should be horizontal row on desktop
      const header = page.locator(".sm\\:flex-row").first();
      await expect(header).toBeVisible();
    });
  });
});

test.describe("Touch Interactions", () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  // Create 2 contacts for touch interaction testing
  const touchContactsFixture = createMultipleContactsFixture([
    {
      name: "Touch Test 1",
      email: "touch1@example.com",
      priority: Priority.HIGH,
      gender: Gender.FEMALE,
    },
    {
      name: "Touch Test 2",
      email: "touch2@example.com",
      priority: Priority.MEDIUM,
      gender: Gender.MALE,
    },
  ]);

  test.beforeEach(async () => {
    // Setup: Create 2 contacts for touch tests
    await touchContactsFixture.setup();
  });

  test.afterEach(async () => {
    // Cleanup: Delete test contacts
    await touchContactsFixture.teardown();
  });

  test("should handle tap on contact card", async ({ page }) => {
    await page.goto("/contacts");
    await page.waitForSelector('[data-testid="contact-card"]', {
      state: "visible",
    });

    const firstCard = page.locator('[data-testid="contact-card"]').first();

    // Simulate touch tap
    await firstCard.tap();

    // Should navigate to detail page (one of our 2 test contacts)
    await page.waitForURL(/\/contacts\/test-contact-[a-f0-9-]+$/);
    expect(page.url()).toMatch(/\/contacts\/test-contact-[a-f0-9-]+$/);
  });

  test("should handle tap on buttons", async ({ page }) => {
    await page.goto("/contacts");

    const createButton = page.getByRole("link", { name: /create contact/i });
    await createButton.tap();

    // Should navigate to create page
    await expect(page).toHaveURL("/contacts/new");
  });
});
