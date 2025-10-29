# RelationHub Web App

> AI-powered professional relationship management frontend built with Next.js 14, React, and TanStack Query

## Overview

The RelationHub web application provides an intelligent, user-friendly interface for managing professional relationships with AI-powered email composition features. Built with modern React patterns, server-side rendering, and real-time GraphQL subscriptions.

## Key Features

### 📧 Email Composer

- **AI-Powered Template Generation**: Generate personalized email templates in two style variants (Formal and Casual)
- **Rich Text Editor**: Full-featured TipTap editor with formatting, attachments, and signature support
- **Auto-Save & Recovery**: Automatic draft saving to localStorage (500ms debounce) and database (2-second sync)
- **Draft Recovery**: Automatic recovery prompt after browser crashes or unexpected closures
- **Attachment Management**: Upload files up to 25MB with drag-and-drop or file picker
- **Email Signatures**: Create, manage, and auto-insert email signatures
- **Bulk Campaign Mode**: Send personalized emails to multiple contacts at once with placeholder support
- **Polish Draft**: AI-powered draft refinement in four styles (Formal, Casual, Elaborate, Concise)

### 👥 Contact Management

- **CRUD Operations**: Create, view, edit, and delete contacts with rich context fields
- **Advanced Search**: Debounced text search with filters by priority, company, and industry
- **Responsive Grid**: Mobile-first card grid with infinite scroll pagination
- **Contact Detail View**: Comprehensive contact profiles with relationship history
- **Priority System**: High/Medium/Low priority levels with visual indicators

### 🎨 UI/UX

- **Responsive Design**: Mobile-first layouts adapting from 320px to 2560px+ viewports
- **Dark Mode**: System-aware theme switching with manual override
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Loading States**: Skeleton loaders and optimistic UI updates for instant feedback
- **Error Boundaries**: Graceful error handling with user-friendly messages

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Next.js 14 App Router                    │
│                   (Server & Client Components)                │
└────────────────────────────┬─────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼────────┐ ┌──▼───────────┐ ┌▼──────────────────┐
    │  Compose Page    │ │ Contacts Page│ │ Dashboard Page    │
    │  - EmailComposer │ │ - ContactGrid│ │ - QuickStats      │
    │  - AIModal       │ │ - SearchBar  │ │ - RecentActivity  │
    │  - BulkSend      │ │ - Filters    │ │ - QuickActions    │
    └─────────┬────────┘ └──┬───────────┘ └───────────────────┘
              │              │
    ┌─────────▼──────────────▼─────────────────────────────────┐
    │              TanStack Query (State Management)            │
    │  - useContacts()      - useAutoSave()                     │
    │  - useEmailDrafts()   - useDraftRecovery()                │
    │  - useAttachments()   - usePolishDraft()                  │
    │  - useSignatures()    - useBulkCampaign()                 │
    └─────────────────────────┬────────────────────────────────┘
                              │
    ┌─────────────────────────▼────────────────────────────────┐
    │              GraphQL Client (Apollo)                      │
    │  - Optimistic Updates                                     │
    │  - Cache Management                                       │
    │  - Error Handling                                         │
    │  - Token Refresh                                          │
    └─────────────────────────┬────────────────────────────────┘
                              │
    ┌─────────────────────────▼────────────────────────────────┐
    │              Backend GraphQL API                          │
    │  http://localhost:4000/graphql                            │
    └───────────────────────────────────────────────────────────┘

    ┌───────────────────────────────────────────────────────────┐
    │              Supabase Authentication                      │
    │  - Email/Password auth                                    │
    │  - Google OAuth                                           │
    │  - LinkedIn OAuth (planned)                               │
    │  - Session management                                     │
    └───────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js v22+ LTS
- pnpm v8+
- Supabase project (for authentication)
- Backend API running at `http://localhost:4000`

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Set up environment variables
cd apps/web
cp .env.local.example .env.local
# Edit .env.local and add your Supabase credentials

# Start development server
pnpm dev
```

The web app will be available at:
- **Frontend**: http://localhost:3000
- **Compose Page**: http://localhost:3000/compose
- **Contacts Page**: http://localhost:3000/contacts
- **Dashboard**: http://localhost:3000/dashboard

### Environment Variables

Create `apps/web/.env.local`:

```bash
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"
```

## Email Composer Usage

### Basic Composition Flow

1. **Navigate to Composer**
   ```
   http://localhost:3000/compose
   ```

2. **Select Contact**
   - Click "Select Contact" dropdown
   - Search by name or email
   - Select recipient

3. **Generate AI Template** (Optional)
   - Click "Generate with AI" button (appears when contact selected)
   - Review both Formal and Casual variants side-by-side
   - Click "Use Template A" or "Use Template B"
   - Template populates Subject and Body fields

4. **Compose Email**
   - Edit subject line
   - Type or paste body content
   - Use toolbar for formatting (bold, italic, lists, links)
   - Content auto-saves every 500ms to localStorage
   - Database sync happens 2 seconds after typing stops

5. **Add Attachments** (Optional)
   - Drag and drop files onto upload zone
   - Or click "Choose Files" button
   - Supported formats: PDF, DOC, DOCX, TXT, images
   - Max file size: 25MB per file
   - Files upload to AWS S3 with presigned URLs

6. **Add Signature** (Optional)
   - Signature auto-inserts based on email type
   - Or manually select from dropdown
   - Create signatures in Settings page

7. **Send Email**
   - Click "Send" button
   - Email sent via Gmail API
   - Appears in Gmail Sent folder
   - Saved to conversation history

### Auto-Save & Draft Recovery

**Auto-Save Mechanism:**

```typescript
// Saves to localStorage immediately
onChange(content) {
  localStorage.setItem('draft-compose-{contactId}', JSON.stringify({
    subject,
    body,
    timestamp: Date.now()
  }));

  // Syncs to database after 2 seconds of inactivity
  setTimeout(() => {
    saveDraftMutation({ subject, body, contactId });
  }, 2000);
}
```

**Draft Recovery:**

If browser crashes or is closed unexpectedly:

1. Reopen composer: `http://localhost:3000/compose?contactId={id}`
2. Recovery modal appears automatically
3. Shows last saved content with timestamp
4. Click "Recover Draft" to restore content
5. Or click "Start Fresh" to discard

**Manual Draft Loading:**

```bash
# In browser console
const draft = localStorage.getItem('draft-compose-contact-123');
console.log(JSON.parse(draft));
```

### AI Template Generation

**How It Works:**

1. User clicks "Generate with AI"
2. Modal opens with loading state
3. Backend calls LLM API with contact context:
   - Contact name, email, company, role
   - Previous conversation history (last 5 emails)
   - Relationship context from notes
4. AI generates two variants:
   - **Template A (Formal)**: Professional, structured tone
   - **Template B (Casual)**: Friendly, conversational tone
5. Templates display side-by-side with color-coded badges
6. User selects preferred template

**Example Generated Templates:**

```
Template A (Formal):
Subject: Following Up on Our Discussion
Body: Dear John,

I hope this email finds you well. I wanted to follow up on our
recent conversation regarding the partnership opportunity...

Template B (Casual):
Subject: Quick Follow-Up
Body: Hey John!

Hope you're doing great! I wanted to touch base about what we
discussed last week...
```

**Regenerate Templates:**

Click "Regenerate Both Templates" to get new variants with different phrasing.

### Attachment Management

**Upload Methods:**

1. **Drag & Drop**
   - Drag files from desktop to upload zone
   - Visual feedback with hover state
   - Multiple files supported

2. **File Picker**
   - Click "Choose Files" button
   - Select one or more files
   - Uploads start immediately

**Upload Flow:**

```typescript
1. User selects file(s)
2. Frontend requests presigned URL from backend
   POST /graphql { mutation GetPresignedUrl(filename, mimetype) }
3. Backend generates S3 presigned URL (15-minute expiry)
4. Frontend uploads directly to S3 via PUT request
5. Progress bar shows upload status
6. On success, attachment badge appears with file name and size
7. Click "X" to remove attachment
```

**File Restrictions:**

- **Max size**: 25MB per file
- **Blocked types**: .exe, .py, .sh, .bat, .json (security)
- **Allowed types**: PDF, DOC, DOCX, TXT, images (PNG, JPG, GIF)

**Remove Attachment:**

Click the "X" icon on attachment badge. File remains in S3 but is not sent with email.

### Email Signatures

**Create Signature:**

1. Go to Settings → Signatures
2. Click "Create Signature"
3. Enter signature content (rich text supported)
4. Optionally mark as default
5. Save

**Auto-Insert Logic:**

```typescript
// Signature auto-inserts based on email type
if (emailType === 'professional') {
  insertSignature('Professional Signature');
} else if (emailType === 'casual') {
  insertSignature('Casual Signature');
}
```

**Manual Selection:**

Use signature dropdown in composer to manually select different signature.

## Bulk Campaign Mode

Send personalized emails to multiple contacts at once.

### Usage

1. **Navigate to Contacts Page**
   ```
   http://localhost:3000/contacts
   ```

2. **Select Multiple Contacts**
   - Click checkbox on each contact card
   - Or click "Select All" in header
   - Badge shows count: "3 contacts selected"

3. **Initiate Bulk Send**
   - Click "Send Campaign" button in header
   - Composer opens in bulk mode

4. **Compose Campaign Email**
   - Subject and body support placeholders:
     - `{{firstName}}` - Contact's first name
     - `{{lastName}}` - Contact's last name
     - `{{email}}` - Contact's email
     - `{{company}}` - Contact's company name
     - `{{role}}` - Contact's job title

5. **Preview Placeholders**
   - Click "Preview" to see how email looks for each contact
   - Placeholders replaced with actual values

6. **Send Campaign**
   - Click "Send to All" button
   - Emails sent sequentially (10 per minute rate limit)
   - Progress bar shows status: "5 of 10 sent"

### Example Campaign Template

```
Subject: Quick Update for {{company}}

Hi {{firstName}},

I wanted to reach out regarding our partnership with {{company}}.

As {{role}} at {{company}}, I thought you'd be interested in...

Best regards,
[Your Name]
```

**Rendered for John Doe (CEO at Acme Inc):**

```
Subject: Quick Update for Acme Inc

Hi John,

I wanted to reach out regarding our partnership with Acme Inc.

As CEO at Acme Inc, I thought you'd be interested in...

Best regards,
[Your Name]
```

### Placeholder Validation

Before sending, system validates:

1. **Placeholder syntax**: Only `{{validField}}` patterns allowed
2. **Field existence**: All contacts have values for used placeholders
3. **Missing data warning**: Alerts if any contact missing required field

**Error Example:**

```
Error: Cannot send campaign
Contact "Jane Smith" is missing field: company
Please update contact data or remove placeholder.
```

### Rate Limiting

- **Max contacts per campaign**: 100
- **Send rate**: 10 emails per minute
- **Daily limit**: 100 emails per day (Gmail API)

Campaign automatically throttles to respect rate limits.

## Polish Draft Feature

Refine your drafted emails with AI in four different styles.

### Usage

1. **Write Initial Draft**
   - Compose email in standard composer
   - Write rough draft or bullet points
   - Minimum 10 characters required

2. **Open Polish Draft Modal**
   - Click "Polish Draft" button below editor
   - Modal opens with four style options

3. **Select Style**
   - **Formal**: Professional, structured, executive tone
   - **Casual**: Friendly, conversational, approachable tone
   - **Elaborate**: Detailed, comprehensive, expanded content
   - **Concise**: Brief, to-the-point, minimal words

4. **Review Polished Version**
   - AI generates refined version
   - Side-by-side comparison with original
   - Word count and tone analysis displayed

5. **Apply or Regenerate**
   - Click "Use This Version" to replace draft
   - Or click "Try Another Style" to regenerate

### Example Transformations

**Original Draft:**

```
need to follow up about the meeting. want to discuss proposal.
```

**Formal Style:**

```
Dear [Name],

I hope this message finds you well. I wanted to follow up on our
recent meeting to discuss the proposal in more detail. Would you
have availability this week for a brief call?

Best regards,
[Your Name]
```

**Casual Style:**

```
Hey [Name]!

Hope you're doing well! I wanted to touch base about our meeting
last week. Can we hop on a quick call to chat about the proposal?

Thanks!
[Your Name]
```

**Elaborate Style:**

```
Dear [Name],

I hope this email finds you in good spirits. Following our productive
meeting last week, I wanted to reach out to continue our discussion
regarding the proposal we reviewed.

I believe there are several key points that would benefit from further
exploration, and I'm eager to hear your thoughts on the strategic
direction we outlined...
```

**Concise Style:**

```
[Name] -

Quick follow-up on our meeting. Let's discuss the proposal this week.

Available?

- [Your Name]
```

### Performance

- **Average processing time**: <3 seconds
- **Max processing time**: 5 seconds (timeout)
- **Cache**: Results cached for 1 hour
- **Rate limit**: 20 polish requests per minute

## Testing

### Run Tests

```bash
# Unit tests
pnpm test

# E2E tests (requires Playwright)
pnpm test:e2e

# Specific test suites
pnpm test EmailComposer
pnpm test useAutoSave
pnpm test BulkCampaign
```

### Test Coverage

Current coverage: **80%+**

```
Components    : 85%
Hooks         : 82%
Utils         : 88%
Integration   : 78%
```

### Key Test Suites

- **EmailComposer**: 45 tests (rendering, interactions, validation)
- **ContactGrid**: 38 tests (search, filters, pagination)
- **useAutoSave**: 15 tests (debouncing, localStorage, database sync)
- **useDraftRecovery**: 12 tests (detection, recovery, discard)
- **E2E Integration**: 27 tests (complete user workflows)

### Manual Testing Checklist

**Email Composition:**
- [ ] Select contact and compose email
- [ ] Generate AI template and select variant
- [ ] Add attachment (drag & drop and file picker)
- [ ] Verify auto-save to localStorage (<500ms)
- [ ] Verify database sync after 2 seconds
- [ ] Close browser and verify draft recovery on reopen
- [ ] Send email and verify in Gmail Sent folder

**Bulk Campaign:**
- [ ] Select 5 contacts on contacts page
- [ ] Open bulk composer
- [ ] Add placeholders: `{{firstName}}`, `{{company}}`
- [ ] Preview each contact's email
- [ ] Send campaign and verify rate limiting (10/min)
- [ ] Check all contacts received personalized emails

**Polish Draft:**
- [ ] Write rough draft (50 words)
- [ ] Click "Polish Draft"
- [ ] Test Formal style
- [ ] Test Casual style
- [ ] Test Elaborate style
- [ ] Test Concise style
- [ ] Verify <5 second response time

## Troubleshooting

### Common Issues

**Auto-Save Not Working**

```javascript
// Check localStorage in browser console
localStorage.getItem('draft-compose-contact-123');
// Should return: {"subject":"...", "body":"...", "timestamp":1234567890}
```

**Solution:**
- Ensure localStorage is enabled in browser
- Check browser console for errors
- Verify `useAutoSave()` hook is properly initialized

---

**Draft Recovery Not Showing**

**Symptoms:**
- Had unsaved draft
- Browser crashed
- No recovery modal on reopen

**Solution:**
1. Check localStorage manually (see above)
2. Verify draft timestamp is within 24 hours
3. Ensure `useDraftRecovery()` hook is active
4. Check browser console for errors

---

**AI Generation Timeout**

**Symptoms:**
- "Generate with AI" button shows loading indefinitely
- No templates appear after 30+ seconds

**Solution:**
1. Check backend API is running: `http://localhost:4000/graphql`
2. Verify LLM API keys configured in backend
3. Check backend logs for LLM errors
4. Try again (may be provider rate limit)

---

**Attachment Upload Stuck**

**Symptoms:**
- Progress bar at 100% but not completing
- "Uploading..." shown indefinitely

**Solution:**
1. Check browser network tab for S3 PUT request
2. Verify CORS configuration on S3 bucket
3. Ensure presigned URL not expired (15-minute limit)
4. Check file size <25MB
5. Try uploading smaller file

---

**Bulk Send Not Working**

**Symptoms:**
- Campaign starts but stops after few emails
- Error: "Rate limit exceeded"

**Solution:**
1. Wait 1 minute for rate limit reset (10 emails/min)
2. Check daily limit not exceeded (100 emails/day)
3. Reduce batch size to <10 contacts for testing
4. Verify all contacts have required placeholder fields

---

**Polish Draft Returns Same Text**

**Symptoms:**
- Click style button but text doesn't change
- No visible refinement

**Solution:**
1. Ensure draft has at least 10 characters
2. Check backend logs for AI errors
3. Verify LLM API key is valid
4. Try different style option
5. Check network tab for GraphQL response

## Development

### Project Structure

```
apps/web/
├── app/                        # Next.js 14 App Router pages
│   ├── (auth)/                 # Auth-required routes
│   │   ├── compose/            # Email composer page
│   │   ├── contacts/           # Contact management
│   │   └── dashboard/          # Dashboard
│   ├── login/                  # Login page
│   └── signup/                 # Signup page
├── components/                 # React components
│   ├── email/                  # Email composition components
│   │   ├── EmailComposer.tsx
│   │   ├── AITemplateModal.tsx
│   │   ├── BulkSendModal.tsx
│   │   ├── PolishDraftModal.tsx
│   │   ├── FileUploadZone.tsx
│   │   └── SignatureSelector.tsx
│   ├── contacts/               # Contact management components
│   └── ui/                     # Shared UI components (shadcn/ui)
├── hooks/                      # Custom React hooks
│   ├── useAutoSave.ts
│   ├── useDraftRecovery.ts
│   ├── useAttachments.ts
│   └── usePolishDraft.ts
├── lib/                        # Utility libraries
│   ├── graphql/                # GraphQL queries and mutations
│   ├── supabase/               # Supabase client
│   └── utils.ts                # Shared utilities
└── e2e/                        # Playwright E2E tests
    ├── compose/                # Composer test suites
    └── contacts/               # Contacts test suites
```

### Key Technologies

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **State Management**: TanStack Query v5
- **GraphQL Client**: Apollo Client
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui + Radix UI
- **Rich Text Editor**: TipTap
- **Form Validation**: Zod + React Hook Form
- **Testing**: Playwright (E2E), Vitest (unit)

### Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test
pnpm test:e2e
```

### Environment Variables (Development)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"  # Local Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-local-anon-key"

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Production)

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-production-anon-key"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/graphql"
```

### Build Optimization

- **Static Generation**: Dashboard and marketing pages
- **Server Components**: Contact list, email history
- **Client Components**: Interactive forms, real-time features
- **Image Optimization**: Next.js Image component with WebP
- **Code Splitting**: Route-based automatic splitting
- **Bundle Analysis**: `pnpm analyze` to review bundle size

## Performance Targets

- **First Contentful Paint (FCP)**: <1.8s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Time to Interactive (TTI)**: <3.5s
- **Cumulative Layout Shift (CLS)**: <0.1

Current performance (Lighthouse):
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## Accessibility

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliance (4.5:1 minimum)
- **Focus Indicators**: Visible focus states on all inputs
- **Skip Links**: Quick navigation to main content
- **Alt Text**: All images have descriptive alt attributes

## Contributing

See root `CONTRIBUTING.md` for development guidelines.

## License

See root `LICENSE` file.
