# Spec Requirements Document

> Spec: Dashboard Design Polish & Brand Compliance
> Created: 2025-11-02
> Status: Planning

## Overview

Polish the Cordiq dashboard to meet S-Tier SaaS design standards and full brand compliance by addressing 18 design issues identified in the comprehensive Task 18 design review. This spec focuses on visual refinements including brand gradient backgrounds, card styling (border radius, shadows), typography sizing for KPIs, animation timing optimization, and button color corrections to match the established style guide. All changes are frontend-only with no backend API modifications required.

## User Stories

### Professional User Across Devices

As a professional using Cordiq on both desktop and mobile devices, I want to see a polished, premium interface that reflects the "playful professionalism" and "warmth over corporate coldness" brand identity, so that the product feels distinctive and high-quality rather than generic.

**Current Problem:** Dashboard uses flat gray backgrounds and generic styling instead of the specified multi-hue gradient and brand-specific design tokens, creating a cold, corporate feel that doesn't match Cordiq's intended personality.

**Desired Outcome:** Dashboard showcases the unique Cordiq brand through soft gradient backgrounds, generous border radii, prominent KPI typography, and consistent styling that balances professionalism with approachability.

### Visual Design Enthusiast

As a user who appreciates attention to detail in product design, I want to experience smooth micro-interactions, proper visual hierarchy through shadows and spacing, and consistent component styling, so that every interaction feels intentional and polished.

**Current Problem:** Card shadows are too subtle to establish depth, animations exceed recommended timing, and button styling is inconsistent with style guide specifications.

**Desired Outcome:** Cards have clear elevation through enhanced shadows, all animations complete within 200ms for snappy interactions, and buttons use correct brand colors (near-black for primary actions).

### Mobile Power User

As a user primarily accessing Cordiq on mobile devices, I want KPI numbers large enough to scan instantly and a responsive layout that adapts intelligently to my screen size, so that I can quickly assess my networking status at a glance.

**Current Problem:** KPI numbers (44, 65%, 42%) are smaller than specified range (32-48px), reducing scannability and visual impact of the most important metrics.

**Desired Outcome:** KPI values are prominently displayed at minimum 32px size, creating clear visual hierarchy and instant scannability on all devices.

## Spec Scope

### High-Priority (Pre-Production Requirements)

1. **Brand Gradient Background** - Implement CSS gradient background using multi-hue palette (#F8FBF6 → #E8F0F7 → #FFF9E8) to replace flat gray (#bg-gray-50), creating warmth and brand differentiation
2. **Card Border Radius** - Increase all card border radii from current 8-12px to brand-specified 16-20px range for softer, more approachable feel
3. **KPI Typography Enhancement** - Enlarge Snapshot card KPI numbers (Total Contacts, Open Rate, Response Rate) from current ~24-28px to minimum 32px per style guide
4. **Card Shadow Elevation** - Enhance card shadows to match specification (0 2px 8px rgba(0,0,0,0.04) default, 0 4px 16px rgba(0,0,0,0.08) hover) for clearer depth hierarchy
5. **Animation Timing Optimization** - Reduce all transition durations from 300ms+ to 200ms target for snappier, sub-100ms perceived interactions
6. **Primary Button Color Correction** - Update Quick Add button background from mint green to near-black (#0A0A0A) per style guide primary action specification

### Medium-Priority (Next Sprint)

7. **F-Pattern Layout Optimization** - Evaluate repositioning Snapshot card to top-left quadrant for KPI visibility or restructuring to full-width KPI banner
8. **Strategic Brand Green Application** - Reduce Quick Add card background intensity and apply mint green strategically for success states only
9. **Typography Hierarchy Consistency** - Audit and standardize all card header typography to consistent 16px weight 600 (H3 specification)
10. **Dark Mode Background Adjustment** - Update dark mode from #bg-gray-900 to warmer #1E1E1E and desaturate accent colors by 10-15%
11. **Growth Trends Empty State CTA** - Add "Add Contact" button within empty state for actionable conversion
12. **Notification Badge Contrast Verification** - Test all status badges against backgrounds to ensure 3:1 minimum contrast ratio
13. **Responsive Placeholder Text** - Shorten desktop search placeholder or implement breakpoint-specific content

### Low-Priority (Future Iterations)

14. **Icon Style Standardization** - Convert all icons to consistent outline style (2px stroke) across dashboard
15. **Activity Feed End Messaging** - Update "You've reached the end" to more neutral "All activities displayed"
16. **Snapshot Icon Color Simplification** - Use single neutral gray for metric icons, reserving color for status only
17. **Mobile Spacing Differentiation** - Adjust gap spacing to use gap-3 mobile, md:gap-6 desktop (clearer 50-100% difference)
18. **Refresh Button Placement Validation** - Verify z-index management prevents overlap with third-party chat widgets

## Out of Scope

- Backend API modifications or data structure changes
- Database schema alterations
- New feature additions (focus on polishing existing dashboard)
- Dark mode comprehensive color contrast audit (future dedicated spec)
- Component library extraction (implement inline first, extract patterns later)
- Performance optimization beyond visual refinements
- Advanced interactions (drag-drop, custom layouts)
- Desktop-only improvements (maintain mobile-first approach)

## Expected Deliverable

### Visual Compliance

1. **Brand-Aligned Aesthetics** - Dashboard background uses multi-hue gradient creating warmth, all cards use 16-20px border radius, enhanced shadows establish clear visual hierarchy
2. **Typography Excellence** - All KPI numbers meet 32px minimum size, card headers consistently styled at 16px weight 600, readable hierarchy across all viewports
3. **Animation Fluidity** - All micro-interactions complete within 200ms, hover states provide immediate visual feedback, no perceived lag in interactions
4. **Color Consistency** - Primary buttons use near-black (#0A0A0A), brand green (#A8E6A3) applied strategically for success states, dark mode uses #1E1E1E base

### Technical Deliverables

5. **Updated Component Files** - dashboard/page.tsx with gradient background, card components with increased radius and shadows, button components with corrected colors
6. **Style System Enhancements** - CSS custom properties or Tailwind config updates for global token application, dark mode color adjustments
7. **Passing Test Suite** - Visual regression tests comparing before/after screenshots, manual design review verification checklist completed

### Documentation

8. **Design Compliance Report** - Verification checklist showing all 18 issues addressed, before/after screenshot comparisons, style guide alignment confirmation
9. **Implementation Notes** - Documented approach for gradient backgrounds, border radius token updates, typography scaling decisions for future reference

## Spec Documentation

- Technical Specification: @.agent-os/specs/2025-11-02-dashboard-design-polish/sub-specs/technical-spec.md
- Tests Specification: @.agent-os/specs/2025-11-02-dashboard-design-polish/sub-specs/tests.md
- Tasks: @.agent-os/specs/2025-11-02-dashboard-design-polish/tasks.md
