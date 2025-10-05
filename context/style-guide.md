# Brand Style Guide for CRMEdge

## Brand Overview

**Design Philosophy:** Minimal sophistication with playful professionalism. Clean, breathable interfaces that balance data density with visual calm through strategic use of white space, soft gradients, and purposeful color accents.

---

## Color System

### Primary Palette

**Background Gradients**
- Soft multi-hue gradients (pastel green → lavender → pale blue → soft yellow)
- Base: `#F8FBF6` to `#E8F0F7` to `#FFF9E8`
- Purpose: Creates warmth and approachability without overwhelming

**Accent Colors**
- Primary Action: `#0A0A0A` (Near-black for CTAs and emphasis)
- Success/Positive: `#A8E6A3` (Soft mint green)
- Warning/Pending: `#FFE5B4` (Warm peach)
- Error/Due: `#FFD4D4` (Soft coral)
- Information: `#D4E5FF` (Pale blue)

**Neutrals**
- Text Primary: `#1A1A1A` (90% black)
- Text Secondary: `#6B6B6B` (Medium gray)
- Text Tertiary: `#A0A0A0` (Light gray)
- Borders: `#E8E8E8` (Subtle dividers)
- Card Background: `#FFFFFF` (Pure white for elevation)
- Hover States: `#F5F5F5` (Off-white)

### Semantic Color Usage

**Status Indicators**
- Accepted/Paid: Green badge background `#E8F7E6`, text `#2D7A2D`
- Pending: Orange badge background `#FFF4E6`, text `#CC7A00`
- Overdue: Red badge background `#FFE8E8`, text `#CC0000`
- Not Paid: Gray badge background `#F0F0F0`, text `#666666`

**Data Visualization**
- Primary metric line: `#A8E6A3` (Green)
- Secondary metric: `#D4C3FF` (Soft purple)
- Tertiary metric: `#0A0A0A` (Black for emphasis)

**Color Application Rules**
- Maximum 3 colors per visualization
- Use color sparingly—restrict bright colors to actions and status only
- Maintain 4.5:1 contrast ratio for text
- Never use color alone to convey information

---

## Typography

### Font Family
**Primary:** Inter or system-ui fallback
- Reasoning: Clean, legible, excellent at small sizes, modern but professional

### Type Scale

**Display/Large Numbers**
- KPI Values: 32-48px, Weight: 600 (SemiBold)
- Example: `$184,960` or `79/100`

**Headings**
- H1 (Page Title): 28px, Weight: 600
- H2 (Section Title): 20px, Weight: 600  
- H3 (Card Title): 16px, Weight: 600
- H4 (Subsection): 14px, Weight: 600

**Body Text**
- Large: 16px, Weight: 400, Line height: 1.6
- Regular: 14px, Weight: 400, Line height: 1.5
- Small/Caption: 12px, Weight: 400, Line height: 1.4
- Micro (labels): 11px, Weight: 500, Line height: 1.3

**Specialized**
- Badges/Tags: 12px, Weight: 500, Uppercase tracking: 0.5px
- Buttons: 14px, Weight: 500
- Input Fields: 14px, Weight: 400

### Typography Rules
- Line height: 1.5-1.6 for readability
- Max line width: 65-75 characters for paragraphs
- Use weight variation (400, 500, 600) rather than multiple font families
- Avoid italics except for very specific emphasis

---

## Spacing System

### Base Unit: 8px

**Spacing Scale**
- 4px (0.5 units) - Tight spacing within components
- 8px (1 unit) - Default small spacing
- 12px (1.5 units) - Comfortable spacing
- 16px (2 units) - Standard component padding
- 24px (3 units) - Section spacing
- 32px (4 units) - Large gaps between groups
- 48px (6 units) - Major section breaks
- 64px (8 units) - Page-level spacing

**Application**
- Card padding: 24px
- Between KPI cards: 16-24px
- Between sections: 32-48px
- Button padding: 12px horizontal, 10px vertical
- Input padding: 12px horizontal, 10px vertical

---

## Layout & Grid

### Grid System
- 12-column responsive grid
- Container max-width: 1440px
- Gutter: 24px
- Margin: 32px (desktop), 16px (mobile)

### Card-Based Layout
**Card Anatomy**
- Border radius: 16-20px (generous, friendly)
- Background: White `#FFFFFF`
- Shadow: Subtle elevation
  - Default: `0 2px 8px rgba(0, 0, 0, 0.04)`
  - Hover: `0 4px 16px rgba(0, 0, 0, 0.08)`
- Border: None (elevation through shadow only)

**Card Types**
1. **KPI Cards** - Compact, focused metrics
2. **List Cards** - Tables, employee lists
3. **Chart Cards** - Visualizations with context
4. **Document Cards** - Status-based content
5. **Widget Cards** - Small, actionable items

### Layout Patterns
- **Dashboard**: 3-column layout (left sidebar 240px fixed, main content fluid, right panel 320-360px)
- **Two-column**: 60/40 or 70/30 split for list/detail views
- **Card grid**: 2-3 cards per row with consistent gaps

---

## Components

### Buttons

**Primary Button**
- Background: `#0A0A0A` (Black)
- Text: `#FFFFFF` (White)
- Padding: 12px 20px
- Border radius: 8px
- Font: 14px, Weight 500
- Hover: `#2A2A2A` background
- Icon spacing: 8px from text

**Secondary Button**
- Background: `#F5F5F5` (Off-white)
- Text: `#1A1A1A` (Near-black)
- Border: 1px solid `#E8E8E8`
- Padding: 12px 20px
- Border radius: 8px

**Ghost Button**
- Background: Transparent
- Text: `#1A1A1A`
- Hover: `#F5F5F5` background

### Input Fields

**Text Input**
- Height: 40px
- Padding: 12px 16px
- Border: 1px solid `#E8E8E8`
- Border radius: 8px
- Font: 14px
- Focus: Border `#0A0A0A`, subtle shadow
- Placeholder: `#A0A0A0`

**Search Bar**
- Include search icon (left, 16px from edge)
- Placeholder: "Search something here..."
- Background: `#F8F8F8` with no border (or subtle border)
- Border radius: 24px (pill shape)

### Badges/Tags

- Padding: 4px 10px
- Border radius: 6px
- Font: 12px, Weight 500
- Background: Status-specific light color
- Text: Status-specific dark color
- No border

### Avatars

- Size: 32px (small), 40px (medium), 48px (large)
- Border radius: 50% (circle)
- Border: 2px solid white when overlapping
- Fallback: Initials on colored background

### Data Tables

**Structure**
- Row height: 48px minimum (comfortable touch targets)
- Cell padding: 12px horizontal, 16px vertical
- Header: Weight 600, 12px uppercase with tracking
- Borders: Horizontal only, `#F0F0F0` color
- Hover row: `#F8F8F8` background
- Selected row: `#F0F5FF` background

**Alignment**
- Text: Left-aligned
- Numbers: Right-aligned
- Actions: Right-aligned

### Charts & Visualizations

**Gauge/Progress Rings**
- Thickness: 16-20px
- Background: `#F0F0F0`
- Foreground: Primary color
- Center value: Large, bold number
- Label below: Small, secondary text

**Bar Charts (Minimal Style)**
- Bar spacing: 8-12px
- Bar radius: 4px top corners
- Grid lines: Subtle `#F0F0F0`, horizontal only
- Axis labels: 12px, `#6B6B6B`
- No background, no frame

**Line Charts**
- Line width: 2px
- Data points: 6px circles
- Grid: Minimal or none
- Area fill: 10% opacity of line color (optional)

---

## Iconography

### Icon Style
- Outline style (2px stroke weight)
- 20-24px default size
- Rounded corners (2px radius on strokes)
- Color: Inherits from text or specified semantic color

### Icon Library Recommendation
- Lucide Icons or Phosphor Icons (consistent with outline style)
- Use sparingly—only when adding clarity

### Common Icons
- Menu/Grid: Navigation
- Search: Magnifying glass
- Settings: Gear
- More actions: Three dots (horizontal)
- Add: Plus in circle
- Info: "i" in circle
- Trend up/down: Arrows at angles

---

## Animation & Interaction

### Animation Principles
- **Duration:** 150-250ms for micro-interactions
- **Easing:** ease-in-out for most, ease-out for entrances
- **Purpose:** Provide feedback, maintain spatial relationships

### Specific Animations
- Button hover: Background color transition (200ms)
- Card hover: Shadow expansion (200ms)
- Modal entrance: Fade + subtle scale (250ms)
- Dropdown: Slide down with fade (200ms)
- Loading: Skeleton screens or subtle pulse
- Success feedback: Green checkmark with bounce

### Hover States
- Cards: Elevate shadow slightly
- Buttons: Darken/lighten background
- Table rows: Light background tint
- Links: Subtle underline appears

---

## Voice & Tone

### Brand Voice
- **Clear & Direct:** No jargon, straightforward language
- **Encouraging:** "You're team is great!" with celebratory emoji
- **Professional but Warm:** Formal enough for business, friendly enough to feel human
- **Data-Informed:** Let numbers speak, avoid hyperbole

### UI Copy Guidelines
- Button text: Action-oriented verbs ("Create New Invoice" not "New")
- Labels: Descriptive but concise ("Total Sales" not "Sales")
- Empty states: Helpful and actionable
- Error messages: Explain what happened and how to fix it
- Success messages: Brief confirmation

---

## Accessibility Standards

- WCAG 2.2 Level AA compliance minimum
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Touch targets: Minimum 44x44px
- Focus indicators: 2px outline with 3:1 contrast
- Keyboard navigation: All interactive elements accessible
- Screen reader: Proper ARIA labels and semantic HTML

---

## Responsive Behavior

### Breakpoints
- Mobile: 320-768px
- Tablet: 769-1024px
- Desktop: 1025-1440px
- Large: 1441px+

### Adaptive Patterns
- Sidebar: Collapses to hamburger menu on mobile
- Card grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Typography: Scale down 10-15% on mobile
- Spacing: Reduce by 25-50% on mobile
- Tables: Horizontal scroll or card transformation on mobile

---

## Design Dos & Don'ts

### Do
- Use generous white space
- Group related information in cards
- Show 5-10 primary metrics maximum
- Use soft, gradient backgrounds for warmth
- Apply shadows for elevation, not borders
- Maintain visual hierarchy through size and weight
- Provide immediate feedback for actions
- Use real data in designs (avoid lorem ipsum)

### Don't
- Use more than 3-4 colors in a single view
- Add decorative elements without purpose
- Create harsh borders between sections
- Use pure black (#000000) backgrounds
- Overwhelm with too many metrics
- Rely on color alone to convey meaning
- Use complex gradients on text or icons
- Add animation without clear purpose

---

## Inspiration References

**Similar Design Language:**
- Linear (clean, fast, purposeful)
- Composio MCP (minimal, technical elegance)
- Stripe Dashboard (data clarity, professional warmth)
- Notion (flexible, approachable)
- Height (playful but professional)

**Key Differentiators:**
- Softer gradient backgrounds (warmer than pure white/gray)
- Generous border radius (16-20px vs standard 8px)
- Strategic color use (minimal palette, maximum impact)
- Celebration of data through clear hierarchy and white space