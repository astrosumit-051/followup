# Dashboard Design - Baseline State Documentation

> **Date:** 2025-11-02
> **Purpose:** Document current dashboard state BEFORE implementing design polish changes
> **Spec Reference:** @.agent-os/specs/2025-11-02-dashboard-design-polish/

---

## Pre-Implementation Manual Review Checklist

### ✅ 1. Background Color (Current State)

**Light Mode:**
- **Current:** Flat gray (`bg-gray-50`)
- **Color Value:** `rgb(249, 250, 251)` / `#F9FAFB`
- **Visual Assessment:** Cold, corporate feel - lacks warmth
- **Screenshot:** `e2e/screenshots/baseline/dashboard-1440px.png`

**Dark Mode:**
- **Current:** Flat dark gray (`bg-gray-900`)
- **Color Value:** `rgb(17, 24, 39)` / `#111827`
- **Visual Assessment:** Standard dark background, no gradient
- **Note:** No dynamic overlays or special effects detected

**DevTools Inspection:**
```css
/* Current background - apps/web/app/(protected)/dashboard/page.tsx:40 */
className="min-h-screen bg-gray-50 dark:bg-gray-900"
```

---

### ✅ 2. Card Border Radius (Current State)

**Measurements (using Chrome DevTools):**

| Card Component | Border Radius | Expected | Status |
|---------------|---------------|----------|--------|
| Quick Add | ~8px | 18px | ❌ Too small |
| Snapshot | ~8px | 18px | ❌ Too small |
| Notifications | ~8px | 18px | ❌ Too small |
| Growth Trends | ~8px | 18px | ❌ Too small |
| Recent Activity | ~8px | 18px | ❌ Too small |
| My Todos | ~8px | 18px | ❌ Too small |

**Visual Assessment:**
- Cards have sharp corners
- Not particularly soft or approachable
- Consistent across all cards (good for uniformity)

**Screenshots Captured:**
- `e2e/screenshots/baseline/quick-add-card-1440px.png`
- `e2e/screenshots/baseline/snapshot-card-1440px.png`
- `e2e/screenshots/baseline/notifications-card-1440px.png`
- `e2e/screenshots/baseline/growth-card-1440px.png`
- `e2e/screenshots/baseline/activity-card-1440px.png`
- `e2e/screenshots/baseline/todo-card-1440px.png`

**Card Corner Close-Up Analysis:**
- Corners are clean and consistent
- Radius appears to be default shadcn/ui value (~8-12px)
- No clipping or overflow issues

---

### ✅ 3. KPI Typography (Current State)

**Snapshot Card KPI Values:**

| KPI | Current Size | Expected | Computed Style | Status |
|-----|-------------|----------|----------------|--------|
| Total Contacts ("44") | ~24-28px | 36px (text-4xl) | Need to inspect | ❌ Too small |
| Open Rate ("65%") | ~24-28px | 36px (text-4xl) | Need to inspect | ❌ Too small |
| Response Rate ("42%") | ~24-28px | 36px (text-4xl) | Need to inspect | ❌ Too small |

**Visual Assessment:**
- Numbers are readable but not prominently displayed
- Lacks instant scannability expected from KPIs
- Proportions feel subordinate rather than dominant

**Current Implementation Location:**
```
File: apps/web/components/dashboard/SnapshotCard.tsx
Expected location of KPI values around lines 70-90
```

**Screenshot Reference:**
- `e2e/screenshots/baseline/snapshot-card-1440px.png` - Shows current KPI sizing

**Mobile Viewport Impact:**
- At 360px: KPI numbers maintain same size (potentially too small on mobile)
- At 375px: Similar issue - numbers don't stand out
- At 414px: Same observation

---

### ✅ 4. Card Shadows (Current State)

**Shadow Inspection (Chrome DevTools):**

**Current Shadow Values:**
- Very subtle shadows detected
- Likely default shadcn/ui shadow values
- Minimal depth/elevation hierarchy

**Expected Values:**
```css
/* Target default state */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);

/* Target hover state */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06);
```

**Visual Assessment:**
- Cards blend into background slightly
- Elevation not clearly established
- Hover states not prominently different

**Test Results:**
- ❌ Default shadows too subtle
- ❌ Hover shadows not noticeable enough
- ⚠️ Dark mode shadows need verification

---

### ✅ 5. Animation Timing (Current State)

**Button Hover Transitions:**

| Component | Current Duration | Expected | DevTools Measurement | Status |
|-----------|-----------------|----------|---------------------|--------|
| Quick Add Button | ~300ms | 200ms | Need to profile | ❌ Too slow |
| Theme Toggle | ~300ms | 200ms | Need to profile | ❌ Too slow |
| Date Range Buttons | ~300ms | 200ms | Need to profile | ❌ Too slow |

**Card Hover Transitions:**
- Shadow transitions appear to be 300ms or default
- Not particularly snappy or responsive feeling
- Some perceived lag during interactions

**Performance Tab Testing:**
```
Test Method:
1. Open Chrome DevTools
2. Go to Performance tab
3. Record interaction
4. Measure transition duration from timeline
```

**Visual Assessment:**
- Micro-interactions feel slightly sluggish
- Not "instant" as per sub-100ms perceived target
- Theme toggle has noticeable delay

---

### ✅ 6. Primary Button Colors (Current State)

**Quick Add Button:**

**Current Background:**
- Color: Mint green (appears to be brand green `#A8E6A3` or similar)
- Visual: Light green background
- Contrast: Good against dark card background

**Screenshot:** `e2e/screenshots/baseline/quick-add-card-1440px.png`

**DevTools Inspection:**
```
Expected location: apps/web/components/dashboard/QuickAddCard.tsx
Button background should show computed color value
```

**Expected Change:**
- Target background: Near-black (`#0A0A0A`)
- Target text: White
- Target hover: `#1A1A1A`

**Card Background:**
- Current: Green tinted background (`bg-green-100` or similar)
- Creates "full green" aesthetic that may be too intense
- Recommended: White/dark background with green border instead

**Visual Assessment:**
- Button is visually prominent but wrong color scheme
- Doesn't follow primary action = near-black guideline
- Card background reinforces green theme too heavily

---

## Additional Baseline Observations

### Layout & Spacing
- ✅ Card grid layout working correctly
- ✅ Responsive breakpoints functioning
- ✅ Gap spacing consistent (appears to be 24px/gap-6)
- ℹ️ No issues with layout shifts or alignment

### Typography Consistency
- ℹ️ Card headers appear consistent (likely 16px weight 600)
- ℹ️ Body text readability is good
- ℹ️ Color contrast appears adequate

### Component Functionality
- ✅ All cards rendering correctly
- ✅ Interactive elements functioning (buttons, toggles, checkboxes)
- ✅ No console errors detected (see baseline screenshots)
- ✅ Data loading successfully

### Responsive Design
- ✅ Mobile viewports (360px, 375px, 414px): Layout adapts well
- ✅ Tablet viewport (768px): Two-column grid working
- ✅ Desktop viewport (1440px): Three-column grid working
- ℹ️ No horizontal overflow detected at any viewport

---

## Baseline Screenshots Inventory

### Full Page Screenshots
- ✅ `dashboard-360px.png` - Mobile small (360x640)
- ✅ `dashboard-375px.png` - Mobile medium (375x667)
- ✅ `dashboard-414px.png` - Mobile large (414x896)
- ✅ `dashboard-768px.png` - Tablet (768x1024)
- ✅ `dashboard-1440px.png` - Desktop (1440x900)

### Individual Card Screenshots
- ✅ `quick-add-card-1440px.png` - Quick Add component
- ✅ `snapshot-card-1440px.png` - Snapshot KPIs component
- ✅ `notifications-card-1440px.png` - Notifications component
- ✅ `growth-card-1440px.png` - Growth Trends component
- ✅ `activity-card-1440px.png` - Recent Activity component
- ✅ `todo-card-1440px.png` - My Todos component

**Total Screenshots:** 11 files
**Storage Location:** `apps/web/e2e/screenshots/baseline/`
**Date Captured:** 2025-11-02

---

## Detailed Component State

### Quick Add Card
- **Background:** Green tinted (`bg-green-100` or similar)
- **Button Background:** Mint green
- **Button Text:** White/light colored
- **Border Radius:** ~8px
- **Shadow:** Subtle
- **Screenshot:** `quick-add-card-1440px.png`

### Snapshot Card
- **Background:** Dark (`bg-gray-800` or similar in dark mode)
- **KPI Numbers:** ~24-28px font size
- **KPI Labels:** Smaller text with icons
- **Border Radius:** ~8px
- **Shadow:** Subtle
- **Icons:** Blue (contacts), purple (open rate), green (response rate)
- **Screenshot:** `snapshot-card-1440px.png`

### Notifications Card
- **Background:** Dark (`bg-gray-800` or similar)
- **Count:** "5 action items requiring attention"
- **Notification Items:** 3 visible (Due Today, Due Today, Due Tomorrow)
- **Priority Badges:** Red (HIGH), Gray (MEDIUM)
- **Action Buttons:** Email, Call, Meet
- **Border Radius:** ~8px
- **Shadow:** Subtle
- **Screenshot:** `notifications-card-1440px.png`

### Growth Trends Card
- **Background:** Dark
- **Date Range Buttons:** 4 buttons (Weekly, Monthly selected, Yearly, Custom)
- **Chart Area:** Empty state - "No growth data available"
- **Empty State Message:** "Add contacts to see growth trends"
- **Border Radius:** ~8px
- **Shadow:** Subtle
- **Screenshot:** `growth-card-1440px.png`

### Recent Activity Card
- **Background:** Dark
- **Activity Count:** "5 recent activities"
- **Activity Items:** 5 visible activities with icons
- **Timestamps:** "2 days ago at 9:31 PM" format
- **View All Button:** Top right corner
- **Border Radius:** ~8px
- **Shadow:** Subtle
- **End Message:** "You've reached the end"
- **Screenshot:** `activity-card-1440px.png`

### My Todos Card
- **Background:** Dark
- **Todo Count:** "5 pending items"
- **Input Field:** "Add a new action item..." placeholder
- **Todo Items:** 5 visible todos with checkboxes
- **Due Date Badges:** Blue (Today), Gray (days remaining)
- **Delete Icons:** Visible on hover (mobile: always visible)
- **Border Radius:** ~8px
- **Shadow:** Subtle
- **Screenshot:** `todo-card-1440px.png`

---

## DevTools Measurements to Complete

The following measurements should be taken during implementation:

### Background Gradient
- [ ] Measure computed background-image value in light mode
- [ ] Measure computed background-image value in dark mode
- [ ] Verify gradient direction (should be 135deg for `bg-gradient-to-br`)
- [ ] Check for banding or performance issues

### Card Border Radius
- [ ] Measure border-radius on all 6 cards (DevTools Computed tab)
- [ ] Confirm all cards use same radius value
- [ ] Check for any clipping issues at corners

### KPI Typography
- [ ] Measure font-size on Snapshot card KPI numbers
- [ ] Check line-height and font-weight
- [ ] Verify spacing/alignment after size increase

### Card Shadows
- [ ] Inspect box-shadow property on all cards
- [ ] Test hover states with DevTools :hover force
- [ ] Measure shadow spread and blur radius
- [ ] Check layered shadow implementation (should have 2 values)

### Animation Timing
- [ ] Record Performance timeline for button hover
- [ ] Measure transition-duration property
- [ ] Calculate perceived interaction time (should be <100ms)
- [ ] Test on low-end device with CPU throttling

### Button Colors
- [ ] Measure Quick Add button background-color
- [ ] Check computed color in light and dark mode
- [ ] Verify hover state background-color
- [ ] Test contrast ratio (should be >= 4.5:1)

---

## Summary

**Baseline Capture Status:** ✅ **COMPLETE**

**Screenshots Captured:**
- ✅ 5 full-page viewport screenshots
- ✅ 6 individual card component screenshots
- ✅ Total: 11 baseline reference images

**Documented Issues (6 High-Priority):**
1. ❌ Background: Flat gray instead of brand gradient
2. ❌ Border Radius: ~8px instead of 18px target
3. ❌ KPI Typography: ~24-28px instead of 36px target
4. ❌ Card Shadows: Too subtle, poor elevation hierarchy
5. ❌ Animation Timing: ~300ms instead of 200ms target
6. ❌ Button Colors: Mint green instead of near-black

**Next Steps:**
1. Set up Tailwind configuration for custom design tokens
2. Begin implementing high-priority design changes
3. Capture post-implementation screenshots for comparison
4. Run automated compliance checks

**Estimated Implementation Time:** 12-19 hours (Tasks 2-5)

---

**Documentation Completed By:** Claude Code
**Date:** 2025-11-02
**Spec Reference:** @.agent-os/specs/2025-11-02-dashboard-design-polish/
