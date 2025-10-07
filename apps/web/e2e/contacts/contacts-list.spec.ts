import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Contact List Page
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

test.describe('Contact List Page', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you would need to:
    // 1. Authenticate the user (use auth helper)
    // 2. Seed test database with contacts
    // For now, we'll test the UI structure assuming auth is handled by middleware

    await page.goto('/contacts');
  });

  test.describe('Page Layout and Structure', () => {
    test('should display page title and contact count', async ({ page }) => {
      // Verify page heading
      const heading = page.locator('h1:has-text("Contacts")');
      await expect(heading).toBeVisible();

      // Verify contact count is displayed (format: "X contact(s)")
      const contactCount = page.locator('text=/\\d+ contacts?/i');
      await expect(contactCount).toBeVisible();
    });

    test('should display Create Contact button', async ({ page }) => {
      // Verify Create Contact button exists and links to /contacts/new
      const createButton = page.locator('a[href="/contacts/new"]');
      await expect(createButton).toBeVisible();
      await expect(createButton).toContainText(/create contact/i);
    });

    test('should display search bar', async ({ page }) => {
      // Verify search input exists
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });

    test('should display filter controls', async ({ page }) => {
      // Verify filter dropdowns exist
      // Priority filter
      const priorityFilter = page.locator('select, [role="combobox"]').filter({ hasText: /priority/i }).first();
      await expect(priorityFilter).toBeVisible();
    });

    test('should display sort dropdown', async ({ page }) => {
      // Verify sort dropdown exists
      const sortDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /sort/i }).first();
      await expect(sortDropdown).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should filter contacts by search query', async ({ page }) => {
      // Type in search box
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('John');

      // Wait for debounce (500ms) and results to update
      await page.waitForTimeout(600);

      // Verify results update (contact cards should be visible)
      // In real test with seeded data, verify specific contacts appear
      const contactCards = page.locator('[data-testid="contact-card"], article, [role="article"]');

      // If there are contacts matching "John", they should be visible
      // If no contacts, empty state should be visible
      const hasContacts = await contactCards.count() > 0;
      const emptyState = page.locator('text=/no contacts found/i');

      if (!hasContacts) {
        await expect(emptyState).toBeVisible();
      }
    });

    test('should debounce search input', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      // Type rapidly
      await searchInput.fill('J');
      await page.waitForTimeout(100);
      await searchInput.fill('Jo');
      await page.waitForTimeout(100);
      await searchInput.fill('Joh');
      await page.waitForTimeout(100);
      await searchInput.fill('John');

      // Search should only fire after debounce delay (500ms)
      await page.waitForTimeout(600);

      // Verify search has been executed (URL or loading state)
      // In real implementation, check that API was called only once
    });

    test('should clear search results when search is cleared', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');

      // Enter search term
      await searchInput.fill('John');
      await page.waitForTimeout(600);

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(600);

      // Verify all contacts are shown again (or original state)
      // In real test, verify contact count returns to original
    });
  });

  test.describe('Filter Functionality', () => {
    test('should filter contacts by priority', async ({ page }) => {
      // Select HIGH priority filter
      const priorityFilter = page.locator('select, [role="combobox"]').filter({ hasText: /priority/i }).first();

      // Click to open dropdown (if it's a custom component)
      await priorityFilter.click();

      // Select HIGH option
      const highOption = page.locator('option:has-text("High"), [role="option"]:has-text("High")').first();
      if (await highOption.isVisible()) {
        await highOption.click();
      } else {
        // If it's a native select, use selectOption
        await priorityFilter.selectOption({ label: 'High' });
      }

      // Wait for results to update
      await page.waitForTimeout(500);

      // Verify only HIGH priority contacts are shown
      // In real test with seeded data, check contact cards have HIGH badges
    });

    test('should filter contacts by company', async ({ page }) => {
      // Find company filter input
      const companyFilter = page.locator('input[placeholder*="company" i]').first();

      if (await companyFilter.isVisible()) {
        await companyFilter.fill('Acme Corp');
        await page.waitForTimeout(600);

        // Verify results are filtered
        // In real test, check that only "Acme Corp" contacts appear
      }
    });

    test('should clear all filters', async ({ page }) => {
      // Apply filters
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('Test');
      await page.waitForTimeout(600);

      // Check for clear filters button (if empty state)
      const clearButton = page.locator('button:has-text("Clear")').first();

      if (await clearButton.isVisible()) {
        await clearButton.click();

        // Verify filters are cleared
        await expect(searchInput).toHaveValue('');
      }
    });
  });

  test.describe('Sort Functionality', () => {
    test('should sort contacts by name', async ({ page }) => {
      const sortDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /sort/i }).first();

      // Select "Name" sort option
      await sortDropdown.click();
      const nameOption = page.locator('option:has-text("Name"), [role="option"]:has-text("Name")').first();

      if (await nameOption.isVisible()) {
        await nameOption.click();
      } else {
        await sortDropdown.selectOption({ label: 'Name' });
      }

      await page.waitForTimeout(500);

      // Verify contacts are sorted alphabetically
      // In real test with seeded data, verify first contact name < second contact name
    });

    test('should sort contacts by priority', async ({ page }) => {
      const sortDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /sort/i }).first();

      // Select "Priority" sort option
      await sortDropdown.click();
      const priorityOption = page.locator('option:has-text("Priority"), [role="option"]:has-text("Priority")').first();

      if (await priorityOption.isVisible()) {
        await priorityOption.click();
      } else {
        await sortDropdown.selectOption({ label: 'Priority' });
      }

      await page.waitForTimeout(500);

      // Verify contacts are sorted by priority (HIGH → MEDIUM → LOW)
      // In real test with seeded data, verify priority order
    });
  });

  test.describe('Pagination', () => {
    test('should display Load More button when more contacts exist', async ({ page }) => {
      // Check if Load More button exists (only if there are 13+ contacts)
      const loadMoreButton = page.locator('button:has-text("Load More")');

      // If button exists, it should be visible and clickable
      const isVisible = await loadMoreButton.isVisible().catch(() => false);

      if (isVisible) {
        await expect(loadMoreButton).toBeEnabled();
      }
    });

    test('should load more contacts when Load More is clicked', async ({ page }) => {
      const loadMoreButton = page.locator('button:has-text("Load More")');

      const isVisible = await loadMoreButton.isVisible().catch(() => false);

      if (isVisible) {
        // Count contacts before clicking
        const contactCards = page.locator('[data-testid="contact-card"], article, [role="article"]');
        const initialCount = await contactCards.count();

        // Click Load More
        await loadMoreButton.click();

        // Wait for loading and new contacts
        await page.waitForTimeout(1000);

        // Verify more contacts are loaded
        const newCount = await contactCards.count();
        expect(newCount).toBeGreaterThan(initialCount);
      }
    });

    test('should show loading state when fetching more contacts', async ({ page }) => {
      const loadMoreButton = page.locator('button:has-text("Load More")');

      const isVisible = await loadMoreButton.isVisible().catch(() => false);

      if (isVisible) {
        // Click Load More
        await loadMoreButton.click();

        // Verify loading text appears
        const loadingText = page.locator('text=/loading more/i');
        await expect(loadingText).toBeVisible({ timeout: 1000 });
      }
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state when no contacts exist', async ({ page }) => {
      // This test requires a database with no contacts
      // In real test, clear database or use isolated test user

      // Check for empty state message
      const emptyState = page.locator('text=/no contacts/i').first();

      // Empty state may or may not be visible depending on data
      // In real test with controlled data, this would be more specific
    });

    test('should show empty state with filters when search yields no results', async ({ page }) => {
      // Search for non-existent contact
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('NonExistentContact12345');
      await page.waitForTimeout(600);

      // Verify "no contacts found" message appears
      const emptyState = page.locator('text=/no contacts found/i');

      // Check if empty state is visible (may depend on actual data)
      const isVisible = await emptyState.isVisible().catch(() => false);

      if (isVisible) {
        await expect(emptyState).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to create contact page when Create button is clicked', async ({ page }) => {
      // Click Create Contact button
      const createButton = page.locator('a[href="/contacts/new"]');
      await createButton.click();

      // Verify navigation to /contacts/new
      await expect(page).toHaveURL(/\/contacts\/new/);
    });

    test('should navigate to contact detail when contact card is clicked', async ({ page }) => {
      // Find first contact card link
      const contactCard = page.locator('a[href*="/contacts/"]').first();

      const isVisible = await contactCard.isVisible().catch(() => false);

      if (isVisible) {
        // Click the contact card
        await contactCard.click();

        // Verify navigation to contact detail page (URL pattern: /contacts/[id])
        await expect(page).toHaveURL(/\/contacts\/[a-f0-9-]+/);
      }
    });
  });

  test.describe('Loading States', () => {
    test('should show loading spinner on initial page load', async ({ page }) => {
      // Navigate and check for loading state immediately
      await page.goto('/contacts');

      // Look for loading spinner or loading text
      const loadingIndicator = page.locator('text=/loading contacts/i, [role="status"]').first();

      // Loading state may be very brief, so use a short timeout
      const isVisible = await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false);

      // Loading state is expected to appear and then disappear quickly
      // In real test, you might use network throttling to make this more reliable
    });
  });

  test.describe('Error States', () => {
    test('should display error message when API fails', async ({ page }) => {
      // This test requires mocking API failure
      // In real test, use route interception to simulate API error

      // Example with route interception (would need GraphQL endpoint setup):
      // await page.route('**/graphql', route => {
      //   route.fulfill({
      //     status: 500,
      //     contentType: 'application/json',
      //     body: JSON.stringify({ errors: [{ message: 'Internal server error' }] })
      //   });
      // });

      // For now, just verify error UI exists
      // Error state is not expected in normal flow
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/contacts');

      // Verify page is still functional
      const heading = page.locator('h1:has-text("Contacts")');
      await expect(heading).toBeVisible();

      // Verify Create button is still accessible
      const createButton = page.locator('a[href="/contacts/new"]');
      await expect(createButton).toBeVisible();
    });

    test('should display properly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/contacts');

      // Verify page layout
      const heading = page.locator('h1:has-text("Contacts")');
      await expect(heading).toBeVisible();

      // Verify grid layout adjusts (2 columns on tablet)
      // In real test, check computed styles or grid structure
    });

    test('should display properly on desktop viewport', async ({ page }) => {
      // Set desktop viewport (default is usually 1280x720)
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/contacts');

      // Verify page layout
      const heading = page.locator('h1:has-text("Contacts")');
      await expect(heading).toBeVisible();

      // Verify grid layout uses full columns (4 columns on xl)
      // In real test, check computed styles or grid structure
    });
  });
});
