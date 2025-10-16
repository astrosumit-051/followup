# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-15-email-composition-gmail-integration/spec.md

> Created: 2025-10-15
> Version: 1.0.0

## Technical Requirements

### Frontend Requirements

**TipTap Editor:**
- TipTap v2.1+ with React integration (`@tiptap/react`, `@tiptap/starter-kit`)
- Extensions: Bold, Italic, Underline, BulletList, OrderedList, Heading, Link, TextAlign
- Keyboard shortcuts: Cmd/Ctrl+B (bold), Cmd/Ctrl+I (italic), Cmd/Ctrl+U (underline)
- Toolbar component with button states reflecting current selection
- Placeholder text: "Compose your email..." when empty
- Min height: 300px, max height: 600px with scroll

**File Upload:**
- React Dropzone library for drag-and-drop support
- Accepted file types: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`
- File size validation: 25MB per file (client-side check before upload)
- Multiple file support: Up to 10 files per email
- Upload progress indicator per file (0-100%)
- AWS SDK for direct S3 upload with presigned URLs
- Thumbnail generation for image attachments using browser Canvas API

**Auto-Save:**
- localStorage key: `email-draft-${userId}-${contactId}`
- Save interval: 2 seconds (debounced using `lodash.debounce`)
- DB sync interval: 10 seconds (separate debounced function)
- Save indicator component: "Saving..." → "Saved X seconds ago"
- Recovery detection: Compare localStorage timestamp vs. DB `updatedAt`
- Recovery UI: Modal with "Recover" and "Discard" buttons

**Gmail OAuth:**
- Google OAuth 2.0 library: `@react-oauth/google`
- Scopes required: `gmail.send`, `gmail.readonly`
- OAuth callback: `/auth/gmail/callback`
- Token storage: Encrypted in database, not localStorage
- Token refresh: Automatic refresh before expiry using refresh token

### Backend Requirements

**Gmail API Integration:**
- Google API Node.js client: `googleapis` package
- Base64 encoding for email MIME construction
- RFC 2822 email format with headers (To, Subject, From)
- Attachment handling: Multipart MIME with base64 encoded files
- Rate limiting: 250 quota units per user per second (Gmail API limit)
- Error handling: Retry with exponential backoff for 429 errors

**Email Draft Storage:**
- Store draft metadata in `email_drafts` table
- Store rich text content as JSON (Tiptap document format)
- Store S3 attachment URLs array (not file contents)
- Auto-save endpoint: `POST /api/drafts/autosave` (no auth required for same user)
- Conflict resolution: Last-write-wins with client-side timestamp comparison

**Email Signature Storage:**
- Store signatures in `email_signatures` table
- Rich text content as JSON (Tiptap format)
- Context flags: `isDefaultForFormal`, `isDefaultForCasual`
- Maximum 10 signatures per user
- CRUD endpoints: `POST /api/signatures`, `GET /api/signatures`, `PUT /api/signatures/:id`, `DELETE /api/signatures/:id`

**Template Storage:**
- Store templates in `email_templates` table (already exists from AI spec)
- Add fields: `isUserCreated`, `category` (follow-up, introduction, thank-you)
- Template CRUD: GraphQL mutations leveraging existing schema
- Template usage tracking: `usageCount` field incremented on load

### Standalone Compose Page Layout

**Page Structure:**
- Route: `/compose` (new page, not modal)
- Layout: CSS Grid with `grid-template-columns: 30% 70%`
- Left Sidebar (30%): Contact selection with search/filter
- Right Composer (70%): Email editor, attachments, signatures
- Sticky sidebar: Scrollable contact list, composer scrolls independently
- Responsive: On mobile (<768px), switch to single column with contact selector at top

**Navigation:**
- Main menu item: "Compose" tab alongside Dashboard, Contacts
- Deep linking: `/compose?contactId={id}` pre-selects contact from URL param
- Breadcrumb: "Compose > {Contact Name}" when contact selected

### Contact Selection Sidebar

**Contact List:**
- Fetch all contacts with GraphQL query (no pagination initially, optimize later if needed)
- Display: Avatar, name, company, priority badge
- Multi-select: Checkboxes for campaign mode (Shift+Click for range selection)
- Selected counter: "5 contacts selected" badge at top of composer
- Clear selection: "Clear all" button when >0 selected

**Search & Filter:**
- Search bar: Debounced text search (500ms) across name, email, company fields
- Filters (stacked dropdowns):
  - **Company** - Multi-select dropdown with autocomplete
  - **Industry** - Multi-select dropdown (Technology, Finance, Healthcare, etc.)
  - **Role** - Multi-select dropdown (CEO, Engineer, Designer, etc.)
  - **Gender** - Single-select dropdown (Male, Female, Other, Prefer not to say)
  - **Birthday Month** - Multi-select dropdown (Jan, Feb, ..., Dec)
  - **Priority** - Multi-select chips (High, Medium, Low)
- Filter logic: AND across categories, OR within category (e.g., "Tech OR Finance" AND "High priority")
- Active filters indicator: "5 filters applied" badge with clear button
- Filter persistence: Store in URL params for shareable links

### Bulk Email Campaign Mode

**Selection Workflow:**
- User clicks checkboxes on multiple contacts (max 100 per campaign)
- Selected contacts highlighted with blue background
- Counter updates in real-time: "Sending to 20 contacts"
- Validation: Show error if >100 selected: "Campaign limit is 100 contacts"

**Send Logic:**
- Queue emails via BullMQ job for each recipient
- Rate limiting: 10 emails/minute (6-second delay between sends)
- Progress indicator: "Sending email 5 of 20..." with progress bar
- Parallel processing: Max 5 concurrent email sends
- Error handling: Continue on failure, show summary: "18 sent, 2 failed"
- Conversation history: Create entry for each recipient with individual timestamps
- Draft cleanup: Delete draft after successful campaign send

**Campaign Email Personalization:**
- Replace `{{firstName}}` placeholder with contact's first name
- Replace `{{company}}` with contact's company name
- AI template generation considers multiple recipients (generic tone)

### A/B Template Side-by-Side Display

**UI Layout:**
- Modal overlay with 80% viewport width, max 1200px
- Two-column grid: Template A (left 50%) | Template B (right 50%)
- Vertical divider between templates
- Responsive: On mobile, switch to tabs ("Formal" tab | "Casual" tab)

**Template Cards:**
- **Header**: "Template A: Formal" with badge color (blue for formal, green for casual)
- **Preview**: Email content in styled box (max-height: 400px, scrollable)
- **Action Button**: "Use Template A" primary button at bottom of each card
- **Regenerate**: Single "Regenerate Both" button below templates

**Loading State:**
- Skeleton loaders for both columns during 2-5s AI generation
- Spinner with text: "Generating email templates..."
- Disable buttons until generation completes

**Selection Flow:**
```
1. User clicks "Generate with AI" in composer
2. Modal opens with loading skeletons
3. Backend generates both templates in parallel (multi-provider LLM)
4. Templates populate cards simultaneously
5. User reviews and clicks "Use Template A"
6. Modal closes, Template A content loads into TipTap editor
7. Subject and body fields populate
```

### Polish Draft Feature

**UI Layout:**
- Modal overlay with 90% viewport width, max 1400px
- 2x2 grid layout for 4 style options:
  ```
  [ Formal     ] [ Casual    ]
  [ Elaborate  ] [ Concise   ]
  ```
- Each card: 50% width, 50% height (minus margins)
- Responsive: On mobile, single column with tabs

**Style Cards:**
- **Header**: Style name badge (Formal, Casual, Elaborate, Concise)
- **Preview**: Polished email text (max-height: 300px, scrollable)
- **Word Count**: Badge showing character count difference: "150 words (-20%)"
- **Action Button**: "Use This Version" button at bottom of each card

**Loading State:**
- Skeleton loaders for all 4 cards during AI refinement (2-4s)
- Single API call generates all 4 versions in one LLM request

**Selection Flow:**
```
1. User types rough draft in TipTap editor
2. User clicks "Polish Draft" button
3. Modal opens with 4 loading skeletons
4. Backend sends rough draft to LLM with 4 style prompts
5. LLM returns 4 refined versions in single response
6. Cards populate simultaneously
7. User reviews and clicks "Use This Version" on Formal
8. Modal closes, TipTap editor content replaced with formal version
9. Attachments and signature persist (not replaced)
```

**LLM Prompt Strategy:**
```typescript
const polishPrompt = {
  formal: "Refine this email to be professional, structured, and suitable for business communication. Maintain the core message while improving clarity and formality.",
  casual: "Refine this email to be friendly, approachable, and conversational. Keep it professional but warm and personable.",
  elaborate: "Expand this email with additional context, detail, and supporting information. Make it comprehensive while maintaining readability.",
  concise: "Condense this email to its essential points. Remove filler words and unnecessary details while preserving the core message."
};
```

### Dynamic CTA Detection & Navigation

**Contact Detail Page Logic:**
- On page load, query conversation history for contact:
  ```graphql
  query CheckConversationHistory($contactId: ID!) {
    emails(filters: { contactId: $contactId, status: SENT }) {
      totalCount
    }
  }
  ```
- If `totalCount > 0`: Show "Follow Up" button (blue, `bg-blue-600`)
- If `totalCount === 0`: Show "Cold Email" button (orange/amber, `bg-orange-500`)

**Button Behavior:**
- Both buttons navigate to `/compose?contactId={id}&type={followup|cold}`
- URL params pre-populate composer state:
  - `contactId`: Pre-select contact in sidebar
  - `type`: Display context indicator badge in composer

**Composer Context Indicator:**
- Badge displayed above TipTap editor:
  - **Follow-Up**: Blue badge with text "Follow-Up Email • {last contact date}"
  - **Cold Email**: Orange badge with text "Cold Email • First Contact"
- Badge includes icon: Follow-Up (reply icon), Cold Email (new message icon)
- Clicking badge shows conversation history sidebar (if follow-up)

**AI Template Optimization:**
- Pass `type` param to AI generation endpoint
- Cold email templates: Introduction-focused, value proposition
- Follow-up templates: Reference previous conversation, ask for update

## Approach Options

### Option A: TipTap + Direct S3 Upload (Selected)

**Implementation:**
- Frontend: TipTap React editor with custom toolbar
- Attachments: React Dropzone → Generate presigned S3 URL from backend → Direct browser upload to S3
- Auto-save: Hybrid localStorage (2s) + DB (10s) with debounced API calls
- Gmail: Google OAuth 2.0 → Store refresh token → Use Gmail API for sending

**Pros:**
- TipTap is production-ready, well-documented, extensible
- Direct S3 upload reduces server load (no file proxy)
- Hybrid auto-save provides speed + resilience
- Gmail API native integration (no SMTP complexities)

**Cons:**
- TipTap learning curve for custom extensions
- S3 presigned URL generation adds API call overhead
- localStorage has 5-10MB limit (mitigated by S3 for attachments)

**Rationale:** TipTap is the most mature React rich text editor with excellent TypeScript support. Direct S3 upload is industry standard for production apps. Hybrid auto-save balances performance with reliability.

### Option B: Lexical Editor + Server Proxy Upload (Rejected)

**Implementation:**
- Frontend: Meta's Lexical editor (newer, Facebook-backed)
- Attachments: Upload to Next.js API route → Server uploads to S3
- Auto-save: DB-only with 5-second interval
- Gmail: Same OAuth approach

**Pros:**
- Lexical is cutting-edge with Facebook backing
- Server upload allows virus scanning before S3
- Single source of truth for drafts (DB only)

**Cons:**
- Lexical has smaller ecosystem, fewer plugins
- Server proxy doubles upload time and bandwidth
- DB-only auto-save is slower and less resilient
- More complex error handling for server uploads

**Rationale:** Rejected because TipTap has better production track record, and direct S3 upload is more performant. Server virus scanning can be added later via AWS Lambda S3 triggers.

## External Dependencies

### New NPM Packages (Frontend)

**@tiptap/react** - Rich text editor React bindings
- Version: `^2.1.0`
- Justification: Industry-standard editor, excellent TypeScript support, extensible architecture
- Bundle size: ~200KB (acceptable for core feature)

**@tiptap/starter-kit** - Essential TipTap extensions bundle
- Version: `^2.1.0`
- Justification: Provides Bold, Italic, BulletList, OrderedList out of the box
- Bundle size: Included in @tiptap/react

**@tiptap/extension-link** - Hyperlink support
- Version: `^2.1.0`
- Justification: Essential for professional emails with reference links
- Bundle size: ~10KB

**@tiptap/extension-text-align** - Text alignment (left, center, right)
- Version: `^2.1.0`
- Justification: Professional email formatting requirement
- Bundle size: ~5KB

**react-dropzone** - Drag-and-drop file upload
- Version: `^14.2.0`
- Justification: Best-in-class file upload UX, accessibility support, TypeScript types
- Bundle size: ~30KB

**@aws-sdk/client-s3** - Direct S3 upload from browser
- Version: `^3.450.0`
- Justification: Official AWS SDK for S3, supports presigned URLs
- Bundle size: ~100KB (tree-shakable)

**@aws-sdk/s3-request-presigner** - Generate presigned S3 URLs
- Version: `^3.450.0`
- Justification: Required for secure direct browser uploads
- Bundle size: ~20KB

**@react-oauth/google** - Google OAuth React hooks
- Version: `^0.12.0`
- Justification: Official Google OAuth library, simplest integration
- Bundle size: ~15KB

**lodash.debounce** - Debouncing for auto-save
- Version: `^4.0.8`
- Justification: Lightweight lodash subset, battle-tested debounce implementation
- Bundle size: ~2KB

**react-select** - Multi-select dropdown for contact filters
- Version: `^5.8.0`
- Justification: Best-in-class multi-select UI, keyboard navigation, accessibility support
- Bundle size: ~45KB
- Use cases: Company filter, Industry filter, Role filter, Birthday Month filter

### New NPM Packages (Backend)

**googleapis** - Google APIs Node.js client
- Version: `^128.0.0`
- Justification: Official Google API client, supports Gmail API and OAuth
- Why needed: Send emails via Gmail API, manage OAuth tokens

**@aws-sdk/client-s3** (Backend) - S3 operations from NestJS
- Version: `^3.450.0`
- Justification: Generate presigned URLs, delete orphaned attachments
- Why needed: Secure attachment upload workflow

**@aws-sdk/s3-request-presigner** (Backend)
- Version: `^3.450.0`
- Justification: Create presigned PUT URLs for direct browser uploads
- Why needed: Allow frontend to upload files securely without exposing AWS credentials

**mime** - MIME type detection
- Version: `^4.0.0`
- Justification: Generate correct MIME types for Gmail API email construction
- Why needed: Build multipart MIME emails with attachments

### Total Bundle Size Impact
- Frontend: ~427KB (compressed: ~135KB with gzip)
  - Breakdown: TipTap ~200KB, AWS SDK ~120KB, react-select ~45KB, react-dropzone ~30KB, misc ~32KB
- Backend: ~5MB (Node.js modules, not bundled to frontend)

## Architecture Decisions

### Auto-Save Strategy: Hybrid (localStorage + DB)

**Decision:** Use localStorage for 2-second saves, sync to DB every 10 seconds

**Justification:**
- **Performance:** localStorage writes are instant (0ms), no network latency
- **Resilience:** Survives browser crashes, network failures
- **Cost:** Reduces DB write operations by 80% (1 write per 10s vs. 5 writes)
- **UX:** Users see "Saved" instantly, no typing lag

**Implementation:**
```typescript
// Auto-save hook
const useAutoSave = (content, contactId) => {
  // Local save every 2s
  useEffect(() => {
    const localSave = debounce(() => {
      localStorage.setItem(`draft-${contactId}`, JSON.stringify({
        content,
        timestamp: Date.now()
      }));
      setSaveStatus('Saved locally');
    }, 2000);

    localSave();
    return () => localSave.cancel();
  }, [content]);

  // DB sync every 10s
  useEffect(() => {
    const dbSync = debounce(async () => {
      await apiClient.post('/drafts/autosave', {
        contactId,
        content,
        timestamp: Date.now()
      });
      setSaveStatus('Synced to server');
    }, 10000);

    dbSync();
    return () => dbSync.cancel();
  }, [content]);
};
```

### Attachment Upload Strategy: Immediate S3 Upload

**Decision:** Upload files to S3 immediately on selection, not on send

**Justification:**
- **UX:** Immediate feedback with progress bar, users know upload succeeded
- **Reliability:** Files persisted even if browser crashes before send
- **Performance:** Send operation is instant (no upload wait time)
- **Draft Size:** Database stores only S3 URLs, not file blobs

**Orphan Handling:**
- S3 Lifecycle Policy: Delete attachments older than 30 days if not linked to sent email
- On draft delete: Background job removes associated S3 files
- Cost: Negligible ($0.023/GB/month for temporary orphans)

**Implementation:**
```typescript
const uploadToS3 = async (file: File) => {
  // 1. Get presigned URL from backend
  const { url, key } = await apiClient.post('/attachments/presigned-url', {
    filename: file.name,
    contentType: file.type,
    size: file.size
  });

  // 2. Direct upload to S3 with progress
  await axios.put(url, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (e) => setProgress((e.loaded / e.total) * 100)
  });

  // 3. Return S3 key for draft storage
  return { key, filename: file.name, size: file.size };
};
```

### Gmail OAuth Flow: Backend Token Storage

**Decision:** Store Gmail refresh tokens in database (encrypted), not localStorage

**Justification:**
- **Security:** Tokens encrypted at rest, never exposed to frontend
- **Persistence:** Tokens survive browser cache clears
- **Refresh:** Backend handles token refresh automatically
- **Compliance:** Follows Google OAuth security best practices

**Implementation Flow:**
```
1. Frontend: User clicks "Connect Gmail"
2. Frontend: Redirect to Google OAuth consent screen
3. Google: User grants permissions, redirects to callback URL
4. Backend: Exchanges auth code for access + refresh tokens
5. Backend: Encrypts tokens, stores in database with userId
6. Frontend: Shows "Gmail Connected" status
7. On send: Backend retrieves tokens, refreshes if needed, sends email
```

## Security Considerations

**Gmail Token Encryption:**
- Use AES-256-GCM encryption for tokens at rest
- Encryption key stored in AWS Secrets Manager
- Rotate encryption keys every 90 days
- Tokens never logged or exposed in API responses

**File Upload Security:**
- Client-side file type validation (`.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx` only)
- Server-side MIME type verification before presigned URL generation
- File size limits enforced: 25MB per file, 100MB total per email
- Presigned URLs expire after 15 minutes
- S3 bucket CORS configured for `PUT` from app domain only

**XSS Prevention in Rich Text:**
- TipTap sanitizes HTML by default (no `<script>` tags allowed)
- Additional DOMPurify sanitization before storing to database
- Render emails in sandboxed iframe when previewing

**Rate Limiting:**
- Auto-save endpoint: 60 requests per minute per user (no API key needed)
- Email send endpoint: 100 emails per day per user (Gmail free tier limit)
- Attachment upload: 20 uploads per minute per user

## Performance Targets

**Auto-Save Performance:**
- localStorage write: <5ms (p95)
- DB sync: <200ms (p95)
- Recovery detection: <100ms on page load

**Email Send Performance:**
- Gmail API send: <2 seconds (p95)
- With 3 attachments (25MB total): <5 seconds (p95)

**Editor Performance:**
- Initial render: <300ms
- Typing latency: <16ms (60fps)
- Large document (10,000 characters): No lag

**File Upload:**
- Presigned URL generation: <100ms
- Upload to S3 (25MB file): <10 seconds with progress indicator
- Parallel uploads: Max 3 concurrent to avoid throttling
