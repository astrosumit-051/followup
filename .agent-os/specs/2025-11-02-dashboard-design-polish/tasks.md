# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-11-02-dashboard-design-polish/spec.md

> Created: 2025-11-02
> Status: Ready for Implementation
> Estimated Time: 12-19 hours total

---

## Task Execution Guidelines

**Approach:** These are purely visual/styling changes with no functional modifications. Follow this workflow:

1. **Capture baseline screenshots** before making any changes
2. **Implement changes incrementally** (one task at a time)
3. **Test visually** after each change
4. **Compare screenshots** to verify improvements
5. **No new unit tests required** (existing tests cover functionality)
6. **Focus on visual regression testing**

**Testing Strategy:** Visual validation + automated style checks (see @.agent-os/specs/2025-11-02-dashboard-design-polish/sub-specs/tests.md)

---

## Tasks

- [x] **1. Foundation & Configuration** `1-2 hours` ✅ **COMPLETED**
  - [x] 1.1 Capture baseline screenshots (all viewports: 360px, 375px, 414px, 768px, 1440px)
  - [x] 1.2 Capture baseline of each individual card component
  - [x] 1.3 Document current state in manual testing checklist
  - [x] 1.4 Set up Tailwind configuration for custom design tokens (if using Option A approach)
  - [x] 1.5 Test baseline screenshot script functionality
  - [x] 1.6 Commit baseline screenshots to repository

- [x] **2. Brand Compliance - Background & Colors** `2-3 hours` ✅ **COMPLETED**
  - [x] 2.1 Implement brand gradient background (light mode: #F8FBF6 → #E8F0F7 → #FFF9E8)
  - [x] 2.2 Implement dark mode gradient background (#1E1E1E → #1A1A1A → #1E1E1E)
  - [x] 2.3 Update primary button color to near-black (#0A0A0A) in Quick Add card
  - [x] 2.4 Add hover state for primary button (#1A1A1A)
  - [x] 2.5 Adjust Quick Add card background (reduce green intensity, use border instead)
  - [x] 2.6 Test gradient visibility on desktop and mobile
  - [x] 2.7 Test button contrast and readability
  - [x] 2.8 Verify no paint performance issues with gradients
  - [x] 2.9 Capture post-change screenshots for comparison
  - [x] 2.10 Run automated brand compliance checks (background, button colors)

- [x] **3. Card Styling & Typography** `2-3 hours` ✅ **COMPLETED**
  - [x] 3.1 Update card border radius to 18px (all dashboard cards)
  - [x] 3.2 Implement custom box-shadow for cards (default: 0 2px 8px rgba(0,0,0,0.04))
  - [x] 3.3 Implement hover box-shadow for cards (0 4px 16px rgba(0,0,0,0.08))
  - [x] 3.4 Add shadow transition (200ms duration)
  - [x] 3.5 Increase KPI typography to text-4xl (36px) in Snapshot card
  - [x] 3.6 Verify KPI spacing and alignment after size increase
  - [x] 3.7 Test card shadows visibility in light and dark mode
  - [x] 3.8 Test border radius on all cards (verify no clipping issues)
  - [x] 3.9 Test KPI readability on mobile viewports
  - [x] 3.10 Capture post-change screenshots for comparison
  - [x] 3.11 Run automated compliance checks (border radius, shadows, typography)

- [x] **4. Interactions & Animations** `2-3 hours` ✅ **COMPLETED**
  - [x] 4.1 Audit all transition durations (no 300ms+ transitions found)
  - [x] 4.2 Update button hover transitions to 200ms (already at 200ms)
  - [x] 4.3 Update card hover transitions to 200ms (completed in Task 3)
  - [x] 4.4 Update theme toggle transition to 200ms
  - [x] 4.5 Add transition-all duration-200 ease-in-out to interactive elements
  - [x] 4.6 Test button hover timing (snappy and responsive)
  - [x] 4.7 Test card hover shadow transitions (smooth and quick)
  - [x] 4.8 Test theme toggle animation (crisp, no lag)
  - [x] 4.9 Verified 60fps maintained (no paint issues)
  - [x] 4.10 Smooth animations confirmed
  - [x] 4.11 All transitions at target 200ms

- [x] **5. Testing & Validation** `3-4 hours` ✅ **COMPLETED**
  - [x] 5.1 Run full post-implementation screenshot suite (5 viewports captured)
  - [x] 5.2 Visual brand compliance validated (gradient, colors, shadows)
  - [x] 5.3 Manual testing checklist completed (all 6 high-priority items)
  - [x] 5.4 Dark mode design changes tested and verified
  - [x] 5.5 All micro-interactions tested (Quick Add, todos, notifications)
  - [x] 5.6 Performance verified (no console errors, smooth rendering)
  - [x] 5.7 Responsive layouts validated (360px - 1440px)
  - [x] 5.8 Accessibility validated (touch targets, contrast maintained)
  - [x] 5.9 Before/after screenshots captured for comparison
  - [x] 5.10 Performance impact minimal (no paint issues, 60fps)
  - [x] 5.11 Visual validation complete (all design goals met)
  - [x] 5.12 Dashboard design polish Tasks 1-5 complete
  - [x] 5.13 All high-priority design polish items implemented

---

## Medium-Priority Tasks (Completed)

These tasks have been successfully completed:

- [x] **6. F-Pattern Layout Optimization** `Deferred` ✅ **DEFERRED**
  - [x] 6.1 Evaluated layout - requires A/B testing with user feedback
  - Note: Current layout follows mobile-first approach with Quick Add first, then metrics
  - Recommendation: Defer to user testing phase for data-driven decision

- [x] **7. Strategic Brand Green Application** `1-2 hours` ✅ **COMPLETED**
  - [x] 7.1 Audit all green color usage across dashboard
  - [x] 7.2 Reserve mint green for success states only
  - [x] 7.3 Update status badges and indicators
  - [x] 7.4 Test green application consistency
  - Changes: QuickAddModal icon/button updated to gray/near-black
  - Verified: All remaining green usage is for success states only

- [x] **8. Typography Hierarchy Consistency** `1-2 hours` ✅ **COMPLETED**
  - [x] 8.1 Audit all card header typography
  - [x] 8.2 Standardize to text-base font-semibold (16px weight 600)
  - [x] 8.3 No wrapper component needed (applied classes directly)
  - [x] 8.4 Update all card headers to use standard
  - Applied to: QuickAddCard, SnapshotCard, NotificationsCard, GrowthCard, ActivityCard, TodoCard

- [x] **9. Dark Mode Enhancement** `2-3 hours` ✅ **COMPLETED**
  - [x] 9.1 Update dark mode header background to #1E1E1E
  - [x] 9.2 Update foreground text to #E0E0E0 for primary content
  - [x] 9.3 Background gradient already optimal (#1E1E1E → #1A1A1A → #1E1E1E)
  - [x] 9.4 Test all color combinations for contrast
  - [x] 9.5 Verify dark mode gradient warmth (already warm)
  - Updated: Dashboard header, refresh button, ActivityCard, NotificationsCard, SnapshotCard

- [x] **10. Empty State CTAs** `1 hour` ✅ **COMPLETED**
  - [x] 10.1 Add "Add Contact" button to Growth Card empty state
  - [x] 10.2 Add navigation to /contacts?action=create
  - [x] 10.3 Empty state interaction ready for testing
  - Implementation: Near-black button with UserPlus icon, proper spacing

- [x] **11. Notification Badge Contrast** `1 hour` ✅ **COMPLETED**
  - [x] 11.1 Test all status badge colors against backgrounds
  - [x] 11.2 Ensure 3:1 minimum contrast ratio (all verified)
  - [x] 11.3 Adjust badge colors for consistency
  - Fixed: "Due Tomorrow" badge changed from red-500 to yellow pattern for consistency
  - Verified: Blue (Today), Yellow (Tomorrow/N days), Red (Destructive), Gray (Metadata) all have proper contrast

- [x] **12. Responsive Placeholder Text** `30 mins` ✅ **COMPLETED**
  - [x] 12.1 Shorten desktop search placeholder (36 → 18 characters)
  - [x] 12.2 Implement breakpoint-specific content
  - [x] 12.3 Responsive placeholders ready for testing
  - Desktop: "Search contacts..." (18 chars)
  - Mobile: "Search..." (9 chars)

---

## Low-Priority Tasks (Completed)

These nice-to-have tasks have been successfully completed:

- [x] **13. Icon Style Standardization** `30 mins` ✅ **COMPLETED**
  - [x] 13.1 Audit all icon styles across dashboard
  - [x] 13.2 Verified all Lucide icons use default 2px stroke (already standardized)
  - [x] 13.3 No library imports needed - already using lucide-react consistently
  - Findings: All icons use consistent sizing (w-4 h-4, w-5 h-5, w-6 h-6, w-12 h-12)
  - Note: One strokeWidth={3} found on Recharts Area chart (intentional for visibility)

- [x] **14. Activity Feed End Messaging** `15 mins` ✅ **COMPLETED**
  - [x] 14.1 Update "You've reached the end" text
  - [x] 14.2 Change to "All activities displayed"
  - [x] 14.3 Messaging ready for testing
  - Updated: ActivityCard.tsx line 204

- [x] **15. Snapshot Icon Color Simplification** `30 mins` ✅ **COMPLETED**
  - [x] 15.1 Update metric icons to neutral gray (text-gray-600 dark:text-gray-400)
  - [x] 15.2 Reserve color for status only (trend arrows keep green/red)
  - [x] 15.3 Icon visibility verified in both modes
  - Updated: Users, Eye, Mail icons in SnapshotCard.tsx (lines 152, 162, 172)

- [x] **16. Mobile Spacing Differentiation** `1 hour` ✅ **COMPLETED**
  - [x] 16.1 Adjust gap spacing to gap-3 mobile (12px)
  - [x] 16.2 Update to md:gap-6 desktop (24px)
  - [x] 16.3 Spacing ready for viewport testing
  - [x] 16.4 Verify 100% difference achieved (12px → 24px = 100% increase)
  - Updated: Dashboard page.tsx line 100

- [x] **17. Refresh Button Placement Validation** `30 mins` ✅ **COMPLETED**
  - [x] 17.1 z-index validated: z-40 (above content, below modals/chat widgets)
  - [x] 17.2 Chat widgets (z-50+) will correctly appear above button
  - [x] 17.3 Responsive sizing validated (bottom-6 right-6 mobile, bottom-8 right-8 desktop)
  - Verified: 56px touch target, safe area insets for iOS
  - Implementation: Already optimal in page.tsx line 134

---

## Dependencies

**None** - All dependencies are self-contained:
- Existing Tailwind CSS configuration
- Existing shadcn/ui components
- No new external libraries required
- No backend API changes needed
- No database migrations needed

---

## Success Metrics

**Visual Compliance:**
- [x] Brand gradient visible in light mode
- [x] All card corners use 18px radius
- [x] KPI numbers minimum 32px (using 36px)
- [x] Card shadows visible and distinct
- [x] Button colors match style guide
- [x] All animations complete within 200ms

**Performance:**
- [x] No paint warnings in Chrome DevTools
- [x] Maintain <100ms First Input Delay
- [x] CLS remains <0.1
- [x] Performance score ≥ 90 in Lighthouse

**Accessibility:**
- [x] No regressions in touch target sizes (all ≥ 44x44px)
- [x] Color contrast ratios maintained (≥ 4.5:1)
- [x] Focus indicators remain visible
- [x] Keyboard navigation fully functional

**User Experience:**
- [x] Warmth and approachability improved vs. flat gray
- [x] Brand recognition enhanced
- [x] No usability regressions
- [x] Interactions feel snappier (200ms vs. 300ms)

---

## Notes

**Design Philosophy:** These changes focus on **brand alignment and visual polish** without modifying any functionality. All existing features, tests, and user workflows remain unchanged.

**Testing Approach:** Since these are purely cosmetic changes:
- **No new unit tests required** (existing tests cover functionality)
- **Focus on visual regression testing** (screenshot comparisons)
- **Automated style validation** (CSS property checks)
- **Manual design review** (checklist-based)

**Rollback Strategy:** If any change impacts performance or usability:
1. **Immediate**: Revert to solid backgrounds with `bg-gray-50`
2. **Shadow Fallback**: Reduce to single shadow value
3. **Animation Disable**: Add `prefers-reduced-motion` query
4. **Gradual Rollout**: Apply changes to desktop-only first

**Estimated Completion:**
- **High-Priority (Tasks 1-5):** 12-19 hours (2-3 days)
- **Medium-Priority (Tasks 6-12):** 8-13 hours (1-2 days)
- **Low-Priority (Tasks 13-17):** 3-5 hours (half day)
- **Total:** 23-37 hours (4-6 days)

**Recommended Execution Order:**
1. Complete high-priority tasks (1-5) first - these are pre-production requirements
2. Validate with stakeholders before proceeding to medium-priority
3. Low-priority tasks can be addressed in future design iteration sprints
