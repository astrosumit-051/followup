/**
 * Contact Detail Page E2E Tests - WITH TEST ISOLATION
 *
 * Tests the comprehensive contact detail view functionality including:
 * - Page load and contact information display
 * - Loading state rendering
 * - Error state handling
 * - Not found state display
 * - Edit button navigation
 * - Delete button and confirmation dialog
 * - Delete functionality with toast notifications
 * - Redirect after deletion
 * - Back to contacts navigation
 * - Responsive design on different viewports
 *
 * MIGRATION STATUS: ✅ Fully migrated to use test isolation (no shared test data)
 *
 * @group e2e
 * @group contacts
 */

import { test, expect } from "@playwright/test";
import { createTestFixture, Priority, Gender } from "../helpers/test-isolation";

test.describe("Contact Detail Page", () => {
  // Helper function to wait for contact data to load
  async function waitForContactLoaded(page: any, contactName: string) {
    // Wait for the contact name heading to appear (indicates data loaded)
    // Don't use networkidle as it's unreliable with GraphQL subscriptions and parallel tests
    await page.waitForSelector(`h1:has-text("${contactName}")`, {
      timeout: 30000, // Increased timeout for parallel test execution
    });
    // Wait a bit for any remaining UI updates
    await page.waitForTimeout(500);
  }

  test.describe("Page Load and Navigation", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 (555) 123-4567",
        linkedInUrl: "https://linkedin.com/in/janesmith",
        company: "Tech Corp",
        industry: "Technology",
        role: "Senior Software Engineer",
        priority: Priority.HIGH,
        gender: Gender.FEMALE,
        birthday: new Date("1990-05-15"),
        notes:
          "Met at tech conference in 2024.\nInterested in AI and machine learning.",
        profilePicture: "https://example.com/profile.jpg",
        lastContactedAt: new Date("2025-01-01T10:00:00Z"),
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should load contact detail page with correct URL", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");
      await expect(page).toHaveURL(`/contacts/${contactFixture.contactId}`);
    });

    test("should display page title in browser tab", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");
      // Wait for dynamic title update after data loads
      await expect(page).toHaveTitle(/Contact Details/i);
    });

    test("should navigate from contacts list to detail page", async ({
      page,
    }) => {
      await page.goto("/contacts");
      // Click on a contact card (assuming contact cards have data-testid)
      await page.click(`[data-testid="contact-card-${contactFixture.contactId}"]`);
      await expect(page).toHaveURL(`/contacts/${contactFixture.contactId}`);
    });
  });

  test.describe("Loading State", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should display loading skeleton on initial load", async ({
      page,
    }) => {
      // Slow down network to see loading state
      await page.route("**/graphql", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      });

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      // Check for skeleton elements
      await expect(page.locator(".animate-pulse")).toBeVisible();
      await expect(page.locator(".bg-gray-200").first()).toBeVisible();
    });

    test("should hide loading state after data loads", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      // Wait for loading to complete
      await page.waitForSelector(".animate-pulse", { state: "detached" });

      // Verify skeleton is no longer visible
      await expect(page.locator(".animate-pulse")).not.toBeVisible();
    });
  });

  test.describe("Contact Information Display", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 (555) 123-4567",
        linkedInUrl: "https://linkedin.com/in/janesmith",
        company: "Tech Corp",
        industry: "Technology",
        role: "Senior Software Engineer",
        priority: Priority.HIGH,
        gender: Gender.FEMALE,
        birthday: new Date("1990-05-15"),
        notes:
          "Met at tech conference in 2024.\nInterested in AI and machine learning.",
        profilePicture: "https://example.com/profile.jpg",
        lastContactedAt: new Date("2025-01-01T10:00:00Z"),
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should display contact name in header", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const nameHeading = page.locator("h1", { hasText: "Jane Smith" });
      await expect(nameHeading).toBeVisible();
      await expect(nameHeading).toHaveClass(/text-3xl font-bold/);
    });

    test('should display "Contact Details" subtitle', async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const subtitle = page.locator("text=Contact Details");
      await expect(subtitle).toBeVisible();
      await expect(subtitle).toHaveClass(/text-sm text-gray-500/);
    });

    test("should display priority badge with correct styling", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const priorityBadge = page.locator("text=/High Priority/i");
      await expect(priorityBadge).toBeVisible();
      await expect(priorityBadge).toHaveClass(/bg-red-100 text-red-800/);
    });

    test("should display email as clickable mailto link", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const emailLink = page.locator(`a[href="mailto:jane.smith@example.com"]`);
      await expect(emailLink).toBeVisible();
      await expect(emailLink).toHaveText("jane.smith@example.com");
      await expect(emailLink).toHaveClass(/text-blue-600 hover:text-blue-800/);
    });

    test("should display phone as clickable tel link", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const phoneLink = page.locator(`a[href="tel:+1 (555) 123-4567"]`);
      await expect(phoneLink).toBeVisible();
      await expect(phoneLink).toHaveText("+1 (555) 123-4567");
    });

    test("should display LinkedIn URL as external link", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const linkedInLink = page.locator(
        `a[href="https://linkedin.com/in/janesmith"]`
      );
      await expect(linkedInLink).toBeVisible();
      await expect(linkedInLink).toHaveAttribute("target", "_blank");
      await expect(linkedInLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("should display company name", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const companyLabel = page.locator('dt:has-text("Company")');
      await expect(companyLabel).toBeVisible();

      const companyValue = companyLabel.locator("+ dd");
      await expect(companyValue).toHaveText("Tech Corp");
    });

    test("should display industry", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const industryLabel = page.locator('dt:has-text("Industry")');
      await expect(industryLabel).toBeVisible();

      const industryValue = industryLabel.locator("+ dd");
      await expect(industryValue).toHaveText("Technology");
    });

    test("should display role", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const roleLabel = page.locator('dt:has-text("Role")');
      await expect(roleLabel).toBeVisible();

      const roleValue = roleLabel.locator("+ dd");
      await expect(roleValue).toHaveText("Senior Software Engineer");
    });

    test("should display formatted gender", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const genderLabel = page.locator('dt:has-text("Gender")');
      await expect(genderLabel).toBeVisible();

      const genderValue = genderLabel.locator("+ dd");
      await expect(genderValue).toHaveText("Female"); // Formatted from FEMALE
    });

    test("should display formatted birthday", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const birthdayLabel = page.locator('dt:has-text("Birthday")');
      await expect(birthdayLabel).toBeVisible();

      const birthdayValue = birthdayLabel.locator("+ dd");
      await expect(birthdayValue).toHaveText(/May 14, 1990/); // Formatted date
    });

    test("should display notes with preserved whitespace", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const notesLabel = page.locator('dt:has-text("Notes")');
      await expect(notesLabel).toBeVisible();

      const notesValue = notesLabel.locator("+ dd");
      await expect(notesValue).toHaveClass(/whitespace-pre-wrap/);
      await expect(notesValue).toContainText("Met at tech conference");
      await expect(notesValue).toContainText("Interested in AI");
    });

    test("should display profile picture if available", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const profilePicture = page.locator(`img[alt="Jane Smith's profile"]`);
      await expect(profilePicture).toBeVisible();
      await expect(profilePicture).toHaveAttribute(
        "src",
        "https://example.com/profile.jpg"
      );
      await expect(profilePicture).toHaveClass(/w-32 h-32 rounded-full/);
    });

    test("should display formatted last contacted date", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const lastContactedLabel = page.locator('dt:has-text("Last Contacted")');
      await expect(lastContactedLabel).toBeVisible();

      const lastContactedValue = lastContactedLabel.locator("+ dd");
      await expect(lastContactedValue).toHaveText(/Jan 1, 2025/); // Formatted datetime
    });

    test("should display formatted created date", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const createdLabel = page.locator('dt:has-text("Added")');
      await expect(createdLabel).toBeVisible();

      const createdValue = createdLabel.locator("+ dd");
      // Verify date is displayed (will be current time due to Prisma @default(now()))
      await expect(createdValue).toHaveText(/\w+ \d+, \d{4}/); // Pattern: "Oct 7, 2025, 8:46 PM"
    });

    test("should display formatted updated date", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const updatedLabel = page.locator('dt:has-text("Last Updated")');
      await expect(updatedLabel).toBeVisible();

      const updatedValue = updatedLabel.locator("+ dd");
      // Verify date is displayed (will be current time due to Prisma @updatedAt)
      await expect(updatedValue).toHaveText(/\w+ \d+, \d{4}/); // Pattern: "Oct 7, 2025, 8:46 PM"
    });

    test("should use responsive grid layout for contact fields", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const contactGrid = page.locator("dl.grid");
      await expect(contactGrid).toBeVisible();
      await expect(contactGrid).toHaveClass(/sm:grid-cols-2/);
    });
  });

  test.describe("Edit Button", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should display Edit button in header", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const editButton = page.locator('button:has-text("Edit")');
      await expect(editButton).toBeVisible();
      await expect(editButton).toHaveClass(/border-gray-300/);
    });

    test("should navigate to edit page when Edit button clicked", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const editButton = page.locator('button:has-text("Edit")');
      await editButton.click();

      await expect(page).toHaveURL(`/contacts/${contactFixture.contactId}/edit`);
    });

    test("should have proper hover styling on Edit button", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const editButton = page.locator('button:has-text("Edit")');
      await expect(editButton).toHaveClass(/hover:bg-gray-50/);
    });
  });

  test.describe("Delete Button and Dialog", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should display Delete button in header", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const deleteButton = page.locator('button:has-text("Delete")');
      await expect(deleteButton).toBeVisible();
      await expect(deleteButton).toHaveClass(/bg-red-600/);
    });

    test("should open confirmation dialog when Delete button clicked", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      // Check for dialog visibility
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    });

    test("should display contact name in delete confirmation dialog", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toContainText("Jane Smith");
    });

    test("should close dialog when Cancel button clicked", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();

      await expect(dialog).not.toBeVisible();
    });

    test("should remain on detail page after canceling delete", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();

      await expect(page).toHaveURL(`/contacts/${contactFixture.contactId}`);
    });
  });

  test.describe("Delete Functionality", () => {
    // Each test needs its own contact since deletion is destructive

    test("should show loading state on Confirm button during deletion", async ({
      page,
    }) => {
      const contactFixture = createTestFixture({
        name: "Delete Test 1",
        email: "delete1@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Delete Test 1");

      // Slow down the delete mutation
      await page.route("**/graphql", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      });

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const confirmButton = page.locator('button:has-text("Confirm")');
      await confirmButton.click();

      // Check for disabled state or loading indicator
      await expect(confirmButton).toBeDisabled();
    });

    test("should display success toast after successful deletion", async ({
      page,
    }) => {
      const contactFixture = createTestFixture({
        name: "Delete Test 2",
        email: "delete2@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Delete Test 2");

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const confirmButton = page.locator('button:has-text("Confirm")');
      await confirmButton.click();

      // Wait for success toast
      const successToast = page.locator("text=Contact deleted successfully!");
      await expect(successToast).toBeVisible();
    });

    test("should include contact name in success toast description", async ({
      page,
    }) => {
      const contactFixture = createTestFixture({
        name: "Delete Test 3",
        email: "delete3@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Delete Test 3");

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const confirmButton = page.locator('button:has-text("Confirm")');
      await confirmButton.click();

      // Wait for toast description
      const toastDescription = page.locator(
        `text=Delete Test 3 has been removed from your contacts.`
      );
      await expect(toastDescription).toBeVisible();
    });

    test("should redirect to contacts list after successful deletion", async ({
      page,
    }) => {
      const contactFixture = createTestFixture({
        name: "Delete Test 4",
        email: "delete4@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Delete Test 4");

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const confirmButton = page.locator('button:has-text("Confirm")');
      await confirmButton.click();

      // Wait for redirect
      await expect(page).toHaveURL("/contacts");
    });

    test("should display error toast on deletion failure", async ({ page }) => {
      const contactFixture = createTestFixture({
        name: "Delete Test 5",
        email: "delete5@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Delete Test 5");

      // Mock API error
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({
            errors: [{ message: "Internal server error" }],
          }),
        })
      );

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const confirmButton = page.locator('button:has-text("Confirm")');
      await confirmButton.click();

      // Wait for error toast
      const errorToast = page.locator("text=Failed to delete contact");
      await expect(errorToast).toBeVisible();

      await contactFixture.teardown();
    });

    test("should close dialog on deletion error", async ({ page }) => {
      const contactFixture = createTestFixture({
        name: "Delete Test 6",
        email: "delete6@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Delete Test 6");

      // Mock API error
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({
            errors: [{ message: "Internal server error" }],
          }),
        })
      );

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const confirmButton = page.locator('button:has-text("Confirm")');
      await confirmButton.click();

      // Wait for dialog to close
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).not.toBeVisible();

      await contactFixture.teardown();
    });

    test("should remain on detail page after deletion error", async ({
      page,
    }) => {
      const contactFixture = createTestFixture({
        name: "Delete Test 7",
        email: "delete7@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Delete Test 7");
      // Note: This test loads contact successfully first, then mocks error on deletion

      // Mock API error
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({
            errors: [{ message: "Internal server error" }],
          }),
        })
      );

      const deleteButton = page.locator('button:has-text("Delete")');
      await deleteButton.click();

      const confirmButton = page.locator('button:has-text("Confirm")');
      await confirmButton.click();

      // Should still be on detail page
      await expect(page).toHaveURL(`/contacts/${contactFixture.contactId}`);

      await contactFixture.teardown();
    });
  });

  test.describe("Error State", () => {
    // Error tests don't need real contacts - they mock API failures
    test("should display error message when API fails", async ({ page }) => {
      // Mock API error
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({
            errors: [{ message: "Failed to fetch contact" }],
          }),
        })
      );

      await page.goto("/contacts/any-id-will-error");
      // Don't wait for contact - API error mocked, error state expected

      const errorHeading = page.locator('h2:has-text("Error Loading Contact")');
      await expect(errorHeading).toBeVisible();
    });

    test("should display specific error message from API", async ({ page }) => {
      const errorMessage = "Database connection failed";

      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ errors: [{ message: errorMessage }] }),
        })
      );

      await page.goto("/contacts/any-id-will-error");
      // Don't wait for contact - API error mocked, error state expected

      const errorText = page.locator(`text=${errorMessage}`);
      await expect(errorText).toBeVisible();
    });

    test("should display Back to Contacts button on error", async ({
      page,
    }) => {
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ errors: [{ message: "Error" }] }),
        })
      );

      await page.goto("/contacts/any-id-will-error");
      // Don't wait for contact - API error mocked, error state expected

      const backButton = page.locator('button:has-text("Back to Contacts")');
      await expect(backButton).toBeVisible();
    });

    test("should navigate to contacts list when Back button clicked on error", async ({
      page,
    }) => {
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ errors: [{ message: "Error" }] }),
        })
      );

      await page.goto("/contacts/any-id-will-error");
      // Don't wait for contact - API error mocked, error state expected

      const backButton = page.locator('button:has-text("Back to Contacts")');
      await backButton.click();

      await expect(page).toHaveURL("/contacts");
    });
  });

  test.describe("Not Found State", () => {
    // Not found tests don't need real contacts - they mock null responses
    test("should display not found message for non-existent contact", async ({
      page,
    }) => {
      // Mock empty response
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { contact: null } }),
        })
      );

      await page.goto("/contacts/non-existent-id");

      const notFoundHeading = page.locator('h2:has-text("Contact Not Found")');
      await expect(notFoundHeading).toBeVisible();
    });

    test("should display helpful message for missing contact", async ({
      page,
    }) => {
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { contact: null } }),
        })
      );

      await page.goto("/contacts/non-existent-id");

      const message = page.locator(
        "text=The contact you're looking for doesn't exist or has been deleted."
      );
      await expect(message).toBeVisible();
    });

    test("should display Back to Contacts button on not found", async ({
      page,
    }) => {
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { contact: null } }),
        })
      );

      await page.goto("/contacts/non-existent-id");

      const backButton = page.locator('button:has-text("Back to Contacts")');
      await expect(backButton).toBeVisible();
    });

    test("should navigate to contacts list when Back button clicked on not found", async ({
      page,
    }) => {
      await page.route("**/graphql", (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { contact: null } }),
        })
      );

      await page.goto("/contacts/non-existent-id");

      const backButton = page.locator('button:has-text("Back to Contacts")');
      await backButton.click();

      await expect(page).toHaveURL("/contacts");
    });
  });

  test.describe("Back Navigation", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should display Back to Contacts link at bottom", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const backLink = page.locator('button:has-text("← Back to Contacts")');
      await expect(backLink).toBeVisible();
      await expect(backLink).toHaveClass(/text-sm text-gray-600/);
    });

    test("should navigate to contacts list when back link clicked", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const backLink = page.locator('button:has-text("← Back to Contacts")');
      await backLink.click();

      await expect(page).toHaveURL("/contacts");
    });

    test("should have hover styling on back link", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const backLink = page.locator('button:has-text("← Back to Contacts")');
      await expect(backLink).toHaveClass(/hover:text-gray-900 hover:underline/);
    });
  });

  test.describe("Responsive Design", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should display properly on mobile viewport (375px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      // Check header stacks vertically
      const header = page.locator(".flex.justify-between.items-start");
      await expect(header).toBeVisible();

      // Check contact name is visible
      const nameHeading = page.locator("h1", { hasText: "Jane Smith" });
      await expect(nameHeading).toBeVisible();
    });

    test("should display properly on tablet viewport (768px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const contactGrid = page.locator("dl.grid");
      await expect(contactGrid).toBeVisible();
      await expect(contactGrid).toHaveClass(/sm:grid-cols-2/);
    });

    test("should display properly on desktop viewport (1440px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const container = page.locator(".max-w-4xl");
      await expect(container).toBeVisible();
    });

    test("should maintain button layout on smaller screens", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const editButton = page.locator('button:has-text("Edit")');
      const deleteButton = page.locator('button:has-text("Delete")');

      await expect(editButton).toBeVisible();
      await expect(deleteButton).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should have proper heading hierarchy", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText("Jane Smith");
    });

    test("should have accessible labels for definition lists", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const emailLabel = page.locator('dt:has-text("Email")');
      await expect(emailLabel).toBeVisible();

      const phoneLabel = page.locator('dt:has-text("Phone")');
      await expect(phoneLabel).toBeVisible();
    });

    test("should have proper alt text for profile picture", async ({
      page,
    }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const profilePicture = page.locator("img");
      await expect(profilePicture).toHaveAttribute("alt", `Jane Smith's profile`);
    });

    test("should have keyboard accessible buttons", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const editButton = page.locator('button:has-text("Edit")');
      await editButton.focus();
      await expect(editButton).toBeFocused();

      await page.keyboard.press("Tab");
      const deleteButton = page.locator('button:has-text("Delete")');
      await expect(deleteButton).toBeFocused();
    });

    test("should have focus ring on interactive elements", async ({ page }) => {
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      const editButton = page.locator('button:has-text("Edit")');
      await expect(editButton).toHaveClass(/focus:ring-2/);

      const deleteButton = page.locator('button:has-text("Delete")');
      await expect(deleteButton).toHaveClass(/focus:ring-2/);
    });
  });

  test.describe("Performance", () => {
    let contactFixture: ReturnType<typeof createTestFixture>;

    test.beforeEach(async () => {
      contactFixture = createTestFixture({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        priority: Priority.HIGH,
      });
      await contactFixture.setup();
    });

    test.afterEach(async () => {
      await contactFixture.teardown();
    });

    test("should load page within 3 seconds", async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test("should not have console errors on load", async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      expect(consoleErrors).toHaveLength(0);
    });

    test("should not have network errors", async ({ page }) => {
      const networkErrors: string[] = [];
      page.on("requestfailed", (request) => {
        networkErrors.push(request.url());
      });

      await page.goto(`/contacts/${contactFixture.contactId}`);
      await waitForContactLoaded(page, "Jane Smith");

      expect(networkErrors).toHaveLength(0);
    });
  });
});
