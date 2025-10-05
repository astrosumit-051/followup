# S-Tier SaaS Dashboard Design Checklist (Enhanced Edition)

## I. Core Design Philosophy & Strategy

*   [ ] **Users First:** Prioritize user needs, workflows, and ease of use in every design decision.
*   [ ] **Warmth Over Corporate Coldness:** Create approachable interfaces that feel professional without being sterile. Professional doesn't mean cold—users respond better to interfaces that balance credibility with warmth.
*   [ ] **Meticulous Craft:** Aim for precision, polish, and high quality in every UI element and interaction.
*   [ ] **Speed & Performance (Sub-100ms Interactions):** Design for fast load times and snappy, responsive interactions. Target sub-100ms for every user interaction.
*   [ ] **Simplicity & Clarity:** Strive for a clean, uncluttered interface. Apply Tufte's data-ink maximization—remove everything that doesn't inform. Ensure labels, instructions, and information are unambiguous.
*   [ ] **Focus & Efficiency:** Help users achieve their goals quickly and with minimal friction. Minimize unnecessary steps or distractions.
*   [ ] **Consistency:** Maintain a uniform design language (colors, typography, components, patterns) across the entire dashboard.
*   [ ] **Accessibility (WCAG 2.2 Level AA):** Design for inclusivity from day one. Build accessibility into atoms rather than retrofitting—early integration costs 3-5x less than retrofitting.
*   [ ] **Opinionated Design (Thoughtful Defaults):** Establish clear, efficient default workflows and settings, reducing decision fatigue for users.
*   [ ] **Intelligence Over Automation:** Implement "AI as copilot, not autopilot"—maintain human control while leveraging computational power.
*   [ ] **Progressive Disclosure:** Use three-level hierarchy: overview, drill-down, deep dive. Show 5-10 primary items, hide complexity behind interaction.

## II. Design System Foundation (Tokens & Core Components)

### Token Architecture

*   [ ] **Implement Three-Tier Token Hierarchy:**
    *   [ ] **Core Tokens:** Define primitive values independent of context (color-blue-500, spacing-4)
    *   [ ] **Semantic Tokens:** Apply contextual meaning (color-primary, button-padding)
    *   [ ] **Component Tokens:** Provide granular control for specific elements (button-primary-background, input-border-error)
*   [ ] **Styling Hooks:** Use CSS custom properties for global updates without touching individual components (e.g., `radius-border-4`, `font-scale-4`)

### Color Palette

*   [ ] **Primary Brand Color:** User-specified, used strategically for actions and emphasis.
*   [ ] **Layered Card System:** Base gray layers support white modules that visually "pop" to group related content. Use subtle shadows for depth through elevation rather than harsh borders.
*   [ ] **Neutrals:** A scale of 5-7 grays for text, backgrounds, borders. Prefer softer canvas hues over stark white.
*   [ ] **Semantic Colors with Functional Assignment:**
    *   [ ] Success: Green
    *   [ ] Error/Destructive: Red/Orange
    *   [ ] Warning: Yellow/Amber
    *   [ ] Informational: Blue
    *   [ ] Neutral/Inactive: Gray
*   [ ] **Dynamic Color Theming (Material Design 3 Pattern):** Generate 13 tonal variations from single source color, ensuring WCAG-compliant contrast ratios mathematically.
*   [ ] **Dark Mode Implementation:**
    *   [ ] Avoid pure black (#000000)—use dark gray (#121212 or #1E1E1E)
    *   [ ] Use off-white for text (#E0E0E0) rather than pure white
    *   [ ] Desaturate colors (bright hues too intense on dark backgrounds)
    *   [ ] System preference detection via `prefers-color-scheme`
    *   [ ] Test on OLED and LCD screens in various lighting conditions
*   [ ] **Accessibility Checks:**
    *   [ ] Normal text: 4.5:1 contrast ratio minimum
    *   [ ] Large text & UI components: 3:1 contrast ratio minimum
    *   [ ] Never use color alone to convey meaning
    *   [ ] Limit categorical palettes to 5-7 distinct hues

### Typography

*   [ ] **Primary Font Family:** Clean, legible sans-serif (e.g., Inter, Manrope, system-ui for zero-latency)
*   [ ] **Modular Scale:** Define distinct sizes (H1: 32-48px for KPIs, H2, H3, H4, Body Large, Body Medium 14-16px, Body Small/Caption)
*   [ ] **Font Weights:** Limited set (Regular, Medium, SemiBold, Bold)
*   [ ] **Line Height:** Generous for readability (1.5-1.7 for body text)
*   [ ] **Font Performance:**
    *   [ ] Limit families to 2-3 maximum
    *   [ ] Use variable fonts when possible
    *   [ ] Implement `font-display: swap` for instant rendering
    *   [ ] Preload critical fonts
    *   [ ] Subset fonts to include only used characters

### Spacing & Layout

*   [ ] **Base Unit System:** Establish base unit (e.g., 8px)
*   [ ] **Spacing Scale:** Use multiples of base unit (4px, 8px, 12px, 16px, 24px, 32px, 48px)
*   [ ] **Strategic White Space:** Use ample negative space to improve clarity, reduce cognitive load, and create visual balance (LinkedIn 2024 pattern)
*   [ ] **Border Radii:** Small set of consistent values (Small: 4-6px for inputs/buttons; Medium: 8-12px for cards/modals)

### Core UI Components (Atomic Design Methodology)

*   [ ] **Develop components with consistent states:** default, hover, active, focus (2px outline, 3:1 contrast), disabled
*   [ ] **Atoms:**
    *   [ ] Buttons (primary, secondary, tertiary/ghost, destructive, link-style; with icon options)
    *   [ ] Input Fields (text, textarea, select, date picker; with clear labels, placeholders, helper text, error messages)
    *   [ ] Checkboxes & Radio Buttons
    *   [ ] Toggles/Switches
    *   [ ] Icons (single, modern, clean icon set; SVG preferred)
    *   [ ] Avatars
    *   [ ] Badges/Tags (for status indicators, categorization)
*   [ ] **Molecules:**
    *   [ ] Search bars
    *   [ ] Form fields with labels and validation
    *   [ ] Card headers with actions
*   [ ] **Organisms:**
    *   [ ] Cards (for content blocks, multimedia items, dashboard widgets)
    *   [ ] Tables (with clear headers, rows, cells; sorting, filtering support)
    *   [ ] Modals/Dialogs (for confirmations, forms, detailed views)
    *   [ ] Navigation Elements (Sidebar with hub-based organization, Tabs)
    *   [ ] Tooltips (for contextual help)
*   [ ] **Progress Indicators:**
    *   [ ] Spinners for in-component actions
    *   [ ] Skeleton screens for page loads
    *   [ ] Progress bars with percentage
    *   [ ] Streaming indicators for AI responses
*   [ ] **Component Documentation:**
    *   [ ] Implement Storybook for component development and documentation
    *   [ ] Auto-generate props tables, usage guidelines, code snippets
    *   [ ] Visual regression testing through Chromatic
    *   [ ] a11y addon for accessibility validation during development

## III. Layout, Visual Hierarchy & Structure

### Grid & Responsive Design

*   [ ] **Responsive Grid System:** 12-column grid for consistent layout
*   [ ] **Content-Driven Breakpoints (3-5 maximum):**
    *   [ ] Extra Small: 320-480px (mobile)
    *   [ ] Small: 481-768px (large mobile/tablet portrait)
    *   [ ] Medium: 769-1024px (tablet landscape/small desktop)
    *   [ ] Large: 1025-1440px (desktop)
    *   [ ] Extra Large: 1441px+ (large desktop)
*   [ ] **Progressive Enhancement:** Start with smallest screen design containing only essential features, then scale up

### Visual Hierarchy

*   [ ] **F-Pattern Layout:** Position critical KPIs in top-left quadrant where eyes land first
*   [ ] **Hierarchy Through:** Typography (size, weight, color), spacing, element positioning
*   [ ] **Consistent Alignment:** Maintain throughout interface
*   [ ] **Size, Color, Contrast, and Position:** Combine to guide attention toward insights requiring action

### Dashboard Layout Architecture

*   [ ] **Persistent Left Sidebar:** Primary navigation between modules (hub-based organization by user role)
*   [ ] **Content Area:** Main space for module-specific interfaces
*   [ ] **Optional Top Bar:** Global search, user profile, notifications
*   [ ] **Split-View Pattern (CRM contexts):** List + detail view simultaneously visible for multitasking without losing context
*   [ ] **Three-Column Layout (Detailed Views):**
    *   [ ] Fixed profile cards (left)
    *   [ ] Scrollable main content (center tabs for Activity, Documents, Related Records, Notes)
    *   [ ] Contextual sidebar widgets (right, showing score, tags, related items, statistics)

### Mobile-First Considerations

*   [ ] **Touch Target Specifications:**
    *   [ ] Minimum: 24×24 CSS pixels (WCAG 2.2)
    *   [ ] Recommended: 44×44 pixels (Apple) or 48×48 pixels (Google)
    *   [ ] Adequate spacing between targets
*   [ ] **Thumb-Reach Zones:** Position frequent actions in bottom third of screen
*   [ ] **Symmetric Layouts:** Consider left-handed and right-handed usage patterns
*   [ ] **Content Prioritization:** Ruthlessly remove irrelevant information for small screens

## IV. Interaction Design & Animations

### Micro-interactions

*   [ ] **Purposeful & Subtle:** Enhance usability without overwhelming
*   [ ] **Immediate Feedback:** Clear visual response to user actions
*   [ ] **Animation Timing:** Quick (150-300ms) with appropriate easing (ease-in-out)
*   [ ] **Types of Micro-interactions:**
    *   [ ] Hover effects
    *   [ ] Click/tap feedback
    *   [ ] Form submission confirmation
    *   [ ] Status change transitions
    *   [ ] Value update animations (subtle, with directional arrows)

### Loading & Transition States

*   [ ] **Loading States:**
    *   [ ] Skeleton screens for page loads (reduce perceived latency)
    *   [ ] Spinners for in-component actions
    *   [ ] Loading bars within chat bubbles for AI responses
    *   [ ] Streaming text display for conversational AI (token-by-token rendering)
*   [ ] **Smooth Transitions:** State changes, modal appearances, section expansions
*   [ ] **Data Freshness Indicators:** Timestamp of last update, visual pulse on refresh, connection status
*   [ ] **Motion Reduction:** Respect `prefers-reduced-motion` for accessibility

### Keyboard & Navigation

*   [ ] **Keyboard Navigation:** All interactive elements accessible via keyboard
*   [ ] **Clear Focus States:** 2px outline minimum with 3:1 contrast (WCAG 2.2 Focus Visible)
*   [ ] **Focus Not Obscured:** Ensure focused elements not hidden by sticky headers or overlays
*   [ ] **Keyboard Shortcuts:** For common actions in power-user contexts (e.g., moderation workflows)
*   [ ] **Tab Order:** Logical reading order that matches visual hierarchy

## V. Specific Module Design Tactics

### A. Multimedia Moderation Module

*   [ ] **Clear Media Display:** Prominent image/video previews (grid or list view with adequate white space)
*   [ ] **Obvious Moderation Actions:**
    *   [ ] Clearly labeled buttons (Approve, Reject, Flag)
    *   [ ] Distinct styling with color-coding (semantic colors)
    *   [ ] Icons for quick recognition
    *   [ ] Keyboard shortcuts for efficiency
*   [ ] **Visible Status Indicators:** Color-coded Badges (Pending, Approved, Rejected)
*   [ ] **Contextual Information:** Display relevant metadata (uploader, timestamp, flags) alongside media
*   [ ] **Workflow Efficiency:**
    *   [ ] Bulk Actions with selection count ("12 selected out of 245")
    *   [ ] Action trigger dropdowns with confirmations for destructive operations
    *   [ ] Streaming updates for real-time content
*   [ ] **Minimize Fatigue:**
    *   [ ] Clean, uncluttered interface
    *   [ ] Dark mode option
    *   [ ] Progressive disclosure for detailed metadata

### B. Data Tables Module (Contacts, Admin Settings)

#### Readability & Scannability

*   [ ] **Smart Alignment:** Left-align text, right-align numbers
*   [ ] **Clear Headers:** Bold column headers with sorting indicators
*   [ ] **Zebra Striping:** For dense tables (optional)
*   [ ] **Legible Typography:** Clean sans-serif, adequate row height & spacing
*   [ ] **Color Application:** Restrict bright colors to actions/tasks, use light color schemes with ample white space

#### Interactive Controls

*   [ ] **Column Sorting:** Clickable headers with visual sort indicators
*   [ ] **Progressive Disclosure Filters:**
    *   [ ] Sidebar filter panels (desktop data-heavy tools)
    *   [ ] Top filter bars (mobile with modal overlays)
    *   [ ] Embedded column filters for direct manipulation
*   [ ] **Visual Filter Feedback:**
    *   [ ] Display selected filter counts ("3 selected," "12 of 245 contacts")
    *   [ ] Show active filters as removable chips with "Clear all"
    *   [ ] Real-time result count updates
    *   [ ] Show counts per option before selection (prevent zero-result scenarios)
*   [ ] **Global Table Search**

#### Large Datasets

*   [ ] **Pagination (preferred for admin tables):** Clear page navigation with result counts
*   [ ] **Virtual/Infinite Scroll:** For appropriate contexts
*   [ ] **Sticky Headers:** Keep column headers visible during scroll
*   [ ] **Frozen Columns:** If applicable for wide tables

#### Row Interactions

*   [ ] **Expandable Rows:** For detailed information (default collapsed with preview)
*   [ ] **Inline Editing:** For quick modifications
*   [ ] **Bulk Actions:**
    *   [ ] Row-level checkboxes
    *   [ ] Page-level header checkbox (current page only)
    *   [ ] Global dropdown (entire dataset with clear communication)
    *   [ ] Selection persistence across pagination with clear communication
*   [ ] **Action Icons/Buttons:** Per row (Edit, Delete, View Details) with clear visual distinction
*   [ ] **Direct Labeling:** Use instead of legends when possible (reduce cognitive load)

### C. Configuration Panels Module (Microsite, Admin Settings)

*   [ ] **Clarity & Simplicity:**
    *   [ ] Clear, unambiguous labels for all settings
    *   [ ] Concise helper text or tooltips
    *   [ ] Avoid jargon
    *   [ ] Use natural language descriptions
*   [ ] **Logical Grouping:** Related settings into sections or tabs (hub-based if role-specific)
*   [ ] **Progressive Disclosure:**
    *   [ ] Hide advanced/less-used settings by default
    *   [ ] "Advanced Settings" toggle or accordions
    *   [ ] Three-level hierarchy: overview, drill-down, deep dive
*   [ ] **Appropriate Input Types:** Correct form controls for each setting type
*   [ ] **Visual Feedback:**
    *   [ ] Immediate confirmation of changes saved (toast notifications, inline messages)
    *   [ ] Clear error messages for invalid inputs with specific guidance
    *   [ ] Field-level validation
*   [ ] **Sensible Defaults:** Provide for all settings (opinionated design)
*   [ ] **Reset Option:** Easy "Reset to Defaults" for sections or entire configuration
*   [ ] **Preview Functionality:** Live or near-live preview of changes (especially for microsite settings)

### D. Dashboard & KPI Display

#### Core Principles

*   [ ] **5-10 Rule:** Surface 5-10 primary KPIs maximum, additional metrics via progressive disclosure
*   [ ] **Card-Based Layouts:**
    *   [ ] Aggregate status cards (total counts with exception highlights)
    *   [ ] Trend cards (current value with sparkline context)
    *   [ ] Utilization cards (percentage-based with bar/donut charts)
    *   [ ] Details cards (attribute-value pairs)
    *   [ ] Events cards (time-sequenced lists)
*   [ ] **Size Strategy:** Small, Medium, Large based on data format, volume, static vs. dynamic

#### KPI Card Components

*   [ ] **Large Primary Value:** 32-48px font
*   [ ] **Descriptive Label:** 14-16px
*   [ ] **Trend Indicator:** Arrow + percentage change
*   [ ] **Comparison Context:** Actual vs. target (bullet charts, progress bars)
*   [ ] **Historical Trend:** Sparkline visualization
*   [ ] **Time Reference:** Period covered

#### Data Visualization

*   [ ] **Visualization Selection by Data Type:**
    *   [ ] Comparisons: Bar charts (vertical for categories, horizontal for rankings)
    *   [ ] Trends: Line charts (continuous change over time)
    *   [ ] Proportions: Pie/donut charts (max 5-6 segments) or stacked bars
    *   [ ] Distributions: Histograms or box plots
    *   [ ] Relationships: Scatter plots (correlations) or bubble charts (three variables)
*   [ ] **Tufte's Principles:**
    *   [ ] Maximize data-ink ratio (remove chartjunk)
    *   [ ] Lie Factor: 0.95-1.05 (maintain honesty)
    *   [ ] Avoid truncated y-axes, inconsistent scaling, 3D distortions
    *   [ ] Remove redundant information
    *   [ ] Simplify axes to essential reference points
*   [ ] **Bullet Charts:** Most data-efficient comparison format (Stephen Few pattern)

#### Real-Time Updates

*   [ ] **Streaming Methods:** Push (WebSockets, SSE), pull (5-30 second polling), or hybrid
*   [ ] **Manage Change Blindness:**
    *   [ ] Subtle animations on value updates
    *   [ ] Directional arrows with percentage changes
    *   [ ] Threshold-based color coding (avoid trivial fluctuations)
*   [ ] **User Controls:** Pause auto-refresh capability

### E. Contact Management & CRM Patterns

#### Contact Cards

*   [ ] **Compact View Hierarchy:**
    *   [ ] Avatar/profile image (left)
    *   [ ] Full name (bold, larger font)
    *   [ ] Job title/role (secondary text)
    *   [ ] Company name (linked)
    *   [ ] Contact methods (clickable icons)
    *   [ ] Status/tags (color-coded chips)
    *   [ ] Quick actions (hover or persistent)
*   [ ] **Selective Color Application:** Bright colors exclusively for actions and tasks

#### Detailed Contact Views

*   [ ] **Three-Column Layout:**
    *   [ ] Fixed profile cards (left)
    *   [ ] Scrollable main content (center tabs)
    *   [ ] Contextual sidebar widgets (right)
*   [ ] **Activity Timeline:**
    *   [ ] Card-based displays with consistent structure
    *   [ ] Default collapsed state with previews
    *   [ ] Inline actions for quick completion/rescheduling
    *   [ ] Smart filtering by type/date/owner
    *   [ ] Real-time updates
*   [ ] **Relationship Visualization:**
    *   [ ] Network maps with N-level drill-down
    *   [ ] Color-coded connection strengths
    *   [ ] Node size indicating influence/importance
    *   [ ] Interactive expansion
    *   [ ] "Who knows who" introduction paths

#### Data Quality & Enrichment

*   [ ] **Completion Meters:** Profile status with breakdown by section
*   [ ] **Field-Level Badges:**
    *   [ ] Verified (green checkmark)
    *   [ ] Needs review (yellow warning)
    *   [ ] Invalid (red X)
    *   [ ] Updating (spinner)
*   [ ] **Last Verified Timestamps**
*   [ ] **Visual Quality Scores:** A+ 95/100, five-star ratings
*   [ ] **Waterfall Enrichment:** Query multiple providers sequentially

#### Deduplication & Merge

*   [ ] **Side-by-Side Comparison Views**
*   [ ] **Field-by-Field Control:**
    *   [ ] Radio buttons for single-value fields
    *   [ ] Checkboxes for multi-value fields
*   [ ] **Preview Before Commit**
*   [ ] **Separation/Undo Capabilities**
*   [ ] **Audit Trails:** Log all merge actions

## VI. AI Integration Patterns

### Core AI UX Principles

*   [ ] **"AI as Copilot, Not Autopilot":** Maintain human control while leveraging computational power
*   [ ] **Three Altitude Levels:**
    *   [ ] Immersive experiences (full-screen, cross-app capabilities)
    *   [ ] Assistive features (within-app accelerators)
    *   [ ] Embedded modules (contextual AI moments)

### Conversational AI Interfaces

*   [ ] **Streaming Text Display:** Token-by-token rendering (reduces perceived latency)
*   [ ] **Loading Avatars:** Visible during streaming to signal system is working
*   [ ] **Beyond Chat-Only:**
    *   [ ] Hybrid approach: Natural language + knobs/sliders for precision
    *   [ ] Visual canvas manipulation for spatial tasks
    *   [ ] Direct manipulation for refinement after AI generation
*   [ ] **Zero-State Design:** Teach capabilities while acknowledging fallibility

### Trust-Building Patterns

*   [ ] **Transparency Mechanisms:**
    *   [ ] Numbered inline footnotes with expandable source previews (Perplexity pattern)
    *   [ ] AI Badge concept (click reveals technology, training, limitations)
    *   [ ] "AI may make mistakes—please verify" notices
*   [ ] **Citations:** Enable fact-checking without leaving interface
*   [ ] **Confidence Indicators:**
    *   [ ] Numeric percentages
    *   [ ] Verbal qualifiers
    *   [ ] N-best classifications
*   [ ] **Refusal-to-Hallucinate Design:** Accept "I don't know" as acceptable output

### Feedback Mechanisms

*   [ ] **Lightweight Initial Feedback:** Simple thumbs up/down
*   [ ] **Optional Detailed Follow-up:** "Why was this helpful?" forms
*   [ ] **Comparison Selection:** Choose between outputs (trains preferences implicitly)
*   [ ] **Regeneration Controls:** Preserve history rather than overwriting
*   [ ] **Version Comparison:** Allow users to cherry-pick elements

### AI-Powered Features

*   [ ] **Instant Reply Drafts:** Match sender voice and tone
*   [ ] **Metadata Enrichment:** Relationship strength, last interaction, shared connections
*   [ ] **Auto-Complete with Intelligence:**
    *   [ ] Ranking by frequency, recency, relationship strength
    *   [ ] Visual relationship scores
    *   [ ] Real-time email validation
    *   [ ] Sub-100ms response time
*   [ ] **Templates with AI Placeholders:** Search email history automatically

## VII. Performance Optimization

### Core Web Vitals

*   [ ] **Largest Contentful Paint (LCP):** Target < 2.5 seconds
    *   [ ] LCP image URLs in HTML response (not lazy-loaded)
    *   [ ] Standard img elements with src/srcset
    *   [ ] `fetchpriority="high"` on critical images
    *   [ ] Reduce server response times
    *   [ ] Use WebP or AVIF formats
*   [ ] **Interaction to Next Paint (INP):** Target < 200 milliseconds
    *   [ ] Minimize JavaScript execution time
    *   [ ] Code splitting and tree shaking
    *   [ ] Break long tasks into smaller chunks
    *   [ ] Use React 18's `startTransition` for non-urgent updates
*   [ ] **Cumulative Layout Shift (CLS):** Target < 0.1
    *   [ ] Explicit dimensions for images and videos
    *   [ ] Reserve space for ads and embeds
    *   [ ] Use CSS `aspect-ratio` for media
    *   [ ] Avoid content injection above existing elements
*   [ ] **Business Impact:** Every 100ms improvement ≈ 7% boost in conversion

### Progressive Web Apps (PWA)

*   [ ] **Service Workers:** Offline functionality, push notifications, background sync
*   [ ] **Web App Manifests:** Define name, icons, display mode
*   [ ] **HTTPS Security:** Required for PWA features
*   [ ] **Display Mode:** `display: standalone` for dedicated windows
*   [ ] **Feature Detection:** Graceful degradation

### Resource Optimization

*   [ ] **Critical CSS Inlined:** Above-the-fold to prevent render-blocking
*   [ ] **Async Non-Critical Styles**
*   [ ] **JavaScript Optimization:**
    *   [ ] Dynamic imports for heavy components
    *   [ ] Virtual scrolling for long lists
    *   [ ] Intersection Observer for lazy loading
*   [ ] **Image Optimization:**
    *   [ ] Responsive images with `srcset`
    *   [ ] Lazy loading below fold
    *   [ ] Modern formats (WebP, AVIF)

## VIII. Accessibility & Inclusive Design

### WCAG 2.2 Level AA Compliance

*   [ ] **New Success Criteria (since 2.1):**
    *   [ ] Focus Visible: 2px outline, 3:1 contrast
    *   [ ] Focus Not Obscured: No sticky headers hiding focus
    *   [ ] Target Size: 24×24 CSS pixels minimum
    *   [ ] Accessible Authentication: No cognitive tests (alternatives to CAPTCHAs)
*   [ ] **Build Accessibility Into Atoms:** 3-5x cheaper than retrofitting

### ARIA Implementation

*   [ ] **First Rule of ARIA:** If native HTML provides required semantics, use it
*   [ ] **"No ARIA is Better Than Bad ARIA":** Conservative application
*   [ ] **Add ARIA Only When:** Native HTML insufficient for specific use cases
*   [ ] **Proper ARIA Patterns:**
    *   [ ] Live regions for dynamic content announcements
    *   [ ] Landmark navigation
    *   [ ] Proper role assignments

### Screen Reader Testing

*   [ ] **Test Multiple Platforms:**
    *   [ ] NVDA (65.6% usage, Windows, free)
    *   [ ] JAWS (60.5% usage, Windows, paid)
    *   [ ] VoiceOver (macOS, iOS built-in)
    *   [ ] TalkBack (Android)
    *   [ ] Narrator (Windows 10/11)
*   [ ] **Testing Workflows:**
    *   [ ] Tab through all interactive elements (logical reading order)
    *   [ ] Check image alt text announcements
    *   [ ] Test form field labels and error messages
    *   [ ] Verify dynamic content announcements
    *   [ ] Validate landmark navigation
    *   [ ] Confirm heading structure for efficient navigation

### Inclusive Design Principles

*   [ ] **Curb Cut Effect:** Solutions for specific needs benefit everyone
*   [ ] **Situational Disabilities:** Design for temporary constraints (bright sunlight, noisy environments, holding baby)
*   [ ] **Three Core Principles:**
    *   [ ] Recognize exclusion beyond physical disabilities
    *   [ ] Learn from diversity (include people with varied abilities)
    *   [ ] Solve for one, extend to many

### Testing Strategy

*   [ ] **Automated Testing (30-40% coverage):**
    *   [ ] axe DevTools (57% of WCAG criteria)
    *   [ ] WAVE (visual feedback overlays)
    *   [ ] BrowserStack (3,500+ real devices, AI-driven detection)
*   [ ] **Manual Testing (60-70% coverage):**
    *   [ ] Screen reader testing
    *   [ ] Keyboard-only navigation
    *   [ ] Magnification testing
    *   [ ] Reading order verification
    *   [ ] Content quality assessment

## IX. CSS & Styling Architecture

### Methodology Selection

*   [ ] **Utility-First (Recommended for LLM & Rapid Development):**
    *   [ ] Tailwind CSS with configured design tokens
    *   [ ] Apply via utility classes
    *   [ ] Core utility classes only (no custom compilation)
    *   [ ] Excellent for React components with Hooks
*   [ ] **BEM with Sass:** If not utility-first
    *   [ ] Structured BEM naming
    *   [ ] Sass variables for tokens
*   [ ] **CSS-in-JS (Scoped Styles):** For component libraries
    *   [ ] Styling isolation per component
    *   [ ] Framework-agnostic approach

### Implementation Best Practices

*   [ ] **Design Token Integration:** Colors, fonts, spacing, radii directly usable in CSS architecture
*   [ ] **Maintainability:** Well-organized, readable code
*   [ ] **Performance:** Optimized CSS delivery, avoid bloat
*   [ ] **Scalability:** Support theming without duplicating code

## X. General Best Practices & Workflow

### Development Process

*   [ ] **Iterative Design & Testing:** Continuously test with users and iterate
*   [ ] **Clear Information Architecture:** Organize content and navigation logically
*   [ ] **Responsive Design:** Fully functional on all device sizes (desktop, tablet, mobile)
*   [ ] **Component Documentation:**
    *   [ ] Maintain clear design system documentation
    *   [ ] Living style guide with Storybook
    *   [ ] Usage guidelines and code examples
*   [ ] **Version Control:** Track design system changes with semantic versioning

### Quality Assurance

*   [ ] **Cross-Browser Testing:** Chrome, Firefox, Safari, Edge
*   [ ] **Device Testing:** Real devices across different screen sizes
*   [ ] **Performance Monitoring:** Regular Core Web Vitals audits
*   [ ] **Accessibility Audits:** Quarterly comprehensive reviews
*   [ ] **User Testing:** Regular sessions with diverse user groups

### Metrics & Success Criteria

*   [ ] **Development Velocity:** Track 40-60% efficiency gains from design system
*   [ ] **Conversion Rate Impact:** Monitor improvements from performance optimizations
*   [ ] **Accessibility Compliance:** Maintain WCAG 2.2 Level AA certification
*   [ ] **User Satisfaction:** NPS scores, task completion rates, time-on-task
*   [ ] **Error Rates:** Form validation errors, failed interactions
*   [ ] **Performance Metrics:** LCP, INP, CLS tracking

---

## Priority Implementation Order

1. **Foundation (Weeks 1-2):** Design tokens, core components, accessibility baseline
2. **Layout & Navigation (Weeks 3-4):** Responsive grid, primary navigation, mobile adaptation
3. **Module-Specific Patterns (Weeks 5-8):** Tables, dashboards, forms, contact management
4. **AI Integration (Weeks 9-10):** Conversational interfaces, trust mechanisms, feedback loops
5. **Performance Optimization (Weeks 11-12):** Core Web Vitals, PWA features, resource optimization
6. **Polish & Testing (Ongoing):** Micro-interactions, accessibility audits, user testing refinement