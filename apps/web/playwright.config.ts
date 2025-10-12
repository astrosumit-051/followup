import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Test timeout - increase for backend startup wait */
  timeout: 90 * 1000, // 90 seconds to allow backend-ready setup to complete

  /* Reporter to use */
  reporter: 'html',

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure for debugging */
    video: 'retain-on-failure',

    /* Set viewport size for consistent testing */
    viewport: { width: 1280, height: 720 },
  },

  /* Visual regression testing configuration */
  expect: {
    toHaveScreenshot: {
      // Maximum number of pixels that can differ
      maxDiffPixels: 100,
      // Maximum percentage of pixels that can differ (0-1)
      maxDiffPixelRatio: 0.01,
      // Threshold for pixel comparison (0-1)
      threshold: 0.2,
      // Animation settings
      animations: 'disabled',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project #0 - Wait for backend API (runs first)
    {
      name: 'backend-ready',
      testMatch: /backend-ready\.setup\.ts/,
    },

    // Setup project #1 - Authentication (runs after backend is ready)
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      dependencies: ['backend-ready'],
    },

    // Setup project #2 - Database seeding (runs after auth)
    {
      name: 'seed-setup',
      testMatch: /seed\.setup\.ts/,
      dependencies: ['auth-setup'],
    },

    // Authenticated tests (require backend ready, login, and seeded data)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['backend-ready', 'auth-setup', 'seed-setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['backend-ready', 'auth-setup', 'seed-setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['backend-ready', 'auth-setup', 'seed-setup'],
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['backend-ready', 'auth-setup', 'seed-setup'],
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['backend-ready', 'auth-setup', 'seed-setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      DISABLE_RATE_LIMIT: 'true', // Disable API rate limiting for E2E tests
    },
    // Important: pnpm dev starts both frontend (3000) and backend (3001) via Turbo
    // The URL check only verifies frontend is ready. Backend readiness is ensured
    // by the 'backend-ready' setup project which polls http://localhost:3001/health
  },
});
