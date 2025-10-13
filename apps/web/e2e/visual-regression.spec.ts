import { test, expect } from "@playwright/test";

/**
 * Visual Regression Test Suite for shadcn UI Components
 *
 * This test suite captures screenshots of all refactored components
 * in both light and dark modes, across different viewports.
 *
 * Run with: pnpm --filter web test:e2e --project=chromium
 * Update baselines: pnpm --filter web test:e2e --project=chromium --update-snapshots
 */

// Helper function to set theme
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setTheme(page: any, theme: "light" | "dark") {
  await page.evaluate((theme: string) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, theme);
  // Wait for theme transition
  await page.waitForTimeout(300);
}

// Viewport configurations
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

test.describe("Visual Regression - Dashboard Page", () => {
  test("dashboard - light mode - desktop", async ({ page }) => {
    await page.goto("/dashboard");
    await setTheme(page, "light");
    await expect(page).toHaveScreenshot("dashboard-light-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("dashboard - dark mode - desktop", async ({ page }) => {
    await page.goto("/dashboard");
    await setTheme(page, "dark");
    await expect(page).toHaveScreenshot("dashboard-dark-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("dashboard - light mode - tablet", async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto("/dashboard");
    await setTheme(page, "light");
    await expect(page).toHaveScreenshot("dashboard-light-tablet.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("dashboard - dark mode - tablet", async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto("/dashboard");
    await setTheme(page, "dark");
    await expect(page).toHaveScreenshot("dashboard-dark-tablet.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("dashboard - light mode - mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/dashboard");
    await setTheme(page, "light");
    await expect(page).toHaveScreenshot("dashboard-light-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("dashboard - dark mode - mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/dashboard");
    await setTheme(page, "dark");
    await expect(page).toHaveScreenshot("dashboard-dark-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Contact List Page", () => {
  test("contact-list - light mode - desktop", async ({ page }) => {
    await page.goto("/contacts");
    await setTheme(page, "light");
    // Wait for contacts to load
    await page.waitForSelector(
      '[data-testid="contact-card"], [aria-label="No contacts found"]',
      { timeout: 10000 },
    );
    await expect(page).toHaveScreenshot("contact-list-light-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("contact-list - dark mode - desktop", async ({ page }) => {
    await page.goto("/contacts");
    await setTheme(page, "dark");
    await page.waitForSelector(
      '[data-testid="contact-card"], [aria-label="No contacts found"]',
      { timeout: 10000 },
    );
    await expect(page).toHaveScreenshot("contact-list-dark-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("contact-list - light mode - mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/contacts");
    await setTheme(page, "light");
    await page.waitForSelector(
      '[data-testid="contact-card"], [aria-label="No contacts found"]',
      { timeout: 10000 },
    );
    await expect(page).toHaveScreenshot("contact-list-light-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("contact-list - dark mode - mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/contacts");
    await setTheme(page, "dark");
    await page.waitForSelector(
      '[data-testid="contact-card"], [aria-label="No contacts found"]',
      { timeout: 10000 },
    );
    await expect(page).toHaveScreenshot("contact-list-dark-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Contact Form Page", () => {
  test("contact-form - light mode - desktop", async ({ page }) => {
    await page.goto("/contacts/new");
    await setTheme(page, "light");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("contact-form-light-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("contact-form - dark mode - desktop", async ({ page }) => {
    await page.goto("/contacts/new");
    await setTheme(page, "dark");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("contact-form-dark-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("contact-form - validation errors - light mode", async ({ page }) => {
    await page.goto("/contacts/new");
    await setTheme(page, "light");
    await page.waitForSelector("form");

    // Submit form without filling required fields to trigger validation
    const submitButton = page.getByRole("button", { name: /create contact/i });
    await submitButton.click();

    // Wait for validation errors to appear
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(
      "contact-form-errors-light-desktop.png",
      {
        fullPage: true,
        animations: "disabled",
      },
    );
  });

  test("contact-form - light mode - mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/contacts/new");
    await setTheme(page, "light");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("contact-form-light-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Login Page", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Run unauthenticated

  test("login - light mode - desktop", async ({ page }) => {
    await page.goto("/login");
    await setTheme(page, "light");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("login-light-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("login - dark mode - desktop", async ({ page }) => {
    await page.goto("/login");
    await setTheme(page, "dark");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("login-dark-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("login - light mode - mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/login");
    await setTheme(page, "light");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("login-light-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("login - dark mode - mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/login");
    await setTheme(page, "dark");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("login-dark-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Signup Page", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Run unauthenticated

  test("signup - light mode - desktop", async ({ page }) => {
    await page.goto("/signup");
    await setTheme(page, "light");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("signup-light-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("signup - dark mode - desktop", async ({ page }) => {
    await page.goto("/signup");
    await setTheme(page, "dark");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("signup-dark-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("signup - password strength indicator - light mode", async ({
    page,
  }) => {
    await page.goto("/signup");
    await setTheme(page, "light");
    await page.waitForSelector("form");

    // Type a strong password to show the strength indicator
    const passwordInput = page.getByLabelText(/^Password$/);
    await passwordInput.fill("StrongP@ssw0rd!");

    // Wait for strength indicator to appear
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(
      "signup-password-strength-light-desktop.png",
      {
        fullPage: true,
        animations: "disabled",
      },
    );
  });

  test("signup - light mode - mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto("/signup");
    await setTheme(page, "light");
    await page.waitForSelector("form");
    await expect(page).toHaveScreenshot("signup-light-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - shadcn Components", () => {
  test("button-variants - light mode", async ({ page }) => {
    await page.goto("/dashboard");
    await setTheme(page, "light");
    await page.waitForLoadState("networkidle");

    // Screenshot the Quick Actions card which shows button variants
    const quickActionsCard = page.locator("text=Quick Actions").locator("..");
    await expect(quickActionsCard).toHaveScreenshot(
      "button-variants-light.png",
      {
        animations: "disabled",
      },
    );
  });

  test("button-variants - dark mode", async ({ page }) => {
    await page.goto("/dashboard");
    await setTheme(page, "dark");
    await page.waitForLoadState("networkidle");

    const quickActionsCard = page.locator("text=Quick Actions").locator("..");
    await expect(quickActionsCard).toHaveScreenshot(
      "button-variants-dark.png",
      {
        animations: "disabled",
      },
    );
  });

  test("card-component - light mode", async ({ page }) => {
    await page.goto("/dashboard");
    await setTheme(page, "light");
    await page.waitForLoadState("networkidle");

    // Screenshot the Getting Started card
    const gettingStartedCard = page
      .locator("text=Getting Started")
      .locator("..");
    await expect(gettingStartedCard).toHaveScreenshot(
      "card-component-light.png",
      {
        animations: "disabled",
      },
    );
  });

  test("card-component - dark mode", async ({ page }) => {
    await page.goto("/dashboard");
    await setTheme(page, "dark");
    await page.waitForLoadState("networkidle");

    const gettingStartedCard = page
      .locator("text=Getting Started")
      .locator("..");
    await expect(gettingStartedCard).toHaveScreenshot(
      "card-component-dark.png",
      {
        animations: "disabled",
      },
    );
  });
});

test.describe("Visual Regression - Responsive Design", () => {
  const pages = [
    { path: "/dashboard", name: "dashboard" },
    { path: "/contacts", name: "contact-list" },
    { path: "/contacts/new", name: "contact-form" },
  ];

  for (const { path, name } of pages) {
    test(`${name} - responsive grid - desktop`, async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto(path);
      await setTheme(page, "light");
      if (path === "/contacts") {
        await page.waitForSelector(
          '[data-testid="contact-card"], [aria-label="No contacts found"]',
          { timeout: 10000 },
        );
      }
      await expect(page).toHaveScreenshot(`${name}-responsive-desktop.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });

    test(`${name} - responsive grid - tablet`, async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.goto(path);
      await setTheme(page, "light");
      if (path === "/contacts") {
        await page.waitForSelector(
          '[data-testid="contact-card"], [aria-label="No contacts found"]',
          { timeout: 10000 },
        );
      }
      await expect(page).toHaveScreenshot(`${name}-responsive-tablet.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });

    test(`${name} - responsive grid - mobile`, async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto(path);
      await setTheme(page, "light");
      if (path === "/contacts") {
        await page.waitForSelector(
          '[data-testid="contact-card"], [aria-label="No contacts found"]',
          { timeout: 10000 },
        );
      }
      await expect(page).toHaveScreenshot(`${name}-responsive-mobile.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});
