# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-11-02-dashboard-design-polish/spec.md

> Created: 2025-11-02
> Version: 1.0.0

## Technical Requirements

### 1. Brand Gradient Background Implementation

**Current State:**
```tsx
// apps/web/app/(protected)/dashboard/page.tsx:40
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
```

**Target State:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-[#F8FBF6] via-[#E8F0F7] to-[#FFF9E8] dark:bg-gradient-to-br dark:from-[#1E1E1E] dark:via-[#1A1A1A] dark:to-[#1E1E1E]">
```

**Style Guide Reference:** `/context/style-guide.md` lines 13-16

**Rationale:** The soft multi-hue gradient creates warmth and approachability per brand guidelines, replacing the generic flat gray that creates a cold, corporate feel.

**Implementation Notes:**
- Use Tailwind's `bg-gradient-to-br` (135deg diagonal)
- Three color stops for smooth transitions
- Dark mode uses warmer #1E1E1E base (not pure black)
- Subtle gradient in dark mode (less pronounced than light mode)

---

### 2. Card Border Radius Enhancement

**Current State:** Cards use shadcn/ui default radius (~8-12px via `--radius` CSS variable)

**Target State:** All cards should use 18px border radius (midpoint of 16-20px range)

**Style Guide Reference:** `/context/style-guide.md` lines 124-125

**Approach Options:**

**Option A:** Global Tailwind Config Update (Recommended)
```typescript
// apps/web/tailwind.config.ts
export default {
  theme: {
    extend: {
      borderRadius: {
        'card': '18px', // Generous, friendly radius
      },
    },
  },
}
```

**Option B:** Component-Level Classes
```tsx
// Replace all instances of rounded-lg with rounded-[18px]
<Card className="rounded-[18px]">
```

**Rationale:** Option A preferred for consistency and maintainability. Updating the global `--radius` CSS variable would affect all shadcn components uniformly.

**Implementation:**
1. Update `apps/web/tailwind.config.ts` to set custom radius value
2. OR update CSS variable `--radius: 18px` in globals.css
3. Visual regression test to verify all card corners updated

---

### 3. KPI Typography Scaling

**Current State:** Snapshot card KPI values appear ~24-28px

**Target State:** Minimum 32px (use Tailwind's `text-4xl` = 36px for comfortable size)

**Style Guide Reference:** `/context/style-guide.md` lines 62-64

**Implementation:**
```tsx
// apps/web/components/dashboard/SnapshotCard.tsx
// Find KPI value rendering (lines ~70-90)

// BEFORE
<div className="text-2xl font-semibold">{value}</div>

// AFTER
<div className="text-4xl font-semibold">{value}</div>
```

**Affected Components:**
- SnapshotCard: Total Contacts (44), Open Rate (65%), Response Rate (42%)

**Rationale:** Larger numbers create instant scannability and proper visual hierarchy for most important metrics. 36px provides comfortable reading at all distances and establishes clear dominance in card layout.

---

### 4. Card Shadow Elevation System

**Current State:** Card shadows very subtle or default shadcn values

**Target State:** Enhanced shadows matching style guide specification

**Style Guide Reference:** `/context/style-guide.md` lines 126-129

**Shadow Specifications:**
```css
/* Default State */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);

/* Hover State */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06);
```

**Implementation Approach:**

**Option A:** Tailwind Custom Utilities (Recommended)
```typescript
// apps/web/tailwind.config.ts
export default {
  theme: {
    extend: {
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
    },
  },
}
```

Usage:
```tsx
<Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
```

**Option B:** CSS Custom Properties
```css
/* apps/web/app/globals.css */
:root {
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06);
}
```

**Rationale:** Option A provides better type-safety and Tailwind IntelliSense support. Layered shadows (two values) create more natural depth than single shadow.

---

### 5. Animation Timing Standardization

**Current State:** Transitions use Tailwind defaults (300ms or unspecified)

**Target State:** All micro-interactions complete within 200ms

**Design Principle Reference:** `/context/design-principles.md` line 150

**Implementation:**
```tsx
// Global pattern for all interactive elements
className="transition-all duration-200 ease-in-out"

// Specific examples:
<Button className="... transition-all duration-200 ease-in-out">
<Card className="... transition-shadow duration-200 ease-in-out">
```

**Affected Components:**
- All Button components (hover states)
- All Card components (shadow transitions)
- Theme toggle
- Interactive icons

**Rationale:** 200ms strikes balance between imperceptible (too fast, under 100ms) and sluggish (over 250ms). `ease-in-out` provides natural acceleration/deceleration curve.

**Implementation Strategy:**
1. Create reusable Tailwind class composition
2. Apply systematically to all interactive elements
3. Performance test to verify sub-100ms perceived interaction time

---

### 6. Primary Button Color Correction

**Current State:** Quick Add button uses mint green background

**Target State:** Near-black background (#0A0A0A) per style guide

**Style Guide Reference:** `/context/style-guide.md` line 150

**Implementation:**
```tsx
// apps/web/components/dashboard/QuickAddCard.tsx

// BEFORE
<Button className="w-full bg-primary ...">
  Quick Add Contact
</Button>

// AFTER
<Button className="w-full bg-[#0A0A0A] text-white hover:bg-[#1A1A1A] ...">
  Quick Add Contact
</Button>
```

**Card Background Adjustment:**
```tsx
// Reduce card background intensity
// BEFORE
<Card className="bg-green-100 dark:bg-green-900/20 ...">

// AFTER
<Card className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 ...">
```

**Rationale:** Near-black buttons create stronger visual hierarchy and contrast. Reserve full green backgrounds for success states only. Border with mint green maintains brand connection without overwhelming card.

---

## Medium-Priority Technical Specifications

### 7. F-Pattern Layout Restructuring (Optional)

**Current Layout:** Quick Add (top-left), Snapshot (top-center), Notifications (top-right)

**Design Principle Reference:** `/context/design-principles.md` line 118

**Option A:** Swap Positions
```tsx
// Reverse Quick Add and Snapshot in grid order
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <SnapshotCard /> {/* Move to top-left */}
  <QuickAddCard /> {/* Move to top-center */}
  <NotificationsCard />
</div>
```

**Option B:** Full-Width KPI Banner
```tsx
<div className="space-y-6">
  {/* Dedicated KPI row */}
  <div className="grid grid-cols-3 gap-6">
    <KPICard metric="Total Contacts" value={44} />
    <KPICard metric="Open Rate" value="65%" />
    <KPICard metric="Response Rate" value="42%" />
  </div>

  {/* Standard card grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    ...
  </div>
</div>
```

**Recommendation:** Evaluate with user testing before implementing. Option B provides strongest KPI visibility but increases vertical scroll.

---

### 8-13. Medium-Priority Styling Updates

**Dark Mode Enhancement:**
```css
/* Update dark mode base color */
.dark {
  --background: #1E1E1E; /* Instead of #111827 */
  --foreground: #E0E0E0; /* Instead of #FFFFFF */
}

/* Desaturate accent colors */
.dark .bg-green-500 {
  @apply bg-green-600; /* Less intense */
}
```

**Typography Consistency Audit:**
- Verify all CardTitle components use `text-base font-semibold` (16px weight 600)
- Create `CardTitle` wrapper component if needed for enforcement

**Empty State CTA:**
```tsx
// apps/web/components/dashboard/GrowthCard.tsx
<div className="... text-center">
  <TrendingUp className="..." />
  <p>No growth data available</p>
  <Button
    variant="outline"
    className="mt-4"
    onClick={() => router.push('/contacts?action=create')}
  >
    <Plus className="mr-2" />
    Add Contact
  </Button>
</div>
```

---

## Implementation Dependencies

### None - All Self-Contained

This spec requires only:
- Existing Tailwind CSS configuration
- Existing shadcn/ui components
- No new external libraries
- No backend API changes
- No database migrations

---

## Performance Considerations

### Gradient Background

**Concern:** CSS gradients can impact paint performance on low-end devices

**Mitigation:**
- Use `will-change: background` only on interactive elements
- Test on iPhone SE and low-end Android devices
- Consider solid fallback for `prefers-reduced-motion`

### Shadow Rendering

**Concern:** Multiple box-shadows increase composite layer complexity

**Mitigation:**
- Use `transform: translateY(-2px)` on hover instead of shadow-only
- Limit cards per viewport to maintain 60fps
- Monitor Chrome DevTools Performance tab for paint warnings

---

## Browser Compatibility

All CSS features used have broad support:
- CSS Gradients: 95%+ browser support
- Custom box-shadow: Universal support
- Tailwind arbitrary values: Build-time transformation (universal)

**Target Browsers:**
- Chrome 90+ ✅
- Safari 14+ ✅
- Firefox 88+ ✅
- Edge 90+ ✅

---

## Rollback Strategy

If gradient or shadow changes impact performance:

1. **Immediate:** Revert to solid backgrounds with `bg-gray-50`
2. **Shadow Fallback:** Reduce to single shadow value
3. **Animation Disable:** Add `prefers-reduced-motion` query
4. **Gradual Rollout:** Apply changes to desktop-only first, monitor metrics

---

## Success Metrics

**Visual Compliance:**
- [ ] Brand gradient visible in light mode
- [ ] All card corners use 18px radius
- [ ] KPI numbers minimum 32px
- [ ] Card shadows visible and distinct
- [ ] Button colors match style guide

**Performance:**
- [ ] No paint warnings in Chrome DevTools
- [ ] Maintain <100ms First Input Delay
- [ ] CLS remains <0.1

**User Testing:**
- [ ] Warmth and approachability ratings increase
- [ ] Brand recognition improved vs. flat gray
- [ ] No usability regressions
