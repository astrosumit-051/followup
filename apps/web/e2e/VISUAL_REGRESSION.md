# Visual Regression Testing Guide

This guide explains how to use visual regression testing with Playwright for the shadcn UI components.

## Overview

Visual regression tests capture screenshots of components and pages in different states (light/dark mode, different viewports) and compare them against baseline images to detect unintended visual changes.

## Test Coverage

The visual regression test suite (`visual-regression.spec.ts`) covers:

### Pages
- **Dashboard** - Light/Dark modes, Desktop/Tablet/Mobile viewports
- **Contact List** - Light/Dark modes, Desktop/Mobile viewports
- **Contact Form** - Light/Dark modes, Desktop/Mobile viewports, Validation errors
- **Login Page** - Light/Dark modes, Desktop/Mobile viewports
- **Signup Page** - Light/Dark modes, Desktop/Mobile viewports, Password strength indicator

### Components
- **Button variants** - Primary, Outline, Destructive (Light/Dark modes)
- **Card components** - CardHeader, CardTitle, CardContent, CardFooter (Light/Dark modes)
- **Form components** - Input, Label, Select, Textarea with validation states
- **Responsive design** - Grid layouts across mobile (375px), tablet (768px), desktop (1440px)

## Running Visual Regression Tests

### 1. Run tests and create baseline screenshots (first time)

```bash
# From project root
pnpm --filter web test:e2e --grep="Visual Regression" --project=chromium --update-snapshots
```

This will:
- Run all visual regression tests
- Create baseline screenshots in `apps/web/e2e/visual-regression.spec.ts-snapshots/`
- Organize screenshots by browser (chromium, firefox, webkit)

### 2. Run tests to detect visual changes

```bash
# Run visual regression tests
pnpm --filter web test:e2e --grep="Visual Regression" --project=chromium
```

This will:
- Compare current screenshots against baselines
- Fail if visual differences exceed threshold (configurable in `playwright.config.ts`)
- Generate diff images showing what changed

### 3. Update baselines when changes are intentional

```bash
# Update baseline screenshots after intentional design changes
pnpm --filter web test:e2e --grep="Visual Regression" --project=chromium --update-snapshots
```

### 4. Run on all browsers

```bash
# Run on Chrome, Firefox, and Safari
pnpm --filter web test:e2e --grep="Visual Regression"
```

## Configuration

Visual regression settings are configured in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,           // Max pixels that can differ
    maxDiffPixelRatio: 0.01,      // Max 1% of pixels can differ
    threshold: 0.2,                // Pixel comparison threshold (0-1)
    animations: 'disabled',        // Disable animations for consistent screenshots
  },
}
```

## Viewport Sizes

The test suite uses these standardized viewports:

- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1440x900 (Standard desktop)

## CI/CD Integration

Visual regression tests are configured to run on CI:

```yaml
# .github/workflows/visual-regression.yml (example)
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm --filter web exec playwright install --with-deps chromium

      - name: Run visual regression tests
        run: pnpm --filter web test:e2e --grep="Visual Regression" --project=chromium

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-report
          path: apps/web/playwright-report/
```

## Reviewing Visual Differences

When tests fail due to visual changes:

1. **Review the HTML report**:
   ```bash
   pnpm --filter web exec playwright show-report
   ```

2. **Check diff images** in:
   - `apps/web/test-results/` - Contains actual vs expected vs diff images

3. **Determine if changes are intentional**:
   - **Yes**: Update baselines with `--update-snapshots`
   - **No**: Fix the code causing unintended visual changes

## Best Practices

1. **Always disable animations** - Use `animations: 'disabled'` for consistent screenshots
2. **Wait for stable state** - Use `waitForLoadState('networkidle')` before screenshots
3. **Set consistent viewport** - Use predefined viewport sizes
4. **Isolate theme changes** - Test light and dark modes separately
5. **Update baselines carefully** - Review diffs before updating baselines
6. **Run locally before CI** - Catch issues early by running tests locally

## Troubleshooting

### Screenshots differ slightly on different machines

- **Cause**: Font rendering, browser versions, or OS differences
- **Solution**: Run tests in Docker or use same CI environment

### Tests fail with "maxDiffPixels exceeded"

- **Cause**: Legitimate visual changes or flaky rendering
- **Solution**: Review diff images, adjust threshold if needed, or update baselines

### Theme toggle not working in tests

- **Cause**: Theme provider not loaded or localStorage not set
- **Solution**: Use `setTheme()` helper function and wait for transition

### Mobile screenshots look wrong

- **Cause**: Viewport size not set correctly
- **Solution**: Use `page.setViewportSize()` before navigation

## Adding New Visual Tests

When adding new components or pages:

1. Create test in `visual-regression.spec.ts`
2. Use the `setTheme()` helper for light/dark modes
3. Test all relevant viewports (mobile, tablet, desktop)
4. Run with `--update-snapshots` to create baselines
5. Verify baselines look correct
6. Commit baselines to version control

Example:

```typescript
test('new-component - light mode - desktop', async ({ page }) => {
  await page.goto('/new-page');
  await setTheme(page, 'light');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('new-component-light-desktop.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
```

## Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Next.js Testing](https://nextjs.org/docs/testing)
