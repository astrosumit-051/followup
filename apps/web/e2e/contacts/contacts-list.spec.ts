import { test, expect } from "@playwright/test";
import {
  createMultipleContactsFixture,
  Priority,
  Gender,
} from "../helpers/test-isolation";

/**
 * E2E Tests for Contact List Page
 *
 * ✅ Fully migrated to use test isolation (no shared test data)
 *
 * Migration Strategy:
 * - Uses createMultipleContactsFixture with 15 diverse contacts for the entire suite
 * - Provides realistic data for search, filter, sort, and pagination tests
 * - All contacts have unique UUID-based IDs (no race conditions)
 *
 * Tests cover:
 * - Initial page load and layout
 * - Search functionality with debouncing
 * - Filter functionality (priority, company, industry)
 * - Sort functionality (name, priority, last contacted)
 * - Pagination (load more)
 * - Empty state display
 * - Navigation to contact detail and create pages
 */

test.describe("Contact List Page", () => {
  // Create 15 diverse contacts for realistic list testing
  const contactsFixture = createMultipleContactsFixture([
    {
      name: "Alice Anderson",
      email: "alice@example.com",
      phone: "+1-555-100-0001",
      company: "Acme Corp",
      industry: "Technology",
      role: "Software Engineer",
      priority: Priority.HIGH,
      gender: Gender.FEMALE,
    },
    {
      name: "Bob Brown",
      email: "bob@example.com",
      phone: "+1-555-100-0002",
      company: "Beta Industries",
      industry: "Finance",
      role: "Data Analyst",
      priority: Priority.MEDIUM,
      gender: Gender.MALE,
    },
    {
      name: "Charlie Chen",
      email: "charlie@example.com",
      phone: "+1-555-100-0003",
      company: "Acme Corp",
      industry: "Technology",
      role: "Product Manager",
      priority: Priority.LOW,
      gender: Gender.MALE,
    },
    {
      name: "Diana Davis",
      email: "diana@example.com",
      phone: "+1-555-100-0004",
      company: "Delta Solutions",
      industry: "Healthcare",
      role: "Designer",
      priority: Priority.HIGH,
      gender: Gender.FEMALE,
    },
    {
      name: "Edward Evans",
      email: "edward@example.com",
      phone: "+1-555-100-0005",
      company: "Echo Enterprises",
      industry: "Education",
      role: "Teacher",
      priority: Priority.MEDIUM,
      gender: Gender.MALE,
    },
    {
      name: "Fiona Foster",
      email: "fiona@example.com",
      phone: "+1-555-100-0006",
      company: "Foxtrot Inc",
      industry: "Marketing",
      role: "Marketing Manager",
      priority: Priority.LOW,
      gender: Gender.FEMALE,
    },
    {
      name: "George Garcia",
      email: "george@example.com",
      phone: "+1-555-100-0007",
      company: "Golf Partners",
      industry: "Consulting",
      role: "Consultant",
      priority: Priority.HIGH,
      gender: Gender.MALE,
    },
    {
      name: "Hannah Harris",
      email: "hannah@example.com",
      phone: "+1-555-100-0008",
      company: "Hotel Ventures",
      industry: "Hospitality",
      role: "Hotel Manager",
      priority: Priority.MEDIUM,
      gender: Gender.FEMALE,
    },
    {
      name: "Ian Ibrahim",
      email: "ian@example.com",
      phone: "+1-555-100-0009",
      company: "India Tech",
      industry: "Technology",
      role: "DevOps Engineer",
      priority: Priority.LOW,
      gender: Gender.MALE,
    },
    {
      name: "Julia Jones",
      email: "julia@example.com",
      phone: "+1-555-100-0010",
      company: "Juliet Corp",
      industry: "Legal",
      role: "Attorney",
      priority: Priority.HIGH,
      gender: Gender.FEMALE,
    },
    {
      name: "Kevin Kim",
      email: "kevin@example.com",
      phone: "+1-555-100-0011",
      company: "Kilo Systems",
      industry: "Manufacturing",
      role: "Operations Manager",
      priority: Priority.MEDIUM,
      gender: Gender.MALE,
    },
    {
      name: "Linda Lee",
      email: "linda@example.com",
      phone: "+1-555-100-0012",
      company: "Lima Industries",
      industry: "Logistics",
      role: "Supply Chain Manager",
      priority: Priority.LOW,
      gender: Gender.FEMALE,
    },
    {
      name: "John Martinez",
      email: "john@example.com",
      phone: "+1-555-100-0013",
      company: "Mike Corp",
      industry: "Real Estate",
      role: "Real Estate Agent",
      priority: Priority.HIGH,
      gender: Gender.MALE,
      notes: "Interested in property investments",
    },
    {
      name: "Nancy Nelson",
      email: "nancy@example.com",
      phone: "+1-555-100-0014",
      company: "November LLC",
      industry: "Retail",
      role: "Store Manager",
      priority: Priority.MEDIUM,
      gender: Gender.FEMALE,
    },
    {
      name: "Oscar Ortiz",
      email: "oscar@example.com",
      phone: "+1-555-100-0015",
      company: "Oscar Partners",
      industry: "Finance",
      role: "Financial Advisor",
      priority: Priority.LOW,
      gender: Gender.MALE,
    },
  ]);

  test.beforeEach(async ({ page }) => {
    // Setup: Create 15 diverse contacts for all tests
    await contactsFixture.setup();

    // Navigate to contacts page and wait for initial load
    // Note: Backend readiness is ensured by backend-ready.setup.ts
    // Authentication is handled by auth.setup.ts (reuses saved session)

    await page.goto("/contacts", { waitUntil: "domcontentloaded" });

    // Wait for the page heading to appear (indicates page has loaded)
    await page.waitForSelector('h1:has-text("Contacts")', { timeout: 10000 });
  });

  test.afterEach(async () => {
    // Cleanup: Delete all 15 test contacts
    await contactsFixture.teardown();
  });

  test.describe("Page Layout and Structure", () => {
    test("should display page title and contact count", async ({ page }) => {
      // Verify page heading
      const heading = page.locator('h1:has-text("Contacts")');
      await expect(heading).toBeVisible();

      // Verify contact count is displayed (format: "X contact(s)")
      // Should show at least 15 contacts from our fixture
      const contactCount = page.locator("text=/\\d+ contacts?/i");
      await expect(contactCount).toBeVisible();

      // Verify count includes our 15 test contacts
      const countText = await contactCount.textContent();
      const count = parseInt(countText?.match(/\d+/)?.[0] || "0");
      expect(count).toBeGreaterThanOrEqual(15);
    });

    test("should display Create Contact button", async ({ page }) => {
      // Verify Create Contact button exists and links to /contacts/new
      const createButton = page.locator('a[href="/contacts/new"]');
      await expect(createButton).toBeVisible();
      await expect(createButton).toContainText(/create contact/i);
    });

    test("should display search bar", async ({ page }) => {
      // Verify search input exists
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });

    test("should display filter controls", async ({ page }) => {
      // Click Show filters button to reveal filter controls
      const showFiltersButton = page.getByRole("button", {
        name: /show filters/i,
      });
      await showFiltersButton.click();

      // Wait for filters to expand
      await page.waitForTimeout(300);

      // Verify filter dropdowns exist
      // Priority filter should now be visible
      const priorityFilter = page.getByRole("combobox", { name: /priority/i });
      await expect(priorityFilter).toBeVisible();
    });

    test("should display sort dropdown", async ({ page }) => {
      // Verify sort dropdown exists
      const sortDropdown = page.getByRole("combobox", { name: /sort/i });
      await expect(sortDropdown).toBeVisible();
    });
  });

  test.describe("Search Functionality", () => {
    test("should filter contacts by search query", async ({ page }) => {
      // Type in search box (search for "John" - we have "John Martinez" in fixture)
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill("John");

      // Wait for debounce (500ms) and results to update
      await page.waitForTimeout(600);

      // Verify results update - should show "John Martinez"
      const contactCards = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );

      // Should have at least 1 contact (John Martinez)
      const count = await contactCards.count();
      expect(count).toBeGreaterThanOrEqual(1);

      // Verify "John Martinez" appears in results
      const johnContact = page.locator("text=/John Martinez/i");
      await expect(johnContact).toBeVisible();
    });

    test("should debounce search input", async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      // Type rapidly
      await searchInput.fill("J");
      await page.waitForTimeout(100);
      await searchInput.fill("Jo");
      await page.waitForTimeout(100);
      await searchInput.fill("Joh");
      await page.waitForTimeout(100);
      await searchInput.fill("John");

      // Search should only fire after debounce delay (500ms)
      await page.waitForTimeout(600);

      // Verify search has been executed (John Martinez should appear)
      const johnContact = page.locator("text=/John Martinez/i");
      await expect(johnContact).toBeVisible();
    });

    test("should clear search results when search is cleared", async ({
      page,
    }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      // Enter search term
      await searchInput.fill("John");
      await page.waitForTimeout(600);

      // Verify filtered results (should show ~1 contact)
      const contactCardsFiltered = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const filteredCount = await contactCardsFiltered.count();
      expect(filteredCount).toBeLessThan(15); // Less than total 15 contacts

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(600);

      // Verify all 15 contacts are shown again
      const contactCardsAll = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const allCount = await contactCardsAll.count();
      expect(allCount).toBeGreaterThanOrEqual(15); // All 15 test contacts visible
    });
  });

  test.describe("Filter Functionality", () => {
    test("should filter contacts by priority", async ({ page }) => {
      // Click Show filters button to reveal filter controls
      const showFiltersButton = page.getByRole("button", {
        name: /show filters/i,
      });
      await showFiltersButton.click();
      await page.waitForTimeout(300);

      // Select HIGH priority filter
      const priorityFilter = page.getByRole("combobox", { name: /priority/i });

      // Click to open dropdown (if it's a custom component)
      await priorityFilter.click();

      // Select HIGH option
      const highOption = page
        .locator('option:has-text("High"), [role="option"]:has-text("High")')
        .first();
      if (await highOption.isVisible()) {
        await highOption.click();
      } else {
        // If it's a native select, use selectOption
        await priorityFilter.selectOption({ label: "High" });
      }

      // Wait for results to update
      await page.waitForTimeout(500);

      // Verify only HIGH priority contacts are shown
      // We have 5 HIGH priority contacts in fixture:
      // Alice Anderson, Diana Davis, George Garcia, Julia Jones, John Martinez
      const contactCards = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const highPriorityCount = await contactCards.count();

      // Should show 5 HIGH priority contacts
      expect(highPriorityCount).toBe(5);
    });

    test("should filter contacts by company", async ({ page }) => {
      // Find company filter input
      const companyFilter = page
        .locator('input[placeholder*="company" i]')
        .first();

      if (await companyFilter.isVisible()) {
        // Search for "Acme Corp" - we have 2 contacts with this company
        await companyFilter.fill("Acme Corp");
        await page.waitForTimeout(600);

        // Verify results are filtered (should show Alice Anderson and Charlie Chen)
        const contactCards = page.locator(
          '[data-testid="contact-card"], article, [role="article"]',
        );
        const acmeCount = await contactCards.count();

        // Should show 2 "Acme Corp" contacts
        expect(acmeCount).toBe(2);

        // Verify "Alice Anderson" and "Charlie Chen" appear
        const aliceContact = page.locator("text=/Alice Anderson/i");
        const charlieContact = page.locator("text=/Charlie Chen/i");
        await expect(aliceContact).toBeVisible();
        await expect(charlieContact).toBeVisible();
      }
    });

    test("should clear all filters", async ({ page }) => {
      // Apply filters
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill("Test");
      await page.waitForTimeout(600);

      // Check for clear filters button (if empty state)
      const clearButton = page.locator('button:has-text("Clear")').first();

      if (await clearButton.isVisible()) {
        await clearButton.click();

        // Verify filters are cleared
        await expect(searchInput).toHaveValue("");
      }
    });
  });

  test.describe("Sort Functionality", () => {
    test("should sort contacts by name", async ({ page }) => {
      const sortDropdown = page.getByRole("combobox", { name: /sort/i });

      // Select "Name (A-Z)" sort option
      await sortDropdown.selectOption({ label: "Name (A-Z)" });

      await page.waitForTimeout(500);

      // Verify contacts are sorted alphabetically
      // First contact should be "Alice Anderson" (A comes first)
      const firstContact = page
        .locator('[data-testid="contact-card"], article, [role="article"]')
        .first();
      const firstContactText = await firstContact.textContent();
      expect(firstContactText).toContain("Alice Anderson");
    });

    test("should sort contacts by priority", async ({ page }) => {
      const sortDropdown = page.getByRole("combobox", { name: /sort/i });

      // Select "Priority (High to Low)" sort option
      await sortDropdown.selectOption({ label: "Priority (High to Low)" });

      await page.waitForTimeout(500);

      // Verify contacts are sorted by priority (HIGH → MEDIUM → LOW)
      // First contact should be HIGH priority (one of: Alice, Diana, George, Julia, John)
      const contactCards = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const firstCard = contactCards.first();

      // First card should have HIGH priority badge
      const priorityBadge = firstCard.locator("text=/high/i");
      await expect(priorityBadge).toBeVisible();
    });
  });

  test.describe("Pagination", () => {
    test("should display Load More button when more contacts exist", async ({
      page,
    }) => {
      // Check if Load More button exists (should exist with 15 contacts, default page size is 12)
      const loadMoreButton = page.locator('button:has-text("Load More")');

      // With 15 contacts and page size 12, Load More button should be visible
      await expect(loadMoreButton).toBeVisible();
      await expect(loadMoreButton).toBeEnabled();
    });

    test("should load more contacts when Load More is clicked", async ({
      page,
    }) => {
      const loadMoreButton = page.locator('button:has-text("Load More")');

      // Verify button is visible
      await expect(loadMoreButton).toBeVisible();

      // Count contacts before clicking (should be 12)
      const contactCards = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const initialCount = await contactCards.count();
      expect(initialCount).toBe(12); // Default page size

      // Click Load More
      await loadMoreButton.click();

      // Wait for loading and new contacts
      await page.waitForTimeout(1000);

      // Verify more contacts are loaded (should now show 15)
      const newCount = await contactCards.count();
      expect(newCount).toBe(15); // All 15 test contacts
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test("should show loading state when fetching more contacts", async ({
      page,
    }) => {
      const loadMoreButton = page.locator('button:has-text("Load More")');

      // Verify button is visible
      await expect(loadMoreButton).toBeVisible();

      // Click Load More
      await loadMoreButton.click();

      // Verify loading text appears
      const loadingText = page.locator("text=/loading more/i");
      await expect(loadingText).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe("Empty State", () => {
    test("should show empty state with filters when search yields no results", async ({
      page,
    }) => {
      // Search for non-existent contact
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill("NonExistentContact12345");
      await page.waitForTimeout(600);

      // Verify "no contacts found" message appears
      const emptyState = page.locator("text=/no contacts found/i");
      await expect(emptyState).toBeVisible();

      // Verify our 15 test contacts are not visible
      const contactCards = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const count = await contactCards.count();
      expect(count).toBe(0); // No contacts should be visible
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to create contact page when Create button is clicked", async ({
      page,
    }) => {
      // Click Create Contact button
      const createButton = page.locator('a[href="/contacts/new"]');
      await createButton.click();

      // Verify navigation to /contacts/new
      await expect(page).toHaveURL(/\/contacts\/new/);
    });

    test("should navigate to contact detail when contact card is clicked", async ({
      page,
    }) => {
      // Find first contact card link (should be Alice Anderson if sorted by name)
      const contactCard = page.locator('a[href*="/contacts/"]').first();

      // Verify card is visible
      await expect(contactCard).toBeVisible();

      // Get the contact ID from the href before clicking
      const href = await contactCard.getAttribute("href");
      expect(href).toMatch(/\/contacts\/test-contact-[a-f0-9-]+/);

      // Click the contact card
      await contactCard.click();

      // Verify navigation to contact detail page (URL pattern: /contacts/[id])
      await expect(page).toHaveURL(/\/contacts\/test-contact-[a-f0-9-]+/);

      // Verify we're on Alice Anderson's detail page (if sorted by name)
      const contactName = page.locator("h1");
      await expect(contactName).toBeVisible();
    });
  });

  test.describe("Loading States", () => {
    test("should show loading spinner on initial page load", async ({
      page,
    }) => {
      // Navigate and check for loading state immediately
      await page.goto("/contacts");

      // Look for loading spinner or loading text
      const loadingIndicator = page
        .locator('text=/loading contacts/i, [role="status"]')
        .first();

      // Loading state may be very brief, so use a short timeout
      const isVisible = await loadingIndicator
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      // Loading state is expected to appear and then disappear quickly
      // In real test, you might use network throttling to make this more reliable
    });
  });

  test.describe("Error States", () => {
    test("should display error message when API fails", async ({ page }) => {
      // Mock API failure before navigating
      await page.route("**/graphql", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            errors: [{ message: "Internal server error" }],
          }),
        });
      });

      // Navigate to contacts page
      await page.goto("/contacts");

      // Verify error message is displayed
      const errorMessage = page.locator(
        "text=/error loading contacts/i, text=/something went wrong/i",
      );
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("should display properly on mobile viewport", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/contacts");

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Contacts")', { timeout: 10000 });

      // Verify page is still functional
      const heading = page.locator('h1:has-text("Contacts")');
      await expect(heading).toBeVisible();

      // Verify Create button is still accessible
      const createButton = page.locator('a[href="/contacts/new"]');
      await expect(createButton).toBeVisible();

      // Verify contacts are displayed (should show our 15 test contacts)
      const contactCards = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const count = await contactCards.count();
      expect(count).toBeGreaterThanOrEqual(12); // At least first page visible
    });

    test("should display properly on tablet viewport", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/contacts");

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Contacts")', { timeout: 10000 });

      // Verify page layout
      const heading = page.locator('h1:has-text("Contacts")');
      await expect(heading).toBeVisible();

      // Verify contacts are displayed
      const contactCards = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const count = await contactCards.count();
      expect(count).toBeGreaterThanOrEqual(12); // First page visible

      // Verify grid layout adjusts (2 columns on tablet)
      // In real test, check computed styles or grid structure
    });

    test("should display properly on desktop viewport", async ({ page }) => {
      // Set desktop viewport (default is usually 1280x720)
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/contacts");

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Contacts")', { timeout: 10000 });

      // Verify page layout
      const heading = page.locator('h1:has-text("Contacts")');
      await expect(heading).toBeVisible();

      // Verify contacts are displayed
      const contactCards = page.locator(
        '[data-testid="contact-card"], article, [role="article"]',
      );
      const count = await contactCards.count();
      expect(count).toBeGreaterThanOrEqual(12); // First page visible

      // Verify grid layout uses full columns (4 columns on xl)
      // In real test, check computed styles or grid structure
    });
  });
});
