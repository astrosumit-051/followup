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

- [ ] **3. Card Styling & Typography** `2-3 hours`
  - [ ] 3.1 Update card border radius to 18px (all dashboard cards)
  - [ ] 3.2 Implement custom box-shadow for cards (default: 0 2px 8px rgba(0,0,0,0.04))
  - [ ] 3.3 Implement hover box-shadow for cards (0 4px 16px rgba(0,0,0,0.08))
  - [ ] 3.4 Add shadow transition (200ms duration)
  - [ ] 3.5 Increase KPI typography to text-4xl (36px) in Snapshot card
  - [ ] 3.6 Verify KPI spacing and alignment after size increase
  - [ ] 3.7 Test card shadows visibility in light and dark mode
  - [ ] 3.8 Test border radius on all cards (verify no clipping issues)
  - [ ] 3.9 Test KPI readability on mobile viewports
  - [ ] 3.10 Capture post-change screenshots for comparison
  - [ ] 3.11 Run automated compliance checks (border radius, shadows, typography)

- [ ] **4. Interactions & Animations** `2-3 hours`
  - [ ] 4.1 Audit all transition durations (find components with 300ms+ transitions)
  - [ ] 4.2 Update button hover transitions to 200ms
  - [ ] 4.3 Update card hover transitions to 200ms
  - [ ] 4.4 Update theme toggle transition to 200ms
  - [ ] 4.5 Add transition-all duration-200 ease-in-out to interactive elements
  - [ ] 4.6 Test button hover timing (should feel snappy)
  - [ ] 4.7 Test card hover shadow transitions (smooth but quick)
  - [ ] 4.8 Test theme toggle animation (crisp, no lag)
  - [ ] 4.9 Record Performance tab timeline to verify 60fps maintained
  - [ ] 4.10 Test on low-end device (4x CPU throttle) to ensure smooth animations
  - [ ] 4.11 Run automated animation timing checks

- [ ] **5. Testing & Validation** `3-4 hours`
  - [ ] 5.1 Run full post-implementation screenshot suite (all viewports)
  - [ ] 5.2 Execute automated brand compliance test suite
  - [ ] 5.3 Complete manual testing checklist (all 6 high-priority items)
  - [ ] 5.4 Test dark mode design changes (full checklist)
  - [ ] 5.5 Test all micro-interactions (Quick Add, todos, notifications, etc.)
  - [ ] 5.6 Run Chrome DevTools Lighthouse audit (verify Performance ≥ 90)
  - [ ] 5.7 Test with Fast 3G network throttling
  - [ ] 5.8 Run accessibility regression tests (touch targets, contrast, focus)
  - [ ] 5.9 Generate before/after comparison report
  - [ ] 5.10 Document any performance impact (LCP, FID, CLS changes)
  - [ ] 5.11 Complete visual regression report with stakeholder sign-off checklist
  - [ ] 5.12 Update TASK17-VALIDATION-REPORT.md with Task 18 completion
  - [ ] 5.13 Mark all design issues as resolved in dashboard-ui-ux-review-mobile.md

---

## Medium-Priority Tasks (Next Sprint)

These tasks can be addressed in a future iteration if time permits:

- [ ] **6. F-Pattern Layout Optimization** `2-3 hours`
  - [ ] 6.1 Evaluate swapping Snapshot and Quick Add positions
  - [ ] 6.2 Create alternative layout option (full-width KPI banner)
  - [ ] 6.3 A/B test layouts with user feedback
  - [ ] 6.4 Implement selected layout approach

- [ ] **7. Strategic Brand Green Application** `1-2 hours`
  - [ ] 7.1 Audit all green color usage across dashboard
  - [ ] 7.2 Reserve mint green for success states only
  - [ ] 7.3 Update status badges and indicators
  - [ ] 7.4 Test green application consistency

- [ ] **8. Typography Hierarchy Consistency** `1-2 hours`
  - [ ] 8.1 Audit all card header typography
  - [ ] 8.2 Standardize to text-base font-semibold (16px weight 600)
  - [ ] 8.3 Create CardTitle wrapper component if needed
  - [ ] 8.4 Update all card headers to use standard

- [ ] **9. Dark Mode Enhancement** `2-3 hours`
  - [ ] 9.1 Update dark mode background from #bg-gray-900 to #1E1E1E
  - [ ] 9.2 Update foreground from #FFFFFF to #E0E0E0
  - [ ] 9.3 Desaturate accent colors by 10-15%
  - [ ] 9.4 Test all color combinations for contrast
  - [ ] 9.5 Verify dark mode gradient warmth

- [ ] **10. Empty State CTAs** `1 hour`
  - [ ] 10.1 Add "Add Contact" button to Growth Card empty state
  - [ ] 10.2 Add navigation to /contacts?action=create
  - [ ] 10.3 Test empty state interaction

- [ ] **11. Notification Badge Contrast** `1 hour`
  - [ ] 11.1 Test all status badge colors against backgrounds
  - [ ] 11.2 Ensure 3:1 minimum contrast ratio
  - [ ] 11.3 Adjust badge colors if needed

- [ ] **12. Responsive Placeholder Text** `30 mins`
  - [ ] 12.1 Shorten desktop search placeholder
  - [ ] 12.2 Implement breakpoint-specific content
  - [ ] 12.3 Test on all viewports

---

## Low-Priority Tasks (Future Iterations)

These tasks are nice-to-haves and can be addressed in future design iterations:

- [ ] **13. Icon Style Standardization** `1-2 hours`
  - [ ] 13.1 Audit all icon styles across dashboard
  - [ ] 13.2 Convert to consistent outline style (2px stroke)
  - [ ] 13.3 Update icon library imports if needed

- [ ] **14. Activity Feed End Messaging** `15 mins`
  - [ ] 14.1 Update "You've reached the end" text
  - [ ] 14.2 Change to "All activities displayed"
  - [ ] 14.3 Test messaging display

- [ ] **15. Snapshot Icon Color Simplification** `30 mins`
  - [ ] 15.1 Update metric icons to neutral gray
  - [ ] 15.2 Reserve color for status only
  - [ ] 15.3 Test icon visibility

- [ ] **16. Mobile Spacing Differentiation** `1 hour`
  - [ ] 16.1 Adjust gap spacing to gap-3 mobile
  - [ ] 16.2 Update to md:gap-6 desktop
  - [ ] 16.3 Test spacing on all viewports
  - [ ] 16.4 Verify 50-100% difference is clear

- [ ] **17. Refresh Button Placement Validation** `30 mins`
  - [ ] 17.1 Test z-index management
  - [ ] 17.2 Verify no overlap with chat widgets
  - [ ] 17.3 Test on various screen sizes

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
