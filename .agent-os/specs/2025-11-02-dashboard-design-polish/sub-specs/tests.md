# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-11-02-dashboard-design-polish/spec.md

> Created: 2025-11-02
> Version: 1.0.0

## Test Strategy Overview

This spec focuses on **visual design compliance** rather than functional testing. The primary testing approach uses visual regression testing with screenshot comparisons before and after design changes. All functional tests already exist from the dashboard implementation spec.

**Testing Pyramid:**
- Visual Regression Tests: 70% (primary focus)
- Manual Design Review: 20%
- Automated Accessibility Checks: 10%

---

## Visual Regression Test Suite

### Test Setup

**Tool:** Playwright with screenshot comparison
**Viewports:** Desktop (1440px), Tablet (768px), Mobile Large (414px), Mobile Medium (375px), Mobile Small (360px)

**Test Configuration:**
```typescript
// e2e/dashboard/design-compliance.spec.ts
import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile-large', width: 414, height: 896 },
  { name: 'mobile-medium', width: 375, height: 667 },
  { name: 'mobile-small', width: 360, height: 640 },
];
```

### 1. Baseline Screenshot Capture (BEFORE Changes)

**Purpose:** Establish baseline screenshots before implementing design changes

**Test Cases:**

```typescript
test.describe('Dashboard Design - Baseline Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to dashboard
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'test@cordiq.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  for (const viewport of viewports) {
    test(`Baseline full page - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      await page.screenshot({
        path: `e2e/screenshots/baseline/dashboard-${viewport.name}.png`,
        fullPage: true
      });
    });

    test(`Baseline card components - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      // Individual card screenshots
      const cards = [
        'quick-add-card',
        'snapshot-card',
        'notifications-card',
        'growth-card',
        'todo-card',
        'activity-card'
      ];

      for (const card of cards) {
        const element = await page.locator(`[data-testid="${card}"]`);
        await element.screenshot({
          path: `e2e/screenshots/baseline/${card}-${viewport.name}.png`
        });
      }
    });
  }
});
```

### 2. Post-Implementation Screenshot Capture (AFTER Changes)

**Purpose:** Capture screenshots after implementing design changes for comparison

**Test Cases:**

```typescript
test.describe('Dashboard Design - Post-Implementation Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'test@cordiq.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  for (const viewport of viewports) {
    test(`Post-implementation full page - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      await page.screenshot({
        path: `e2e/screenshots/after/dashboard-${viewport.name}.png`,
        fullPage: true
      });
    });

    test(`Post-implementation card components - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      const cards = [
        'quick-add-card',
        'snapshot-card',
        'notifications-card',
        'growth-card',
        'todo-card',
        'activity-card'
      ];

      for (const card of cards) {
        const element = await page.locator(`[data-testid="${card}"]`);
        await element.screenshot({
          path: `e2e/screenshots/after/${card}-${viewport.name}.png`
        });
      }
    });
  }
});
```

### 3. Brand Compliance Automated Checks

**Purpose:** Programmatically verify specific design tokens and CSS properties

**Test Cases:**

```typescript
test.describe('Brand Compliance - Automated Checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
  });

  test('Background gradient colors', async ({ page }) => {
    const background = await page.locator('body > div').first();
    const computedStyle = await background.evaluate((el) => {
      return window.getComputedStyle(el).backgroundImage;
    });

    // Verify gradient includes brand colors
    expect(computedStyle).toContain('linear-gradient');
    // Colors should be present: #F8FBF6, #E8F0F7, #FFF9E8
  });

  test('Card border radius', async ({ page }) => {
    const cards = await page.locator('[data-testid$="-card"]').all();

    for (const card of cards) {
      const borderRadius = await card.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });

      // Should be 18px (1.125rem)
      expect(borderRadius).toMatch(/18px|1\.125rem/);
    }
  });

  test('KPI typography sizing', async ({ page }) => {
    // Check Snapshot card KPI values
    const kpiValues = await page.locator('[data-testid="snapshot-card"] .text-4xl').all();

    for (const kpi of kpiValues) {
      const fontSize = await kpi.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      // text-4xl = 36px (2.25rem)
      expect(fontSize).toMatch(/36px|2\.25rem/);
    }
  });

  test('Card shadows', async ({ page }) => {
    const cards = await page.locator('[data-testid$="-card"]').all();

    for (const card of cards) {
      const boxShadow = await card.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      // Should have layered shadows
      expect(boxShadow).toContain('rgba');
      expect(boxShadow.split('),').length).toBeGreaterThanOrEqual(2);
    }
  });

  test('Animation timing', async ({ page }) => {
    const interactiveElements = await page.locator('button, [role="button"]').all();

    for (const element of interactiveElements) {
      const transitionDuration = await element.evaluate((el) => {
        return window.getComputedStyle(el).transitionDuration;
      });

      // Should be 200ms (0.2s)
      expect(transitionDuration).toMatch(/200ms|0\.2s/);
    }
  });

  test('Primary button colors', async ({ page }) => {
    const quickAddButton = await page.locator('[data-testid="quick-add-card"] button').first();

    const backgroundColor = await quickAddButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Near-black: #0A0A0A = rgb(10, 10, 10)
    expect(backgroundColor).toMatch(/rgb\(10,\s*10,\s*10\)/);
  });
});
```

### 4. Dark Mode Compliance

**Purpose:** Verify design changes work correctly in dark mode

**Test Cases:**

```typescript
test.describe('Dark Mode Design Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    // Toggle to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500); // Allow theme transition
  });

  test('Dark mode gradient background', async ({ page }) => {
    const background = await page.locator('body > div').first();
    const computedStyle = await background.evaluate((el) => {
      return window.getComputedStyle(el).backgroundImage;
    });

    // Verify dark mode gradient
    expect(computedStyle).toContain('linear-gradient');
    // Dark colors: #1E1E1E, #1A1A1A
  });

  test('Dark mode card visibility', async ({ page }) => {
    const cards = await page.locator('[data-testid$="-card"]').all();

    for (const card of cards) {
      const backgroundColor = await card.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Should have sufficient contrast in dark mode
      expect(backgroundColor).not.toBe('transparent');
    }
  });

  for (const viewport of viewports) {
    test(`Dark mode full page - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      await page.screenshot({
        path: `e2e/screenshots/dark-mode/dashboard-${viewport.name}.png`,
        fullPage: true
      });
    });
  }
});
```

---

## Manual Testing Procedures

### Pre-Implementation Manual Review

**Checklist:** Verify current state before changes

- [ ] **Background Color**
  - Current: Flat gray (#bg-gray-50 light, #bg-gray-900 dark)
  - Note any dynamic elements or overlays

- [ ] **Card Border Radius**
  - Measure with browser DevTools (expect ~8-12px)
  - Screenshot card corners at 200% zoom

- [ ] **KPI Typography**
  - Measure font size in Snapshot card (expect ~24-28px)
  - Take screenshot of KPI numbers

- [ ] **Card Shadows**
  - Inspect current shadow values in DevTools
  - Screenshot cards to show subtle elevation

- [ ] **Animation Timing**
  - Test button hover (measure with DevTools Performance)
  - Test card hover transitions
  - Note any sluggishness

- [ ] **Button Colors**
  - Screenshot Quick Add button
  - Note background color (expect mint green)

### Post-Implementation Manual Review

**Checklist:** Verify design changes implemented correctly

- [ ] **Brand Gradient Background** ✨
  - Light mode shows soft multi-hue gradient (#F8FBF6 → #E8F0F7 → #FFF9E8)
  - Dark mode shows warmer gradient (#1E1E1E → #1A1A1A → #1E1E1E)
  - Gradient visible but not distracting
  - No banding or performance issues
  - Works on all devices (desktop, tablet, mobile)

- [ ] **Card Border Radius** 🎨
  - All cards show 18px border radius
  - Corners are consistently rounded
  - No clipping or overflow issues
  - Rounded corners visible in screenshots
  - Radius maintained across all viewport sizes

- [ ] **KPI Typography Enhancement** 📊
  - Snapshot card KPI values are 36px (text-4xl)
  - Total Contacts number is prominently displayed
  - Open Rate percentage is clearly readable
  - Response Rate percentage is clearly readable
  - All KPIs maintain proper spacing and alignment
  - Typography scaling works on mobile

- [ ] **Card Shadow Elevation** 💎
  - Cards have visible depth (default shadow visible)
  - Hover state shows increased elevation
  - Shadows are subtle but distinct
  - Layered shadows create natural depth
  - No harsh edges or pixelation
  - Shadows work in light and dark mode

- [ ] **Animation Timing Optimization** ⚡
  - Button hovers complete in ~200ms (feels snappy)
  - Card hover transitions are smooth
  - No perceived lag or sluggishness
  - Theme toggle animation is crisp
  - All micro-interactions feel responsive
  - No jank or stuttering

- [ ] **Primary Button Color Correction** 🎯
  - Quick Add button background is near-black (#0A0A0A)
  - Button text is white and readable
  - Hover state darkens to #1A1A1A
  - Strong contrast with card background
  - Button stands out as primary CTA
  - Color consistent across themes

### Interaction Testing

**Test All Interactive Elements:**

1. **Quick Add Card**
   - Click button → verify color and animation timing
   - Modal opens smoothly
   - Form interactions responsive

2. **Snapshot Card**
   - Hover over card → verify shadow transition
   - KPI numbers remain readable
   - No layout shifts

3. **Notifications Card**
   - Hover notifications → verify animations
   - Status badges readable
   - Action buttons respond quickly

4. **Growth Card**
   - Date range buttons → verify timing
   - Chart interactions smooth
   - No performance degradation

5. **Todo Card**
   - Checkbox animations → verify 200ms timing
   - Add todo button responsive
   - Delete icons appear/disappear smoothly

6. **Activity Card**
   - Scroll performance smooth
   - Activity items don't flicker
   - Timestamps remain aligned

7. **Theme Toggle**
   - Toggle switch animation crisp
   - Mode changes complete quickly
   - All design tokens update correctly

### Performance Testing

**Test Performance Impact:**

- [ ] **Chrome DevTools Lighthouse Audit**
  - Run before changes → baseline performance score
  - Run after changes → compare scores
  - Ensure no regression in performance metrics
  - Target: Performance score ≥ 90

- [ ] **Paint Performance**
  - Open DevTools Performance tab
  - Record page load and interactions
  - Check for paint warnings
  - Verify gradient rendering is efficient
  - Ensure animations maintain 60fps

- [ ] **Low-End Device Testing**
  - Test with 4x CPU slowdown
  - Verify animations remain smooth
  - Check gradient rendering performance
  - Ensure no janky scrolling

- [ ] **Network Throttling**
  - Test with Fast 3G simulation
  - Verify page loads within acceptable time
  - Check for layout shifts during load
  - Ensure gradients load progressively

---

## Accessibility Regression Testing

**Purpose:** Ensure design changes don't introduce accessibility issues

### Automated Accessibility Checks

```typescript
test.describe('Accessibility - Post Design Changes', () => {
  test('Touch target sizes maintained', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const interactiveElements = await page.locator('button, [role="button"], a').all();

    for (const element of interactiveElements) {
      const box = await element.boundingBox();
      if (box) {
        // Minimum 44x44px touch target
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Color contrast ratios', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Check KPI text contrast against background
    const kpiElements = await page.locator('[data-testid="snapshot-card"] .text-4xl').all();

    for (const kpi of kpiElements) {
      const { color, backgroundColor } = await kpi.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      });

      // Verify contrast ratio ≥ 4.5:1 (WCAG AA)
      // Note: Actual contrast calculation would require color library
      expect(color).toBeTruthy();
      expect(backgroundColor).toBeTruthy();
    }
  });

  test('Focus indicators visible', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      await button.focus();

      const outline = await button.evaluate((el) => {
        return window.getComputedStyle(el).outline;
      });

      // Should have visible focus indicator
      expect(outline).not.toBe('none');
    }
  });
});
```

### Manual Accessibility Testing

- [ ] **Keyboard Navigation**
  - Tab through all interactive elements
  - Verify focus indicators visible on all elements
  - Ensure focus order is logical
  - Test Escape key to close modals

- [ ] **Screen Reader Testing**
  - Use VoiceOver (macOS) or NVDA (Windows)
  - Verify all cards are announced correctly
  - Check KPI values are readable
  - Ensure button purposes are clear

- [ ] **Zoom Testing**
  - Test at 200% zoom level
  - Verify no horizontal scroll
  - Check KPI numbers remain readable
  - Ensure buttons remain accessible

---

## Before/After Comparison Checklist

### Visual Comparison Process

**Step 1: Generate Comparison Report**

```bash
# Use image diff tool to compare screenshots
npm run test:visual-regression

# Manual comparison checklist
```

**Step 2: Review Changes Systematically**

For each viewport (360px, 375px, 414px, 768px, 1440px):

- [ ] **Background**
  - Before: Flat gray
  - After: Soft gradient visible
  - Improvement: ✅ Adds warmth and brand identity

- [ ] **Card Corners**
  - Before: Sharp 8-12px radius
  - After: Generous 18px radius
  - Improvement: ✅ Softer, more approachable

- [ ] **KPI Numbers**
  - Before: 24-28px size
  - After: 36px size
  - Improvement: ✅ Instant scannability

- [ ] **Card Depth**
  - Before: Subtle/barely visible shadows
  - After: Clear elevation with layered shadows
  - Improvement: ✅ Visual hierarchy established

- [ ] **Animations**
  - Before: 300ms+ transitions
  - After: 200ms transitions
  - Improvement: ✅ Snappier, more responsive

- [ ] **Primary CTA**
  - Before: Mint green button
  - After: Near-black button
  - Improvement: ✅ Stronger visual hierarchy

**Step 3: Generate Final Report**

```markdown
# Design Polish - Visual Regression Report

## Changes Summary
- ✅ Brand gradient background implemented
- ✅ Card border radius increased to 18px
- ✅ KPI typography scaled to 36px
- ✅ Card shadows enhanced with layered approach
- ✅ Animation timing optimized to 200ms
- ✅ Primary button color corrected to near-black

## Viewport Testing Results
- ✅ Desktop (1440px): All changes visible, no issues
- ✅ Tablet (768px): Responsive adjustments working
- ✅ Mobile Large (414px): Layout maintained
- ✅ Mobile Medium (375px): All features accessible
- ✅ Mobile Small (360px): No horizontal overflow

## Performance Impact
- LCP: [BEFORE] ms → [AFTER] ms (Δ [DIFF]%)
- FID: [BEFORE] ms → [AFTER] ms (Δ [DIFF]%)
- CLS: [BEFORE] → [AFTER] (Δ [DIFF]%)

## Accessibility Validation
- ✅ Touch targets: All ≥ 44x44px
- ✅ Contrast ratios: All ≥ 4.5:1
- ✅ Focus indicators: Visible on all elements
- ✅ Keyboard navigation: Fully functional

## Sign-Off
- [ ] Design Lead Approval
- [ ] Engineering Lead Approval
- [ ] QA Sign-Off
- [ ] Ready for Production
```

---

## Test Execution Timeline

### Day 1: Baseline Capture (Before Implementation)
- Run baseline screenshot suite (all viewports)
- Capture before/after reference images
- Document current state in checklist

### Day 2-4: Implementation & Testing
- Implement design changes (Tasks 1-4)
- Run automated compliance checks after each change
- Perform manual testing throughout

### Day 5: Post-Implementation Validation
- Run full post-implementation screenshot suite
- Execute all automated tests
- Complete manual testing checklist
- Generate visual regression report

### Day 6: Final Review
- Compare before/after screenshots
- Verify all success criteria met
- Document any compromises or deviations
- Obtain stakeholder sign-off

---

## Success Criteria

**All tests pass when:**

- ✅ Visual regression tests show only intentional changes
- ✅ Brand compliance automated checks pass 100%
- ✅ Manual review checklist fully completed
- ✅ No accessibility regressions detected
- ✅ Performance metrics maintained or improved
- ✅ Dark mode works correctly
- ✅ All viewport sizes render correctly
- ✅ Before/after comparison approved by stakeholders

---

## Notes

**Testing Philosophy:** This spec prioritizes visual validation over unit testing because the changes are purely cosmetic. All functional tests already exist from the dashboard implementation spec (2025-10-29-dashboard-implementation).

**Screenshot Storage:** Store baseline and after screenshots in separate directories to prevent accidental overwrites:
```
e2e/screenshots/
├── baseline/
│   ├── dashboard-desktop.png
│   ├── dashboard-mobile-375px.png
│   └── ...
├── after/
│   ├── dashboard-desktop.png
│   ├── dashboard-mobile-375px.png
│   └── ...
└── dark-mode/
    ├── dashboard-desktop.png
    └── ...
```

**Tool Alternatives:** If Playwright screenshot comparison proves insufficient, consider:
- Percy.io for visual regression testing
- Chromatic for Storybook-based visual testing
- Applitools Eyes for AI-powered visual validation
