# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-10-10-shadcn-ui-design-system/spec.md

> Created: 2025-10-10
> Version: 1.0.0

## Test Coverage Strategy

**Target:** 100% coverage for new shadcn/ui component implementations and refactored components
**Focus:** Unit tests for component behavior, integration tests for form workflows, accessibility tests for WCAG 2.1 AA compliance, visual regression tests for design consistency

## Unit Tests

### 1. Button Component (`apps/web/components/ui/button.spec.tsx`)

**Test Coverage:**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  describe('Variants', () => {
    it('should render default variant');
    it('should render destructive variant with correct styles');
    it('should render outline variant with correct styles');
    it('should render secondary variant with correct styles');
    it('should render ghost variant with correct styles');
    it('should render link variant as clickable link');
  });

  describe('Sizes', () => {
    it('should render default size');
    it('should render sm size with correct dimensions');
    it('should render lg size with correct dimensions');
    it('should render icon size with square dimensions');
  });

  describe('Interactions', () => {
    it('should call onClick handler when clicked');
    it('should not call onClick when disabled');
    it('should show disabled styles when disabled prop is true');
    it('should support keyboard navigation (Enter and Space)');
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes');
    it('should be focusable by keyboard');
    it('should have visible focus indicator');
  });
});
```

---

### 2. Form Components (`apps/web/components/ui/form.spec.tsx`)

**Test Coverage:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

describe('Form Components', () => {
  describe('FormField with Input', () => {
    it('should render input field with label');
    it('should display validation error on blur with invalid value');
    it('should clear error when valid value entered');
    it('should show error message below input');
    it('should apply error styles to input when invalid');
  });

  describe('FormField with Select', () => {
    it('should render select with options');
    it('should update value when option selected');
    it('should display validation error for required select');
    it('should support keyboard navigation through options');
  });

  describe('FormField with Textarea', () => {
    it('should render textarea with correct rows');
    it('should validate character count if maxLength specified');
    it('should display remaining characters');
  });

  describe('Form Submission', () => {
    it('should call onSubmit with valid data');
    it('should prevent submission with validation errors');
    it('should display all errors on submit attempt');
    it('should focus first invalid field after submit');
  });

  describe('Accessibility', () => {
    it('should associate label with input via htmlFor');
    it('should announce errors to screen readers');
    it('should have aria-invalid on invalid fields');
    it('should have aria-describedby linking to error message');
  });
});
```

---

### 3. Card Component (`apps/web/components/ui/card.spec.tsx`)

**Test Coverage:**

```typescript
describe('Card Component', () => {
  describe('Structure', () => {
    it('should render card container with correct styles');
    it('should render CardHeader when provided');
    it('should render CardTitle with proper heading level');
    it('should render CardDescription with muted text');
    it('should render CardContent with proper padding');
    it('should render CardFooter with separator');
  });

  describe('Composition', () => {
    it('should render all sub-components together');
    it('should apply custom className to Card');
    it('should forward ref to card element');
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles via CSS variables');
    it('should have correct contrast ratio in dark mode');
  });
});
```

---

### 4. Dialog Component (`apps/web/components/ui/dialog.spec.tsx`)

**Test Coverage:**

```typescript
describe('Dialog Component', () => {
  describe('Open/Close Behavior', () => {
    it('should not render when open is false');
    it('should render when open is true');
    it('should call onOpenChange(false) when Escape pressed');
    it('should call onOpenChange(false) when backdrop clicked');
    it('should not close when clicking inside dialog');
  });

  describe('Focus Management', () => {
    it('should trap focus inside dialog when open');
    it('should return focus to trigger element on close');
    it('should focus first focusable element on open');
  });

  describe('Accessibility', () => {
    it('should have role="dialog"');
    it('should have aria-labelledby pointing to title');
    it('should have aria-describedby pointing to description');
    it('should prevent scroll on body when open');
  });

  describe('Animations', () => {
    it('should animate in when opening');
    it('should animate out when closing');
  });
});
```

---

## Integration Tests

### 1. ContactForm Integration (`apps/web/components/contacts/ContactForm.test.tsx`)

**Test Scenarios:**

```typescript
describe('ContactForm Integration', () => {
  it('should submit form with all valid fields', async () => {
    // 1. Render ContactForm
    // 2. Fill all required fields (name, email)
    // 3. Fill optional fields (phone, company, role, priority)
    // 4. Click submit button
    // 5. Verify onSubmit called with correct data
    // 6. Verify no validation errors displayed
  });

  it('should show validation errors for required fields', async () => {
    // 1. Render ContactForm
    // 2. Click submit without filling fields
    // 3. Verify error messages displayed for required fields
    // 4. Verify form not submitted
    // 5. Verify focus moved to first invalid field
  });

  it('should validate email format', async () => {
    // 1. Enter invalid email (e.g., "notanemail")
    // 2. Blur input
    // 3. Verify email format error displayed
    // 4. Correct email format
    // 5. Verify error cleared
  });

  it('should handle select dropdown interactions', async () => {
    // 1. Click priority select
    // 2. Verify options displayed (HIGH, MEDIUM, LOW)
    // 3. Select "HIGH" option
    // 4. Verify selected value displayed
    // 5. Submit form and verify priority included in data
  });

  it('should support keyboard navigation through form', async () => {
    // 1. Focus first input via Tab
    // 2. Tab through all fields
    // 3. Verify focus moves to each field in order
    // 4. Tab to submit button
    // 5. Press Enter to submit
  });

  it('should load existing contact data for editing', async () => {
    // 1. Render ContactForm with existing contact
    // 2. Verify all fields pre-populated with contact data
    // 3. Modify name field
    // 4. Submit form
    // 5. Verify onSubmit called with updated data
  });
});
```

---

### 2. ContactDeleteDialog Integration (`apps/web/components/contacts/ContactDeleteDialog.test.tsx`)

**Test Scenarios:**

```typescript
describe('ContactDeleteDialog Integration', () => {
  it('should open dialog when isOpen is true', async () => {
    // 1. Render ContactDeleteDialog with isOpen=true
    // 2. Verify dialog visible
    // 3. Verify contact name displayed in description
    // 4. Verify Cancel and Delete buttons present
  });

  it('should call onConfirm when Delete button clicked', async () => {
    // 1. Render dialog
    // 2. Click Delete button
    // 3. Verify onConfirm called with contact.id
    // 4. Verify dialog closed (onClose called)
  });

  it('should call onClose when Cancel button clicked', async () => {
    // 1. Render dialog
    // 2. Click Cancel button
    // 3. Verify onClose called
    // 4. Verify onConfirm not called
  });

  it('should close dialog when Escape key pressed', async () => {
    // 1. Render dialog
    // 2. Press Escape key
    // 3. Verify onClose called
  });

  it('should close dialog when clicking backdrop', async () => {
    // 1. Render dialog
    // 2. Click outside dialog content
    // 3. Verify onClose called
  });
});
```

---

### 3. Theme Toggle Integration (`apps/web/components/theme-toggle.test.tsx`)

**Test Scenarios:**

```typescript
describe('ThemeToggle Integration', () => {
  it('should render theme toggle button', async () => {
    // 1. Render ThemeToggle
    // 2. Verify button with Sun/Moon icon displayed
    // 3. Verify button has accessible label
  });

  it('should show theme menu when button clicked', async () => {
    // 1. Click theme toggle button
    // 2. Verify dropdown menu opens
    // 3. Verify Light, Dark, System options displayed
  });

  it('should switch to dark mode when Dark option clicked', async () => {
    // 1. Open theme menu
    // 2. Click "Dark" option
    // 3. Verify dark class added to html element
    // 4. Verify theme persisted to localStorage
  });

  it('should switch to light mode when Light option clicked', async () => {
    // 1. Set initial theme to dark
    // 2. Open theme menu
    // 3. Click "Light" option
    // 4. Verify dark class removed from html element
  });

  it('should use system preference when System option clicked', async () => {
    // 1. Mock prefers-color-scheme: dark
    // 2. Click "System" option
    // 3. Verify dark class added
    // 4. Change mock to prefers-color-scheme: light
    // 5. Verify dark class removed
  });
});
```

---

## Accessibility Tests

### 1. Component Accessibility Tests (`apps/web/__tests__/accessibility/components.a11y.test.tsx`)

**Test Coverage using jest-axe:**

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Button Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click Me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for icon-only button', async () => {
      const { container } = render(
        <Button size="icon" aria-label="Delete">
          <TrashIcon />
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Accessibility', () => {
    it('should have no violations for input with label', async () => {
      const { container } = render(
        <div>
          <label htmlFor="name">Name</label>
          <Input id="name" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when showing error', async () => {
      const { container } = render(
        <div>
          <label htmlFor="email">Email</label>
          <Input id="email" aria-invalid="true" aria-describedby="email-error" />
          <span id="email-error">Invalid email format</span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dialog Accessibility', () => {
    it('should have no violations when dialog open', async () => {
      const { container } = render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <p>Dialog content</p>
          </DialogContent>
        </Dialog>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
```

---

### 2. Keyboard Navigation Tests (`apps/web/__tests__/accessibility/keyboard-nav.test.tsx`)

**Test Coverage:**

```typescript
describe('Keyboard Navigation', () => {
  describe('Form Navigation', () => {
    it('should allow Tab navigation through all form fields');
    it('should allow Shift+Tab to navigate backwards');
    it('should trap focus inside modal dialogs');
    it('should return focus to trigger after dialog close');
  });

  describe('Button Interactions', () => {
    it('should trigger onClick on Enter key');
    it('should trigger onClick on Space key');
    it('should not trigger onClick when button disabled');
  });

  describe('Select Interactions', () => {
    it('should open dropdown on Enter or Space');
    it('should navigate options with Arrow keys');
    it('should select option on Enter');
    it('should close dropdown on Escape');
  });

  describe('Dialog Interactions', () => {
    it('should close dialog on Escape key');
    it('should prevent Escape when dialog has unsaved changes');
    it('should focus first interactive element on open');
  });
});
```

---

### 3. Color Contrast Tests (`apps/web/__tests__/accessibility/color-contrast.test.tsx`)

**Test Coverage:**

```typescript
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

describe('Color Contrast (WCAG 2.1 AA)', () => {
  describe('Light Mode', () => {
    it('should meet 4.5:1 contrast for normal text');
    it('should meet 3:1 contrast for large text');
    it('should meet 3:1 contrast for UI components');
  });

  describe('Dark Mode', () => {
    it('should meet 4.5:1 contrast for normal text in dark mode');
    it('should meet 3:1 contrast for large text in dark mode');
    it('should meet 3:1 contrast for UI components in dark mode');
  });

  describe('Button Variants', () => {
    it('should meet contrast requirements for default button');
    it('should meet contrast requirements for destructive button');
    it('should meet contrast requirements for outline button');
    it('should meet contrast requirements for ghost button');
  });

  describe('Badge Variants', () => {
    it('should meet contrast requirements for default badge');
    it('should meet contrast requirements for destructive badge');
    it('should meet contrast requirements for secondary badge');
  });
});
```

---

## Visual Regression Tests

### 1. Component Screenshots (`apps/web/e2e/visual-regression/components.spec.ts`)

**Test Scenarios with Playwright:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test('Button variants - Light mode', async ({ page }) => {
    await page.goto('/storybook/button');
    await expect(page).toHaveScreenshot('button-variants-light.png');
  });

  test('Button variants - Dark mode', async ({ page }) => {
    await page.goto('/storybook/button');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page).toHaveScreenshot('button-variants-dark.png');
  });

  test('Form components - Light mode', async ({ page }) => {
    await page.goto('/storybook/form');
    await expect(page).toHaveScreenshot('form-components-light.png');
  });

  test('Form components with errors - Light mode', async ({ page }) => {
    await page.goto('/storybook/form');
    await page.click('button[type="submit"]'); // Trigger validation
    await expect(page).toHaveScreenshot('form-errors-light.png');
  });

  test('Card component - Light mode', async ({ page }) => {
    await page.goto('/storybook/card');
    await expect(page).toHaveScreenshot('card-light.png');
  });

  test('Card component - Dark mode', async ({ page }) => {
    await page.goto('/storybook/card');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page).toHaveScreenshot('card-dark.png');
  });

  test('Dialog - Open state - Light mode', async ({ page }) => {
    await page.goto('/storybook/dialog');
    await page.click('button:has-text("Open Dialog")');
    await expect(page).toHaveScreenshot('dialog-open-light.png');
  });
});
```

---

### 2. Page Screenshots (`apps/web/e2e/visual-regression/pages.spec.ts`)

**Test Scenarios:**

```typescript
test.describe('Page Visual Regression', () => {
  test('Contact List - Light mode', async ({ page }) => {
    await page.goto('/contacts');
    await expect(page).toHaveScreenshot('contact-list-light.png', { fullPage: true });
  });

  test('Contact List - Dark mode', async ({ page }) => {
    await page.goto('/contacts');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page).toHaveScreenshot('contact-list-dark.png', { fullPage: true });
  });

  test('Contact Form - Create mode - Light mode', async ({ page }) => {
    await page.goto('/contacts/new');
    await expect(page).toHaveScreenshot('contact-form-create-light.png', { fullPage: true });
  });

  test('Contact Form - Edit mode - Light mode', async ({ page }) => {
    await page.goto('/contacts/1/edit');
    await expect(page).toHaveScreenshot('contact-form-edit-light.png', { fullPage: true });
  });

  test('Login Page - Light mode', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveScreenshot('login-light.png');
  });

  test('Signup Page - Light mode', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveScreenshot('signup-light.png');
  });

  test('Dashboard - Light mode', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard-light.png', { fullPage: true });
  });

  test('Dashboard - Dark mode', async ({ page }) => {
    await page.goto('/dashboard');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page).toHaveScreenshot('dashboard-dark.png', { fullPage: true });
  });
});
```

---

### 3. Responsive Screenshots (`apps/web/e2e/visual-regression/responsive.spec.ts`)

**Test Scenarios:**

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

test.describe('Responsive Visual Regression', () => {
  viewports.forEach(({ name, width, height }) => {
    test(`Contact List - ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/contacts');
      await expect(page).toHaveScreenshot(`contact-list-${name}.png`, { fullPage: true });
    });

    test(`Contact Form - ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/contacts/new');
      await expect(page).toHaveScreenshot(`contact-form-${name}.png`, { fullPage: true });
    });
  });
});
```

---

## Test Data Management

### Fixtures (`apps/web/__tests__/fixtures/`)

**components.fixture.ts:**
```typescript
export const mockContact = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 555-0123',
  linkedin: 'https://linkedin.com/in/johndoe',
  company: 'Tech Corp',
  industry: 'Technology',
  role: 'Software Engineer',
  priority: 'HIGH' as const,
  notes: 'Met at TechConf 2025',
};

export const mockContactFormData = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: '+1 555-0124',
  priority: 'MEDIUM' as const,
};
```

---

## Coverage Requirements

### Minimum Coverage Targets

- **Unit Tests:** 100% coverage for all shadcn/ui components
- **Integration Tests:** 90% coverage for refactored components (ContactForm, ContactCard, etc.)
- **Accessibility Tests:** 100% jest-axe passing across all interactive components
- **Visual Regression:** Baseline screenshots for all pages and components in light/dark modes

### Coverage Report

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

**Expected Output:**
```
File                                      % Stmts   % Branch   % Funcs   % Lines
apps/web/components/ui/*.tsx                100.0      100.0     100.0     100.0
apps/web/components/contacts/*.tsx           95.0       90.0      95.0      95.0
apps/web/components/theme-toggle.tsx        100.0      100.0     100.0     100.0
-----------------------------------------|---------|----------|---------|--------
All files                                    97.5       95.0      97.5      97.5
```

---

## Continuous Testing

### Pre-commit Hook (Husky)

```bash
#!/bin/sh
# Run unit tests before commit
pnpm test --bail --findRelatedTests $STAGED_FILES

# Run accessibility tests
pnpm test:a11y
```

### CI/CD Pipeline (GitHub Actions)

```yaml
name: shadcn/ui Component Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: pnpm install
      - run: pnpm test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
      - name: Run accessibility tests
        run: pnpm test:a11y
      - name: Run visual regression tests
        run: pnpm test:visual
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```
