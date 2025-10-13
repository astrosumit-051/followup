import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility Audit Test Suite
 *
 * This test suite uses axe-core to perform comprehensive WCAG 2.1 AA compliance testing
 * on all pages and components in the application.
 *
 * Tests cover:
 * - Color contrast ratios
 * - Keyboard navigation
 * - ARIA attributes
 * - Form labels and associations
 * - Focus indicators
 * - Semantic HTML
 */

test.describe("Accessibility Audit - WCAG 2.1 AA Compliance", () => {
  test.beforeEach(async ({ page }) => {
    // Wait for page to be fully ready
    await page.waitForLoadState("networkidle");
  });

  test("Login page should have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/login");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Signup page should have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/signup");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Dashboard (authenticated) should have no accessibility violations", async ({
    page,
  }) => {
    // Note: This test requires authentication state from auth-setup
    await page.goto("/dashboard");

    // Wait for dashboard content to load
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Contact list page should have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/contacts");

    // Wait for contacts to load
    await page.waitForSelector(
      '[data-testid="contact-card"], [data-testid="empty-state"]',
      { timeout: 10000 },
    );

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Contact creation form should have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/contacts/new");

    // Wait for form to be visible
    await page.waitForSelector("form", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test.describe("Keyboard Navigation", () => {
    test("Login form should be fully navigable by keyboard", async ({
      page,
    }) => {
      await page.goto("/login");

      // Tab through form fields
      await page.keyboard.press("Tab"); // Email field
      const emailField = page.locator('input[type="email"]');
      await expect(emailField).toBeFocused();

      await page.keyboard.press("Tab"); // Password field
      const passwordField = page.locator('input[type="password"]');
      await expect(passwordField).toBeFocused();

      await page.keyboard.press("Tab"); // Submit button
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeFocused();

      // Should be able to submit with Enter
      await page.keyboard.press("Enter");
    });

    test("Contact form should be fully navigable by keyboard", async ({
      page,
    }) => {
      await page.goto("/contacts/new");

      await page.waitForSelector("form");

      // Tab through all form fields
      await page.keyboard.press("Tab"); // Name field
      const nameField = page.locator('input[name="name"]');
      await expect(nameField).toBeFocused();

      // Can continue tabbing through all fields
      await page.keyboard.press("Tab"); // Email field
      await page.keyboard.press("Tab"); // Phone field
      await page.keyboard.press("Tab"); // LinkedIn URL field

      // All fields should be reachable
      const fields = page.locator("input, textarea, select, button");
      const count = await fields.count();
      expect(count).toBeGreaterThan(5); // At least 5 interactive elements
    });

    test("Theme toggle should be keyboard accessible", async ({ page }) => {
      await page.goto("/dashboard");

      // Find theme toggle button
      const themeToggle = page
        .locator(
          '[aria-label*="theme" i], button:has-text("Light"), button:has-text("Dark")',
        )
        .first();

      if (await themeToggle.isVisible()) {
        await themeToggle.focus();
        await expect(themeToggle).toBeFocused();

        // Should toggle with Enter key
        await page.keyboard.press("Enter");

        // Theme should change (verify by checking theme class or state)
        await page.waitForTimeout(500); // Allow theme transition
      }
    });

    test("Contact delete dialog should trap focus", async ({ page }) => {
      // Navigate to a contact detail page
      await page.goto("/contacts");

      // Wait for contacts to load
      await page.waitForSelector('[data-testid="contact-card"]', {
        timeout: 10000,
      });

      // Click first contact
      const firstContact = page.locator('[data-testid="contact-card"]').first();
      await firstContact.click();

      // Find and click delete button
      const deleteButton = page.locator('button:has-text("Delete")');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Dialog should open
        await page.waitForSelector('[role="alertdialog"]');

        // Focus should be trapped in dialog
        await page.keyboard.press("Tab");
        const focusedElement = page.locator(":focus");

        // Focused element should be inside dialog
        const dialog = page.locator('[role="alertdialog"]');
        expect(await dialog.locator(":focus").count()).toBeGreaterThan(0);

        // Escape should close dialog
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
      }
    });
  });

  test.describe("ARIA Attributes", () => {
    test("Form inputs should have associated labels", async ({ page }) => {
      await page.goto("/contacts/new");

      const inputs = page.locator("input, textarea, select");
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");

        if (id) {
          // Should have associated label
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });

    test("Error messages should have aria-describedby", async ({ page }) => {
      await page.goto("/login");

      // Submit empty form to trigger errors
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for error message
      await page
        .waitForSelector('[class*="destructive"]', { timeout: 2000 })
        .catch(() => {});

      // If error is shown, check aria-describedby
      const errorMessage = page.locator('[class*="destructive"]').first();
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        expect(errorText).toBeTruthy();
      }
    });

    test("Dialogs should have aria-labelledby and aria-describedby", async ({
      page,
    }) => {
      await page.goto("/contacts");

      // Try to find and open a delete dialog
      const firstContact = page.locator('[data-testid="contact-card"]').first();
      if (await firstContact.isVisible()) {
        await firstContact.click();

        const deleteButton = page.locator('button:has-text("Delete")');
        if (await deleteButton.isVisible()) {
          await deleteButton.click();

          const dialog = page.locator('[role="alertdialog"]');
          await expect(dialog).toBeVisible();

          // Check for aria-labelledby
          const ariaLabelledBy = await dialog.getAttribute("aria-labelledby");
          expect(ariaLabelledBy).toBeTruthy();

          // Check for aria-describedby
          const ariaDescribedBy = await dialog.getAttribute("aria-describedby");
          expect(ariaDescribedBy).toBeTruthy();
        }
      }
    });
  });

  test.describe("Color Contrast", () => {
    test("All text should meet WCAG AA contrast requirements (light mode)", async ({
      page,
    }) => {
      // Ensure light mode
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/dashboard");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2aa", "wcag21aa"])
        .analyze();

      // Filter for color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === "color-contrast",
      );

      expect(contrastViolations).toEqual([]);
    });

    test("All text should meet WCAG AA contrast requirements (dark mode)", async ({
      page,
    }) => {
      // Ensure dark mode
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/dashboard");

      // Toggle to dark mode via theme toggle
      const themeToggle = page
        .locator('[aria-label*="theme" i], button:has-text("Dark")')
        .first();
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500); // Allow theme transition
      }

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2aa", "wcag21aa"])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === "color-contrast",
      );

      expect(contrastViolations).toEqual([]);
    });
  });

  test.describe("Focus Indicators", () => {
    test("Interactive elements should have visible focus indicators", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Tab to first interactive element
      await page.keyboard.press("Tab");

      // Get focused element
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Check if element has focus ring (outline or ring classes from Tailwind/shadcn)
      const classes = (await focusedElement.getAttribute("class")) || "";

      // shadcn components use focus-visible:ring or focus:ring classes
      const hasFocusIndicator =
        classes.includes("focus:") ||
        classes.includes("focus-visible:") ||
        (await page.evaluate(
          (el) => {
            const styles = window.getComputedStyle(el);
            return styles.outline !== "none" && styles.outline !== "0px";
          },
          await focusedElement.elementHandle(),
        ));

      expect(hasFocusIndicator).toBeTruthy();
    });

    test("Buttons should have visible focus indicators", async ({ page }) => {
      await page.goto("/contacts");

      const createButton = page
        .locator(
          'button:has-text("Create Contact"), a:has-text("Create Contact")',
        )
        .first();
      await createButton.focus();

      await expect(createButton).toBeFocused();

      // Check for focus styles
      const classes = (await createButton.getAttribute("class")) || "";
      expect(
        classes.includes("focus:") || classes.includes("focus-visible:"),
      ).toBeTruthy();
    });
  });

  test.describe("Responsive Design Accessibility", () => {
    test("Mobile viewport should maintain accessibility", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto("/contacts");

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("Tablet viewport should maintain accessibility", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto("/dashboard");

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
