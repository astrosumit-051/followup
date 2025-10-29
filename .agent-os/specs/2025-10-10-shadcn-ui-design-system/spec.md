# Spec Requirements Document

> Spec: shadcn/ui Design System Implementation
> Created: 2025-10-10
> Status: Planning

## Overview

Establish a comprehensive design system for Cordiq using shadcn/ui component library to ensure consistent, accessible, and maintainable UI across the entire platform. This implementation will provide a solid foundation of reusable components before proceeding with Phase 2 AI features, reducing code duplication and ensuring WCAG 2.1 AA compliance throughout the application.

## User Stories

### Story 1: Developer Consistency and Productivity

As a frontend developer building new features for Cordiq, I want access to a comprehensive library of pre-built, accessible UI components, so that I can rapidly develop consistent interfaces without writing custom CSS or reinventing common patterns for every form, dialog, or card.

**Workflow:**
1. Developer starts implementing a new feature (e.g., AI email composer)
2. Checks component library for existing Button, Form, Dialog components
3. Imports shadcn components with TypeScript autocomplete
4. Configures component props without writing custom Tailwind classes
5. Component automatically adheres to design system tokens (colors, spacing, typography)
6. Dark mode support works out-of-the-box
7. Accessibility features (ARIA labels, keyboard navigation) built-in

**Problem Solved:** Eliminates 60% of custom CSS code, reduces development time from hours to minutes for standard UI patterns, prevents inconsistent styling across different developers' work.

### Story 2: Professional User Experience

As a professional user managing my networking contacts, I expect a polished, accessible interface with consistent visual language, smooth interactions, and dark mode support, so that I can use Cordiq comfortably in any environment and trust the platform for managing important business relationships.

**Workflow:**
1. User accesses Cordiq dashboard
2. Experiences consistent button styles, form inputs, and card layouts
3. Switches to dark mode for evening work sessions
4. All components seamlessly adapt to dark theme
5. Keyboard navigation works intuitively (Tab, Enter, Escape)
6. Screen readers provide clear context for all interactive elements
7. Visual feedback (loading states, hover effects) feels responsive

**Problem Solved:** Provides enterprise-grade user experience that matches expectations from professional SaaS products like Linear, Notion, or Vercel Dashboard.

### Story 3: Design System Scalability

As a product team scaling Cordiq from MVP to enterprise features, I want a token-based design system with semantic color variables and standardized component patterns, so that we can maintain visual consistency as we add calendar integrations, analytics dashboards, and AI-powered features without accumulating design debt.

**Workflow:**
1. Product designer defines new feature (e.g., analytics dashboard)
2. Refers to design system documentation for available components
3. Uses semantic tokens (--primary, --muted, --destructive) instead of hardcoded colors
4. New feature automatically inherits brand colors and spacing scale
5. Components work in both light and dark modes without extra configuration
6. Design updates propagate across entire app by changing token values
7. Team maintains single source of truth for UI patterns

**Problem Solved:** Prevents fragmentation as team grows, ensures brand consistency across all features, enables rapid prototyping with design system constraints, reduces QA burden for visual regression testing.

## Spec Scope

1. **shadcn/ui Initialization** - Initialize shadcn/ui in apps/web/ with design token configuration, establish three-tier token hierarchy (core → semantic → component), configure Tailwind CSS with CSS variable-based theming.

2. **Core Component Installation** - Install 20+ essential shadcn/ui components including Button, Input, Label, Textarea, Select, Form (with React Hook Form + Zod), Card, Badge, Avatar, Dialog, AlertDialog, Sheet, DropdownMenu, Popover, Skeleton, Progress, Toast, Table, Tabs, Separator.

3. **Contact Management Refactoring** - Refactor existing Contact CRUD components to use shadcn/ui: ContactForm (400 lines of manual Tailwind → shadcn Form primitives), ContactCard (custom styling → Card + Badge + Avatar), ContactDeleteDialog (basic modal → AlertDialog with proper accessibility).

4. **Authentication Pages Refactoring** - Convert login, signup, and password reset pages to shadcn/ui Form components with consistent validation feedback, loading states, and error handling.

5. **Dark Mode Implementation** - Integrate next-themes for dark mode toggle with persistence, ensure all shadcn components support dark mode via CSS variables, create ThemeProvider wrapper, add theme toggle button to navigation.

6. **Component Documentation** - Create comprehensive component usage guide with examples, establish coding standards for component composition, document design token usage, provide migration guide for converting custom components to shadcn patterns.

7. **Testing Infrastructure** - Set up React Testing Library tests for all components, implement jest-axe accessibility tests, create Playwright visual regression test suite, verify dark mode rendering across all pages.

## Out of Scope

- AI Email Composer components (covered in separate Phase 2 spec: 2025-10-10-langchain-ai-email-generation)
- Dashboard analytics visualization components (Phase 4 feature)
- Calendar integration UI components (Phase 4 feature)
- Email template library interface (Phase 2 feature, will use shadcn components once available)
- Advanced animation system (Phase 5 polish)
- Custom illustration library (future design sprint)
- Figma design system integration (post-MVP)

## Expected Deliverable

1. **All Existing Pages Use shadcn Components** - Contact list, contact detail, contact form, login, signup, dashboard pages fully converted to shadcn/ui with zero manual Tailwind classes on form elements or interactive components.

2. **Design System Documentation Complete** - Comprehensive guide covering component usage, design token reference, dark mode implementation, accessibility best practices, and migration patterns for future features.

3. **Dark Mode Fully Functional** - Theme toggle button in navigation, theme persistence across sessions, all pages and components render correctly in both light and dark modes, no visual artifacts or contrast issues.

4. **Accessibility Tests Passing** - 100% jest-axe tests passing across all components, keyboard navigation verified for all interactive elements, ARIA labels and roles properly implemented, WCAG 2.1 AA compliance achieved.

5. **Visual Regression Suite Established** - Playwright screenshot tests for all major pages in both light and dark modes, automated regression detection on PR builds, baseline images committed to repository for comparison.

## Spec Documentation

- Tasks: @.agent-os/specs/2025-10-10-shadcn-ui-design-system/tasks.md
- Technical Specification: @.agent-os/specs/2025-10-10-shadcn-ui-design-system/sub-specs/technical-spec.md
- Tests Specification: @.agent-os/specs/2025-10-10-shadcn-ui-design-system/sub-specs/tests.md
