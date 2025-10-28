/**
 * Contact Detail Page - Dynamic CTA E2E Tests
 *
 * Tests the conversation history-based dynamic CTA feature:
 * - "Follow Up" button (blue) when conversation count > 0
 * - "Cold Email" button (orange) when conversation count === 0
 * - Navigation to compose page with correct query params
 *
 * TASK: 18.1 - Write tests for Contact Detail page CTA logic
 *
 * @group e2e
 * @group contacts
 * @group email-composition
 */

import { test, expect } from "@playwright/test";
import {
  createTestFixture,
  createConversationHistory,
  Priority,
  Direction,
} from "../helpers/test-isolation";

test.describe("Contact Detail Page - Dynamic CTA", () => {
  // Helper function to wait for contact data to load
  async function waitForContactLoaded(page: any, contactName: string) {
    await page.waitForSelector(`h1:has-text("${contactName}")`, {
      timeout: 30000,
    });
    await page.waitForTimeout(500);
  }

  test.describe("Cold Email CTA (No Conversation History)", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "New Contact",
        email: "new.contact@example.com",
        company: "Startup Inc",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should display 'Cold Email' button when conversation count is 0", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "New Contact");

      // Check for Cold Email button
      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );
      await expect(coldEmailButton).toBeVisible();

      // Verify button styling (orange/amber background)
      const buttonClass = await coldEmailButton.getAttribute("class");
      expect(buttonClass).toContain("bg-orange-500");
    });

    test("should NOT display 'Follow Up' button when conversation count is 0", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "New Contact");

      // Verify Follow Up button is NOT visible
      const followUpButton = page.locator(
        'button:has-text("Follow Up"), [data-testid="follow-up-button"]'
      );
      await expect(followUpButton).not.toBeVisible();
    });

    test("should navigate to compose page with type=cold query param", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "New Contact");

      // Click Cold Email button
      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );
      await coldEmailButton.click();

      // Verify navigation to compose page with correct query params
      await page.waitForURL(
        `/compose?contactId=${contactFixture.contactId}&type=cold`
      );
      await expect(page).toHaveURL(
        `/compose?contactId=${contactFixture.contactId}&type=cold`
      );
    });

    test("should preserve contactId in URL query param", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "New Contact");

      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );
      await coldEmailButton.click();

      await page.waitForURL(/\/compose\?contactId=.+&type=cold/);

      // Extract contactId from URL
      const url = new URL(page.url());
      const contactIdParam = url.searchParams.get("contactId");
      expect(contactIdParam).toBe(contactFixture.contactId);
    });
  });

  test.describe("Follow Up CTA (With Conversation History)", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Existing Contact",
        email: "existing.contact@example.com",
        company: "BigCorp Ltd",
        priority: Priority.MEDIUM,
      });
      await contactFixture.setup();

      // Create conversation history entry to trigger Follow Up CTA
      await createConversationHistory(
        contactFixture.contactId,
        "Thanks for connecting! Looking forward to working together on the project.",
        Direction.SENT
      );
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should display 'Follow Up' button when conversation count > 0", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Existing Contact");

      // Check for Follow Up button
      const followUpButton = page.locator(
        'button:has-text("Follow Up"), [data-testid="follow-up-button"]'
      );
      await expect(followUpButton).toBeVisible();

      // Verify button styling (blue background)
      const buttonClass = await followUpButton.getAttribute("class");
      expect(buttonClass).toContain("bg-blue-600");
    });

    test("should NOT display 'Cold Email' button when conversation count > 0", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Existing Contact");

      // Verify Cold Email button is NOT visible
      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );
      await expect(coldEmailButton).not.toBeVisible();
    });

    test("should navigate to compose page with type=followup query param", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Existing Contact");

      // Click Follow Up button
      const followUpButton = page.locator(
        'button:has-text("Follow Up"), [data-testid="follow-up-button"]'
      );
      await followUpButton.click();

      // Verify navigation to compose page with correct query params
      await page.waitForURL(
        `/compose?contactId=${contactFixture.contactId}&type=followup`
      );
      await expect(page).toHaveURL(
        `/compose?contactId=${contactFixture.contactId}&type=followup`
      );
    });

    test("should preserve contactId in URL query param for follow-up", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Existing Contact");

      const followUpButton = page.locator(
        'button:has-text("Follow Up"), [data-testid="follow-up-button"]'
      );
      await followUpButton.click();

      await page.waitForURL(/\/compose\?contactId=.+&type=followup/);

      // Extract contactId from URL
      const url = new URL(page.url());
      const contactIdParam = url.searchParams.get("contactId");
      expect(contactIdParam).toBe(contactFixture.contactId);
    });
  });

  test.describe("CTA Button Accessibility", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Accessibility Test Contact",
        email: "a11y@example.com",
        priority: Priority.LOW,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("Cold Email button should have proper ARIA label", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Accessibility Test Contact");

      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );

      // Check for aria-label or accessible name
      const ariaLabel = await coldEmailButton.getAttribute("aria-label");
      const accessibleName = await coldEmailButton.textContent();

      expect(
        ariaLabel || accessibleName
      ).toMatch(/cold email|compose.*cold/i);
    });

    test("Cold Email button should be keyboard accessible", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Accessibility Test Contact");

      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );

      // Focus the Cold Email button explicitly
      await coldEmailButton.focus();

      // Verify button can be activated with Enter
      await page.keyboard.press("Enter");

      await page.waitForURL(/\/compose\?contactId=.+&type=cold/);
      await expect(page).toHaveURL(
        new RegExp(`/compose\\?contactId=${contactFixture.contactId}&type=cold`)
      );
    });
  });

  test.describe("CTA Button Responsive Design", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Responsive Test Contact",
        email: "responsive@example.com",
        priority: Priority.MEDIUM,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("Cold Email button should be visible on mobile (375px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Responsive Test Contact");

      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );
      await expect(coldEmailButton).toBeVisible();
    });

    test("Cold Email button should be visible on tablet (768px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Responsive Test Contact");

      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );
      await expect(coldEmailButton).toBeVisible();
    });

    test("Cold Email button should be visible on desktop (1440px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Responsive Test Contact");

      const coldEmailButton = page.locator(
        'button:has-text("Cold Email"), [data-testid="cold-email-button"]'
      );
      await expect(coldEmailButton).toBeVisible();
    });
  });
});
