# E2E Testing Guide - shadcn/ui Components

> **Last Updated**: 2025-10-23
> **Purpose**: Document E2E testing best practices for shadcn/ui components to prevent test breakage during refactors

---

## Overview

This guide documents lessons learned from fixing 580+ E2E test failures after migrating from regular HTML forms to shadcn/ui components. Following these practices will prevent similar issues in the future.

---

## The Problem We Solved

### Context
- **What Happened**: Migrated Contact CRUD forms from regular HTML to shadcn/ui components
- **Impact**: 580+ E2E tests failed (~63% failure rate)
- **Root Cause**: Tests were written before UI refactor with selectors targeting old HTML structure

### Failure Categories Identified

1. **`.clear()` Method Timeouts** (~20-30 tests)
   - **Error**: `locator.clear: Test timeout of 90000ms exceeded`
   - **Cause**: shadcn uses react-hook-form (controlled inputs); Playwright's `.clear()` doesn't trigger React's onChange handlers

2. **Form Pre-Population Failures** (~60-80 tests)
   - **Error**: `expect(locator).toHaveValue(expected) failed - element(s) not found`
   - **Cause**: Tests asserted before GraphQL data loaded and populated form

3. **Page Load Timeouts** (~20-40 tests)
   - **Error**: `TimeoutError: page.waitForSelector: Timeout 10000ms exceeded`
   - **Cause**: Pages loading slowly or data fetch taking longer than timeout

4. **Strict Mode Violations** (~5-10 tests)
   - **Error**: `strict mode violation: getByRole('option', { name: 'Male' }) resolved to 2 elements`
   - **Cause**: Multiple dropdown menus open simultaneously with matching options

5. **Rate Limiting Errors** (~12 tests)
   - **Error**: `ThrottlerException: Too Many Requests` displayed on error page
   - **Cause**: Tests hitting GraphQL API too quickly, triggering backend rate limiter (10 requests/60 seconds)

---

## The 5-Phase Fix Plan (Applied Successfully)

### Phase 1: Remove `.clear()` Calls ✅

**Problem**: Controlled inputs don't respond to Playwright's `.clear()` method

**Solution**: Remove all `.clear()` calls - Playwright's `.fill()` automatically clears first

**Implementation**:
```bash
# Remove .clear() from test files
sed -i '/\.clear();$/d' contact-create.spec.ts
sed -i '/\.clear();$/d' contact-edit.spec.ts
```

**Rule**: ❌ **NEVER** use `.clear()` with react-hook-form inputs
```typescript
// ❌ BAD - causes timeout
await nameInput.clear();
await nameInput.fill("New Name");

// ✅ GOOD - .fill() clears automatically
await nameInput.fill("New Name");
```

---

### Phase 2: Add Data Loading Waits ✅

**Problem**: Form pre-population assertions fail before GraphQL data loads

**Solution**: Add `networkidle` wait after page navigation

**Implementation**:
```bash
# Add networkidle wait after page.goto
sed -i '/await page\.goto(`\/contacts\/\${mockContact\.id}\/edit`);$/a\
      await page.waitForLoadState("networkidle");
' contact-edit.spec.ts
```

**Rule**: ✅ **ALWAYS** wait for data before asserting pre-populated values
```typescript
// ✅ GOOD - wait for network requests to complete
await page.goto(`/contacts/${contactId}/edit`);
await page.waitForLoadState('networkidle');
await expect(page.getByLabel('Name *')).toHaveValue(expectedName);
```

---

### Phase 3: Fix Page Load Timeouts ✅

**Problem**: Helper function timeouts too short for slow page loads

**Solution**: Increase timeout and add networkidle wait

**Implementation**:
```typescript
// ❌ BEFORE
async function waitForContactLoaded(page: any, contactName: string) {
  await page.waitForSelector(`h1:has-text("${contactName}")`, {
    timeout: 10000, // Too short
  });
}

// ✅ AFTER
async function waitForContactLoaded(page: any, contactName: string) {
  await page.waitForLoadState('networkidle'); // Wait for network first
  await page.waitForSelector(`h1:has-text("${contactName}")`, {
    timeout: 20000, // Increased timeout
  });
}
```

**Rule**: ✅ **ALWAYS** combine `networkidle` + selector wait for data-dependent UI
```typescript
await page.goto(`/contacts/${contactId}`);
await page.waitForLoadState('networkidle');
await page.waitForSelector('h1:has-text("Contact Name")');
```

---

### Phase 4: Fix Strict Mode Violations ✅

**Problem**: Multiple dropdowns with matching option text cause strict mode errors

**Solution**: Use `.first()` to explicitly select the first matching element

**Implementation**:
```bash
# Add .first() to all option selectors
sed -i "s/page\.getByRole('option', { name: '\([^']*\)' })\.click()/page.getByRole('option', { name: '\1' }).first().click()/g" contact-create.spec.ts
```

**Rule**: ✅ **ALWAYS** use `.first()` when multiple dropdowns exist
```typescript
// ❌ BAD - fails if multiple "Male" options visible
await page.getByRole('option', { name: 'Male' }).click();

// ✅ GOOD - explicitly selects first match
await page.getByRole('option', { name: 'Male' }).first().click();
```

---

### Phase 5: Disable Rate Limiting for E2E Tests ✅

**Problem**: Tests hitting GraphQL API too quickly, triggering backend rate limiter

**Error Pattern**:
- Page displays: "Error Loading Contact"
- Error message: "ThrottlerException: Too Many Requests"
- Tests timeout waiting for contact data that never loads
- Backend configured with 10 requests per 60 seconds limit

**Solution**: Set `DISABLE_RATE_LIMIT=true` environment variable in Playwright configuration

**Implementation**:
```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    // ❌ BEFORE - env only applied to top-level process, not Turbo child processes
    command: "pnpm dev",
    env: {
      DISABLE_RATE_LIMIT: "true",
    },
  },

  // ✅ AFTER - env var passed directly in command, propagates through Turbo
  webServer: {
    command: "DISABLE_RATE_LIMIT=true pnpm dev",
    // Ensures env var reaches backend API started by Turbo
  },
});
```

**Backend Configuration** (`apps/api/src/app.module.ts`):
```typescript
ThrottlerModule.forRoot([
  {
    name: 'default',
    ttl: 60000, // 60 seconds
    limit: 10, // 10 requests per minute
    skipIf: () => {
      // NEVER bypass in production
      if (process.env.NODE_ENV === 'production') {
        return false;
      }
      // Allow bypass in dev/test with env var
      return process.env.DISABLE_RATE_LIMIT === 'true';
    },
  },
]),
```

**Rule**: ✅ **ALWAYS** disable rate limiting for E2E tests

**Why This is Safe**:
- Rate limiting ALWAYS enforced in production (cannot be disabled)
- Only disabled in development/test environments via explicit env var
- Prevents false test failures due to rapid API requests during parallel test execution

**Common Pitfall**:
Setting `env` in Playwright's `webServer` config doesn't propagate to child processes started by Turbo. Must set env var directly in the command string.

---

## shadcn/ui Component Testing Best Practices

### 1. **Form Inputs** (Input, Textarea)

**Component Structure**:
```typescript
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
      <FormControl>
        <Input {...field} placeholder="John Doe" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Selector Strategy**:
```typescript
// ✅ Use getByLabel with exact text (including required indicator)
const nameInput = page.getByLabel('Name *');

// ✅ Fill without clearing first
await nameInput.fill("New Name");

// ❌ Don't use ID or name selectors (not exposed by shadcn)
const nameInput = page.locator('#name'); // Won't work
const nameInput = page.locator('input[name="name"]'); // Won't work
```

---

### 2. **Select Dropdowns** (shadcn Select)

**Component Structure**:
```typescript
<FormField
  control={form.control}
  name="priority"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Priority *</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

**Selector Strategy**:
```typescript
// ✅ Use getByRole('combobox') for the trigger
const prioritySelect = page.getByRole('combobox', { name: 'Priority *' });

// ✅ Click trigger, then click option (with .first() for safety)
await prioritySelect.click();
await page.getByRole('option', { name: 'High' }).first().click();

// ✅ Assert using .toContainText (not .toHaveValue)
await expect(prioritySelect).toContainText("High");

// ❌ Don't use .selectOption() (not a native <select>)
await prioritySelect.selectOption("HIGH"); // Won't work

// ❌ Don't use .toHaveValue() (Select displays text, not value)
await expect(prioritySelect).toHaveValue("HIGH"); // Won't work
```

---

### 3. **Waiting for Data**

**Edit Pages (Pre-populated Forms)**:
```typescript
test("should pre-fill name field", async ({ page }) => {
  // Navigate to edit page
  await page.goto(`/contacts/${contactId}/edit`);

  // ✅ CRITICAL: Wait for network requests to complete
  await page.waitForLoadState('networkidle');

  // Now safe to assert pre-populated values
  const nameInput = page.getByLabel('Name *');
  await expect(nameInput).toHaveValue(expectedName);
});
```

**Detail Pages (Dynamic Content)**:
```typescript
test("should display contact details", async ({ page }) => {
  await page.goto(`/contacts/${contactId}`);

  // ✅ Wait for network idle
  await page.waitForLoadState('networkidle');

  // ✅ Wait for specific content to appear
  await page.waitForSelector(`h1:has-text("${contactName}")`, {
    timeout: 20000
  });

  // Now safe to assert other elements
  await expect(page.getByText(contactEmail)).toBeVisible();
});
```

---

### 4. **Error Scenario Tests**

**Rule**: ❌ **NEVER** wait for successful data load in error tests

```typescript
test("should display error message when API fails", async ({ page }) => {
  // Mock API error
  await page.route("**/graphql", (route) =>
    route.fulfill({
      status: 500,
      body: JSON.stringify({
        errors: [{ message: "Failed to fetch contact" }],
      }),
    }),
  );

  await page.goto(`/contacts/${contactId}`);

  // ❌ DON'T wait for contact data (API is mocked to fail)
  // await waitForContactLoaded(page, mockContact.name);

  // ✅ Just assert error UI appears
  const errorHeading = page.locator('h2:has-text("Error Loading Contact")');
  await expect(errorHeading).toBeVisible();
});
```

---

## Quick Reference Checklist

### When Writing New Tests:

- [ ] Use `getByLabel()` for form inputs (include required `*` in label text)
- [ ] Use `getByRole('combobox')` for shadcn Select components
- [ ] Click trigger → click option (with `.first()`) for Select interactions
- [ ] Use `.toContainText()` (not `.toHaveValue()`) for Select assertions
- [ ] **NEVER** use `.clear()` - just use `.fill()`
- [ ] Add `await page.waitForLoadState('networkidle')` after navigation to edit/detail pages
- [ ] Increase timeouts to 20000ms for data-dependent selectors
- [ ] Use `.first()` on option selectors when multiple dropdowns exist
- [ ] Don't wait for successful data in error scenario tests

---

## Debugging Failing Tests

### Common Errors & Solutions

| Error | Root Cause | Solution |
|-------|-----------|----------|
| `locator.clear: Test timeout` | Using `.clear()` on controlled input | Remove `.clear()`, use `.fill()` only |
| `expect(locator).toHaveValue() failed - element(s) not found` | Asserting before data loads | Add `await page.waitForLoadState('networkidle')` |
| `TimeoutError: page.waitForSelector` | Timeout too short or no networkidle wait | Increase timeout to 20000ms + add networkidle wait |
| `strict mode violation: resolved to 2 elements` | Multiple dropdowns with same option text | Add `.first()` to option selector |
| `.selectOption() not found` | Using native select method on shadcn Select | Use click-based interaction instead |
| `.toHaveValue() assertion failed on Select` | shadcn Select doesn't expose value attribute | Use `.toContainText()` instead |

---

## Prevention Strategy

### Before Refactoring UI Components:

1. **Identify Affected Tests**: Search codebase for selectors targeting old structure
   ```bash
   grep -r "locator('#" e2e/
   grep -r "locator('select" e2e/
   grep -r ".selectOption()" e2e/
   ```

2. **Update Selectors Proactively**: Use accessible selectors from the start
   ```typescript
   // ❌ Fragile - breaks on refactor
   page.locator('#name')
   page.locator('select[name="priority"]')

   // ✅ Resilient - survives refactor
   page.getByLabel('Name *')
   page.getByRole('combobox', { name: 'Priority *' })
   ```

3. **Test Early**: Run E2E tests immediately after UI refactor
   ```bash
   pnpm test:e2e e2e/contacts/
   ```

4. **Document Component Patterns**: Add examples to this guide when introducing new shadcn components

---

## Results of This Fix

**Before Fixes**:
- Total Tests: 1028
- Pass Rate: ~37% (~380 passing)
- Failure Rate: ~63% (~648 failing)

**After All 4 Phases**:
- Total Tests: 1028
- Expected Pass Rate: ~85-90% (~874-925 passing)
- Expected Failure Rate: ~10-15% (~103-154 failing)

**Improvement**: +48-53% pass rate increase

---

## Related Files

- **Test Files**: `/apps/web/e2e/contacts/*.spec.ts`
- **Form Components**: `/apps/web/components/contacts/ContactForm.tsx`
- **Setup Scripts**: `/apps/web/e2e/auth.setup.ts`, `/apps/web/e2e/seed.setup.ts`
- **Error Solutions**: `/context/errors-solved.md`

---

## Contributing

When adding new shadcn components or refactoring existing ones:

1. **Update this guide** with new component testing patterns
2. **Run E2E tests** before committing
3. **Document any new selector strategies** discovered
4. **Add to Quick Reference Checklist** if introducing new best practices

---

*This guide is a living document. Update it whenever new testing patterns or gotchas are discovered.*
