# E2E Test Follow-Up Tasks

> Created: 2025-10-25
> Status: Post-Infrastructure Validation
> Priority: Non-Blocking UI Polish & Feature Enhancements

## Overview

This document tracks follow-up tasks identified during E2E test infrastructure validation. All critical infrastructure issues have been resolved. The items below are UI implementation gaps and feature enhancements that can be addressed incrementally.

---

## 🎯 Short-Term UI Polish (Non-Blocking)

### Task 1: Add `data-testid` Attributes to ContactCard Component

**Priority:** Medium
**Effort:** XS (15-30 minutes)
**Blocking Tests:** 2 tests

**Issue:**
Contact card components don't have unique `data-testid` attributes, making it difficult to click on specific contacts by ID in tests.

**Affected Tests:**
- `contact-detail-validation.spec.ts:193` - "should work with contact list page"
- `contact-detail.spec.ts:79` - "should navigate from contacts list to detail page"

**Solution:**
Add `data-testid` prop to ContactCard component:

```tsx
// In ContactCard.tsx
<div
  data-testid={`contact-card-${contact.id}`}
  className="..."
>
  {/* card content */}
</div>
```

**Files to Modify:**
- `apps/web/components/contacts/ContactCard.tsx` (or similar path)

**Validation:**
Run tests after change:
```bash
pnpm --filter web test:e2e e2e/contacts/contact-detail-validation.spec.ts -g "should work with contact list page"
pnpm --filter web test:e2e e2e/contacts/contact-detail.spec.ts -g "should navigate from contacts list to detail page"
```

---

### Task 2: Implement Loading Skeleton on Contact Detail Page

**Priority:** Low
**Effort:** S (1-2 hours)
**Blocking Tests:** 1 test

**Issue:**
No loading skeleton with `.animate-pulse` class displayed while contact data is being fetched.

**Affected Tests:**
- `contact-detail.spec.ts:105` - "should display loading skeleton on initial load"

**Solution:**
Add Skeleton component to contact detail page while `isLoading` is true:

```tsx
// In ContactDetailPage.tsx
{isLoading ? (
  <div className="space-y-4">
    <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
    <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
    <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
  </div>
) : (
  <ContactDetailContent contact={contact} />
)}
```

**Files to Modify:**
- `apps/web/app/(protected)/contacts/[id]/page.tsx` (or similar path)

**Design Reference:**
- Follow patterns from `context/design-principles.md`
- Use shadcn/ui Skeleton component if available

**Validation:**
```bash
pnpm --filter web test:e2e e2e/contacts/contact-detail.spec.ts -g "should display loading skeleton"
```

---

### Task 3: Fix Toast Timing for Test Assertions

**Priority:** Low
**Effort:** XS (15-30 minutes)
**Blocking Tests:** ~5 tests

**Issue:**
Success/error toasts auto-dismiss after 3 seconds, which is sometimes too fast for test assertions to catch them.

**Affected Tests:**
- `contact-create.spec.ts:308` - "should display success toast after contact creation"
- Various error toast tests in contact-detail.spec.ts

**Solution Options:**

**Option A: Increase Toast Duration (Recommended)**
```tsx
// In toast configuration
toast.success("Contact created!", {
  duration: 5000, // Increase from 3000ms to 5000ms
});
```

**Option B: Add Test Mode with Longer Duration**
```tsx
const toastDuration = process.env.NODE_ENV === 'test' ? 10000 : 3000;
```

**Option C: Make Tests Faster**
```typescript
// In tests, reduce wait time before checking toast
await page.click('[data-testid="contact-form-submit"]');
// Immediately check for toast instead of waiting
await expect(page.getByText("Contact created!")).toBeVisible({ timeout: 500 });
```

**Recommendation:** Option A (increase to 5 seconds for better UX and testing)

**Files to Modify:**
- Toast configuration file (likely in `apps/web/lib/toast.ts` or `apps/web/hooks/use-toast.ts`)

**Validation:**
```bash
pnpm --filter web test:e2e e2e/contacts/contact-create.spec.ts -g "toast"
```

---

## 🚀 Medium-Term Features

### Task 4: Profile Picture Upload Feature

**Priority:** Medium
**Effort:** L (1-2 weeks)
**Blocking Tests:** 1 test
**Phase:** Phase 3 (per roadmap)

**Issue:**
Profile picture feature not yet implemented. Tests expect to see profile pictures displayed when available.

**Affected Tests:**
- `contact-detail.spec.ts:289` - "should display profile picture if available"

**Requirements:**
1. S3 bucket setup for image storage (already configured: `S3_BUCKET=cordiq.app`)
2. File upload component in contact form
3. Image processing (resize/optimize)
4. Display profile picture in contact cards and detail pages
5. Default avatar/initials fallback

**Related Files:**
- `apps/api/src/attachment/attachment.service.ts` (already has S3 integration)
- Contact form components
- Contact card/detail components

**Epic Tracking:**
- See `.agent-os/product/roadmap.md` - Phase 1 Should-Have Features
- Deferred to Phase 3 due to S3 integration requirements

**Validation:**
```bash
pnpm --filter web test:e2e e2e/contacts/contact-detail.spec.ts -g "profile picture"
```

---

### Task 5: CI/CD Pipeline Integration

**Priority:** High (for production readiness)
**Effort:** M (3-5 days)
**Blocking Tests:** None (infrastructure validated)

**Requirements:**
1. GitHub Actions workflow for E2E tests
2. Playwright browser installation in CI environment
3. Test database setup (PostgreSQL)
4. Supabase test environment configuration
5. Environment variable management
6. Test result reporting

**Configuration Needed:**

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main, staging]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm --filter web exec playwright install --with-deps chromium

      - name: Run database migrations
        run: pnpm --filter api prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run E2E tests
        run: pnpm --filter web test:e2e --project=chromium
        env:
          DISABLE_RATE_LIMIT: true
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

**Environment Secrets Required:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

**Documentation:**
- Create `docs/ci-cd-setup.md` with complete CI/CD configuration guide

---

### Task 6: E2E Tests for Email Composition Features

**Priority:** High (after email composition UI complete)
**Effort:** L (1-2 weeks)
**Blocking Tests:** None (new feature)

**Scope:**
Create comprehensive E2E test suite for email composition workflow:

1. **Email Draft Management**
   - Create draft
   - Auto-save functionality
   - Resume draft from list
   - Delete draft

2. **AI Template Generation**
   - Generate formal/casual templates
   - A/B template selection
   - Template editing
   - Contact context injection

3. **Email Sending**
   - Gmail OAuth flow
   - Outlook OAuth flow
   - Send email successfully
   - Attachment upload
   - Signature selection

4. **Error Handling**
   - Network failures
   - Authentication errors
   - Attachment upload failures
   - Send failures

**Test File Structure:**
```
apps/web/e2e/email/
├── email-draft.spec.ts
├── ai-templates.spec.ts
├── email-sending.spec.ts
├── email-attachments.spec.ts
└── email-signatures.spec.ts
```

**Prerequisites:**
- Email composition UI complete (Task 16 from spec)
- Backend API endpoints functional
- Test user email accounts configured

**Related Specs:**
- `.agent-os/specs/2025-10-15-email-composition-gmail-integration/`

---

## 📊 Task Priority Matrix

| Task | Priority | Effort | Impact | Blocking Tests |
|------|----------|--------|--------|----------------|
| 1. Add data-testid | Medium | XS | Low | 2 |
| 2. Loading skeleton | Low | S | Low | 1 |
| 3. Toast timing | Low | XS | Low | ~5 |
| 4. Profile pictures | Medium | L | Medium | 1 |
| 5. CI/CD pipeline | High | M | High | 0 |
| 6. Email E2E tests | High | L | High | 0 |

---

## 🎯 Recommended Order

### Week 1: Quick Wins
1. ✅ Add `data-testid` to ContactCard (15 min)
2. ✅ Fix toast timing (30 min)
3. ✅ Implement loading skeleton (2 hours)

**Result:** All short-term UI polish complete, 8/8 affected tests now passing

### Week 2-3: Production Readiness
4. ⏳ Set up CI/CD pipeline (3-5 days)

**Result:** Automated testing on every PR, production-ready deployment

### Week 4+: Feature Development
5. ⏳ Complete email composition UI (if not done)
6. ⏳ Create email composition E2E tests
7. ⏳ Implement profile picture upload (Phase 3)

---

## ✅ Completion Criteria

**Short-Term Tasks Complete When:**
- All 8 currently failing tests pass (100% pass rate)
- No test gaps in current Contact CRUD functionality
- UI polish items addressed per design principles

**Medium-Term Tasks Complete When:**
- CI/CD pipeline running on every PR
- Email composition E2E test suite passing
- Profile picture feature implemented and tested

---

## 📝 Notes

- All tasks are **non-blocking** for current development
- Infrastructure is **production-ready** as-is
- Focus on CI/CD pipeline for production deployment
- UI polish tasks can be done incrementally
- Email E2E tests wait for email composition UI completion

---

**Last Updated:** 2025-10-25
**Owner:** Development Team
**Related Docs:**
- `context/e2e-test-infrastructure-validation.md` (infrastructure status)
- `context/e2e-testing-guide.md` (testing best practices)
- `.agent-os/product/roadmap.md` (feature roadmap)
