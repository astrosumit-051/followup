import { test, expect, type Page } from '@playwright/test';

/**
 * Responsive Design E2E Tests
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

// Test data
const mockContact = {
  name: 'Alice Johnson',
  email: 'alice.johnson@example.com',
  phone: '+1-555-0123',
  company: 'TechCorp International',
  industry: 'Technology',
  role: 'Senior Software Engineer',
  priority: 'HIGH' as const,
};

// Helper function to check if element meets touch target size
async function checkTouchTargetSize(element: any, minSize = 44) {
  const box = await element.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.height).toBeGreaterThanOrEqual(minSize);
  }
}

test.describe('Contact List Page - Responsive Design', () => {
  test.describe('Mobile Viewport (375px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display contact cards in single column grid', async ({ page }) => {
      await page.goto('/contacts');

      // Wait for contacts to load
      await page.waitForSelector('[data-testid="contact-card"]', {
        state: 'visible',
        timeout: 10000,
      });

      // Check grid layout - should be single column on mobile
      const grid = page.locator('[data-testid="contact-grid"]');
      await expect(grid).toBeVisible();
      await expect(grid).toHaveClass(/grid-cols-1/);

      // Verify cards stack vertically
      const cards = page.locator('[data-testid="contact-card"]');
      const count = await cards.count();
      if (count > 1) {
        const firstBox = await cards.nth(0).boundingBox();
        const secondBox = await cards.nth(1).boundingBox();
        expect(firstBox).not.toBeNull();
        expect(secondBox).not.toBeNull();
        if (firstBox && secondBox) {
          // Second card should be below first card
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
        }
      }
    });

    test('should have proper spacing and padding on mobile', async ({ page }) => {
      await page.goto('/contacts');
      await page.waitForSelector('[data-testid="contact-card"]', { state: 'visible' });

      // Check page padding
      const container = page.locator('.max-w-7xl').first();
      const containerBox = await container.boundingBox();
      expect(containerBox).not.toBeNull();
      if (containerBox) {
        // Should have px-4 padding on mobile (16px)
        expect(containerBox.x).toBeGreaterThanOrEqual(14); // Allow 2px tolerance
      }
    });

    test('should display Create Contact button with adequate touch target', async ({ page }) => {
      await page.goto('/contacts');

      const createButton = page.getByRole('link', { name: /create contact/i });
      await expect(createButton).toBeVisible();

      // Check touch target size
      await checkTouchTargetSize(createButton);
    });

    test('should stack filter controls vertically', async ({ page }) => {
      await page.goto('/contacts');

      // Show filters
      const showFiltersButton = page.getByRole('button', { name: /show filters/i });
      if (await showFiltersButton.isVisible()) {
        await showFiltersButton.click();

        // Filter controls should stack on mobile
        const filterGrid = page.locator('.grid.grid-cols-1').first();
        await expect(filterGrid).toBeVisible();
      }
    });

    test('should display contact card with proper mobile layout', async ({ page }) => {
      await page.goto('/contacts');
      await page.waitForSelector('[data-testid="contact-card"]', { state: 'visible' });

      const firstCard = page.locator('[data-testid="contact-card"]').first();

      // Profile section should stack on mobile (flex-col)
      const profileSection = firstCard.locator('.flex.flex-col').first();
      await expect(profileSection).toBeVisible();

      // Footer should stack vertically on mobile
      const footer = firstCard.locator('.flex.flex-col.space-y-1').first();
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Tablet Viewport (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should display contact cards in 2-column grid', async ({ page }) => {
      await page.goto('/contacts');
      await page.waitForSelector('[data-testid="contact-card"]', { state: 'visible' });

      // Should use sm:grid-cols-2 at tablet size
      const cards = page.locator('[data-testid="contact-card"]');
      const count = await cards.count();

      if (count >= 2) {
        const firstBox = await cards.nth(0).boundingBox();
        const secondBox = await cards.nth(1).boundingBox();

        expect(firstBox).not.toBeNull();
        expect(secondBox).not.toBeNull();

        if (firstBox && secondBox) {
          // Cards should be side by side at same Y position
          expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(10); // Allow small diff
        }
      }
    });

    test('should display horizontal filter layout', async ({ page }) => {
      await page.goto('/contacts');

      const showFiltersButton = page.getByRole('button', { name: /show filters/i });
      if (await showFiltersButton.isVisible()) {
        await showFiltersButton.click();

        // Should use grid-cols-3 on tablet
        const filterGrid = page.locator('.sm\\:grid-cols-3').first();
        await expect(filterGrid).toBeVisible();
      }
    });

    test('should display header with horizontal layout', async ({ page }) => {
      await page.goto('/contacts');

      // Header should be flex-row on tablet
      const header = page.locator('.sm\\:flex-row').first();
      await expect(header).toBeVisible();
    });
  });

  test.describe('Desktop Viewport (1440px)', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('should display contact cards in 4-column grid', async ({ page }) => {
      await page.goto('/contacts');
      await page.waitForSelector('[data-testid="contact-card"]', { state: 'visible' });

      // Should use xl:grid-cols-4 at desktop size
      const cards = page.locator('[data-testid="contact-card"]');
      const count = await cards.count();

      if (count >= 4) {
        const boxes = await Promise.all([
          cards.nth(0).boundingBox(),
          cards.nth(1).boundingBox(),
          cards.nth(2).boundingBox(),
          cards.nth(3).boundingBox(),
        ]);

        // All 4 cards should be on same row (similar Y position)
        const yPositions = boxes.filter(b => b !== null).map(b => b!.y);
        const maxYDiff = Math.max(...yPositions) - Math.min(...yPositions);
        expect(maxYDiff).toBeLessThan(20); // Allow small differences
      }
    });

    test('should display full-width page with proper max-width', async ({ page }) => {
      await page.goto('/contacts');

      const container = page.locator('.max-w-7xl').first();
      const containerBox = await container.boundingBox();

      expect(containerBox).not.toBeNull();
      if (containerBox) {
        // Should be centered with max-width constraint
        expect(containerBox.width).toBeLessThanOrEqual(1280); // max-w-7xl = 80rem = 1280px
      }
    });
  });
});

test.describe('Contact Form - Responsive Design', () => {
  test.describe('Mobile Viewport (375px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should stack form buttons vertically on mobile', async ({ page }) => {
      await page.goto('/contacts/new');
      await page.waitForLoadState('networkidle');

      // Submit button should be full width on mobile
      const submitButton = page.getByRole('button', { name: /create contact/i });
      await expect(submitButton).toBeVisible();

      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox).not.toBeNull();

      if (buttonBox) {
        // Should be close to full container width (accounting for padding)
        const container = page.locator('form').first();
        const containerBox = await container.boundingBox();

        if (containerBox) {
          expect(buttonBox.width).toBeGreaterThan(containerBox.width * 0.8);
        }
      }
    });

    test('should have adequate touch targets for all form buttons', async ({ page }) => {
      await page.goto('/contacts/new');
      await page.waitForLoadState('networkidle');

      const submitButton = page.getByRole('button', { name: /create contact/i });
      await checkTouchTargetSize(submitButton);
    });

    test('should display form fields full width', async ({ page }) => {
      await page.goto('/contacts/new');

      const nameInput = page.getByLabel(/name/i);
      const inputBox = await nameInput.boundingBox();
      const form = page.locator('form').first();
      const formBox = await form.boundingBox();

      expect(inputBox).not.toBeNull();
      expect(formBox).not.toBeNull();

      if (inputBox && formBox) {
        // Input should span nearly full width of form (accounting for padding)
        expect(inputBox.width).toBeGreaterThan(formBox.width * 0.85);
      }
    });
  });

  test.describe('Tablet & Desktop Viewport', () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test('should display buttons horizontally', async ({ page }) => {
      await page.goto('/contacts/new');
      await page.waitForLoadState('networkidle');

      // Buttons should be in horizontal row on larger screens
      const buttonContainer = page.locator('.sm\\:flex-row').last();
      await expect(buttonContainer).toBeVisible();
    });

    test('should have proper button widths (auto, not full)', async ({ page }) => {
      await page.goto('/contacts/new');

      const submitButton = page.getByRole('button', { name: /create contact/i });
      const buttonBox = await submitButton.boundingBox();
      const form = page.locator('form').first();
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

test.describe('Contact Detail Page - Responsive Design', () => {
  test.describe('Mobile Viewport (375px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should stack header vertically on mobile', async ({ page }) => {
      await page.goto('/contacts/[id]'); // Replace with actual ID in real test

      // Header should stack on mobile
      const header = page.locator('.flex.flex-col').first();
      await expect(header).toBeVisible();
    });

    test('should have adequate touch targets for Edit and Delete buttons', async ({ page }) => {
      await page.goto('/contacts/[id]'); // Replace with actual ID

      const editButton = page.getByRole('button', { name: /edit/i });
      const deleteButton = page.getByRole('button', { name: /delete/i });

      await checkTouchTargetSize(editButton);
      await checkTouchTargetSize(deleteButton);
    });

    test('should display buttons with equal width on mobile', async ({ page }) => {
      await page.goto('/contacts/[id]'); // Replace with actual ID

      const editButton = page.getByRole('button', { name: /edit/i });
      const deleteButton = page.getByRole('button', { name: /delete/i });

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

  test.describe('Desktop Viewport (1440px)', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('should display header horizontally', async ({ page }) => {
      await page.goto('/contacts/[id]'); // Replace with actual ID

      // Header should be horizontal row on desktop
      const header = page.locator('.sm\\:flex-row').first();
      await expect(header).toBeVisible();
    });
  });
});

test.describe('Touch Interactions', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  test('should handle tap on contact card', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForSelector('[data-testid="contact-card"]', { state: 'visible' });

    const firstCard = page.locator('[data-testid="contact-card"]').first();

    // Simulate touch tap
    await firstCard.tap();

    // Should navigate to detail page
    await page.waitForURL(/\/contacts\/[^\/]+$/);
    expect(page.url()).toMatch(/\/contacts\/[^\/]+$/);
  });

  test('should handle tap on buttons', async ({ page }) => {
    await page.goto('/contacts');

    const createButton = page.getByRole('link', { name: /create contact/i });
    await createButton.tap();

    // Should navigate to create page
    await expect(page).toHaveURL('/contacts/new');
  });
});
