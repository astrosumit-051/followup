# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-10-15-email-composition-gmail-integration/spec.md

> Created: 2025-10-15
> Version: 1.0.0

## Test Coverage

### Unit Tests

#### Frontend Components

**EmailComposer Component**
- Renders TipTap editor with toolbar
- Toolbar buttons toggle formatting (bold, italic, underline)
- Subject input validates and shows character count
- Recipient field is pre-populated from contact
- Signature dropdown shows all user signatures
- Auto-save indicator updates correctly ("Saving..." → "Saved 5s ago")
- Draft recovery prompt appears when localStorage newer than DB
- "Generate with AI" button opens modal
- Template loading replaces editor content
- Attachment area shows uploaded files
- Delete attachment removes from list and marks for S3 deletion

**AITemplateModal Component**
- Shows loading state during generation (2-5s)
- Displays formal and casual template options
- "Use This Template" button loads content into composer
- "Regenerate" button triggers new AI generation
- Modal closes on "Cancel" or template selection
- Error state shows when AI generation fails
- Regeneration preserves contact context

**FileUploadZone Component**
- Drag-and-drop zone is visible and accessible
- File type validation (PDF, DOC, DOCX, XLS, XLSX only)
- File size validation (25MB per file)
- Upload progress indicator updates (0-100%)
- Multiple files upload concurrently (max 3 at a time)
- Error messages show for invalid files
- Thumbnail generation for image attachments
- Upload completion adds file to attachments list

**SignatureSelector Component**
- Dropdown lists all user signatures
- Default signature pre-selected based on context (formal/casual)
- Manual selection updates signature in composer
- "Manage Signatures" link opens settings page
- Signature preview shown on hover

**SignatureManager Component (Settings Page)**
- Lists all user signatures with preview
- "Create Signature" button opens form
- TipTap editor for signature editing
- Checkbox toggles for default flags (global, formal, casual)
- Save updates signature in database
- Delete shows confirmation dialog
- Maximum 10 signatures enforced (disable "Create" button)

---

#### Frontend Hooks

**useAutoSave Hook**
- Saves to localStorage every 2 seconds (debounced)
- Syncs to database every 10 seconds (debounced)
- Updates save indicator with timestamp
- Cancels pending saves on unmount
- Handles errors gracefully (continues local saves)

**useDraftRecovery Hook**
- Compares localStorage timestamp with DB on mount
- Shows recovery prompt if localStorage is newer
- Loads localStorage content on "Recover"
- Loads DB content on "Discard" and clears localStorage
- No prompt if timestamps match or localStorage empty

**useGmailAuth Hook**
- Opens Gmail OAuth popup window
- Listens for callback message from popup
- Updates connection status on success
- Handles OAuth errors (user cancels, invalid permissions)
- Polls for connection status after callback

---

#### Backend Services

**EmailDraftService**
- `autoSaveDraft()`: Creates draft if not exists, updates if exists
- `autoSaveDraft()`: Handles conflict detection (compares `lastSyncedAt`)
- `autoSaveDraft()`: Returns updated draft with new timestamp
- `getDraftByContact()`: Returns draft for specific contact
- `listDrafts()`: Paginates drafts sorted by `updatedAt`
- `deleteDraft()`: Deletes draft and queues S3 cleanup job
- `deleteDraft()`: Returns false if draft not found

**EmailSignatureService**
- `createSignature()`: Enforces max 10 signatures per user
- `createSignature()`: Unsets other global defaults if `isGlobalDefault: true`
- `createSignature()`: Unsets other formal defaults if `isDefaultForFormal: true`
- `updateSignature()`: Same default flag logic as create
- `listSignatures()`: Returns all signatures sorted alphabetically
- `deleteSignature()`: Sets `signatureId` to null in referencing drafts
- `getDefaultSignature()`: Returns correct default based on context (formal/casual/global)

**GmailOAuthService**
- `getAuthorizationUrl()`: Generates Google OAuth URL with correct scopes
- `handleCallback()`: Exchanges auth code for tokens
- `handleCallback()`: Encrypts tokens before storage
- `handleCallback()`: Retrieves Gmail email address
- `refreshTokenIfNeeded()`: Checks expiry and refreshes access token
- `disconnect()`: Revokes tokens via Google API
- `disconnect()`: Deletes record from database

**GmailSendService**
- `sendEmail()`: Builds RFC 2822 MIME email
- `sendEmail()`: Encodes email to base64
- `sendEmail()`: Sends via Gmail API with attachments
- `sendEmail()`: Stores `gmailMessageId` in database
- `sendEmail()`: Deletes draft if `draftId` provided
- `sendEmail()`: Creates conversation history entry
- `sendEmail()`: Handles Gmail API errors (401, 429, 500)

**AttachmentService**
- `generatePresignedUploadUrl()`: Validates file type (whitelist)
- `generatePresignedUploadUrl()`: Validates file size (≤25MB)
- `generatePresignedUploadUrl()`: Generates S3 PUT presigned URL
- `generatePresignedUploadUrl()`: Returns URL expiring in 15 minutes
- `deleteAttachment()`: Verifies user owns the draft
- `deleteAttachment()`: Deletes S3 object
- `cleanupOrphanedAttachments()`: Background job deletes attachments >30 days old

---

### Integration Tests

**Email Composition Workflow**
1. User loads composer for contact
2. System fetches existing draft (if any)
3. User types in subject and body
4. Auto-save updates localStorage after 2s
5. DB sync occurs after 10s
6. Save indicator updates correctly
7. User uploads PDF attachment
8. Presigned URL generated successfully
9. File uploads to S3 with progress
10. Attachment appears in draft
11. User sends email via Gmail
12. Email sent successfully with `gmailMessageId`
13. Draft deleted after send
14. Conversation history entry created

**AI Template Integration**
1. User clicks "Generate with AI"
2. Modal opens with loading state
3. AI generates formal and casual templates (uses existing AI backend)
4. Templates displayed in modal
5. User selects "Formal" template
6. Template content loads into TipTap editor
7. Subject and body populate correctly
8. User edits template (adds bullets)
9. Auto-save persists changes
10. User sends email successfully

**Draft Recovery Flow**
1. User composes email with attachments
2. localStorage saves every 2s
3. DB syncs after 10s (last sync: 10:00:00)
4. User continues typing (localStorage updated: 10:00:12)
5. Browser crashes at 10:00:15 (DB still at 10:00:00)
6. User reopens browser at 10:01:00
7. System detects localStorage (10:00:12) newer than DB (10:00:00)
8. Recovery prompt appears
9. User clicks "Recover"
10. All content + attachments restored from localStorage
11. User continues composing

**Gmail OAuth Flow**
1. User navigates to Settings → Email
2. User clicks "Connect Gmail"
3. System redirects to Google OAuth consent screen
4. User grants permissions
5. Google redirects to callback URL with auth code
6. Backend exchanges code for tokens
7. Tokens encrypted and stored in database
8. Gmail email address retrieved and displayed
9. Connection status updates to "Connected"
10. User can now send emails via Gmail

**Signature Management**
1. User creates "Formal Signature"
2. User sets `isDefaultForFormal: true`
3. User creates "Casual Signature"
4. User sets `isDefaultForCasual: true`
5. User generates formal AI template
6. Composer auto-selects "Formal Signature"
7. User manually switches to "Casual Signature"
8. Signature preview updates in editor
9. User sends email
10. Sent email includes selected signature

---

### E2E Tests (Playwright)

**Complete Email Composition & Send**
- Navigate to contact detail page
- Click "Compose Email" button
- Generate email with AI (formal template)
- Template loads into composer
- Type additional content
- Wait for auto-save indicator ("Saved")
- Upload PDF attachment via drag-and-drop
- Wait for upload progress to complete (100%)
- Select signature from dropdown
- Click "Send Email"
- Verify success message
- Verify email appears in conversation history
- Verify draft deleted
- Verify email sent via Gmail API (check inbox)

**Draft Auto-Save & Recovery**
- Navigate to composer
- Type subject and body content
- Wait for localStorage save (2s)
- Wait for DB sync (10s)
- Verify save indicator shows "Saved 5s ago"
- Simulate browser crash (close tab)
- Reopen tab and navigate to composer
- Verify recovery prompt appears
- Click "Recover"
- Verify all content restored
- Verify attachments present

**Gmail OAuth Connection**
- Navigate to Settings → Email
- Click "Connect Gmail"
- Verify redirect to Google OAuth
- Grant permissions (in test Google account)
- Verify redirect to callback URL
- Verify success message
- Verify Gmail email address displayed
- Verify "Disconnect" button enabled
- Click "Disconnect"
- Verify connection removed
- Verify "Connect Gmail" button re-enabled

**Signature CRUD Operations**
- Navigate to Settings → Signatures
- Click "Create Signature"
- Enter name: "Test Signature"
- Type signature content in TipTap editor
- Set `isGlobalDefault: true`
- Click "Save"
- Verify signature appears in list
- Click "Edit" on signature
- Update content
- Click "Save"
- Verify changes persisted
- Click "Delete"
- Confirm deletion
- Verify signature removed from list

**Attachment Upload & Removal**
- Navigate to composer
- Drag PDF file onto upload zone
- Verify upload progress indicator
- Wait for upload completion
- Verify file appears in attachments list
- Verify file size and type displayed
- Click "Remove" on attachment
- Verify file removed from UI
- Verify S3 deletion queued (check logs)

---

### Performance Tests

**Auto-Save Performance**
- Measure localStorage write time (target: <5ms)
- Measure DB sync time (target: <200ms)
- Verify no typing lag during auto-save
- Test with large documents (10,000 characters)
- Verify save indicator updates smoothly

**File Upload Performance**
- Upload 25MB file (target: <10 seconds)
- Upload 3 files concurrently (target: <15 seconds total)
- Verify progress indicators update correctly
- Test network throttling (3G speed)

**Email Send Performance**
- Send email with no attachments (target: <2 seconds)
- Send email with 3 attachments (25MB total) (target: <5 seconds)
- Verify Gmail API response times
- Test retry logic for Gmail API errors

---

### Security Tests

**File Upload Security**
- Attempt upload with `.exe` file (should reject)
- Attempt upload with `.py` file (should reject)
- Attempt upload with 30MB file (should reject)
- Attempt upload with spoofed MIME type (should validate)
- Verify presigned URLs expire after 15 minutes

**OAuth Token Security**
- Verify tokens never exposed in API responses
- Verify tokens encrypted in database
- Verify token refresh before expiry
- Verify OAuth scopes match requirements (gmail.send, gmail.readonly)

**Authorization**
- Attempt to access another user's draft (should 403)
- Attempt to delete another user's signature (should 403)
- Attempt to send email without Gmail connected (should error)

**XSS Prevention**
- Insert `<script>alert('XSS')</script>` in email body (should sanitize)
- Insert malicious link in signature (should sanitize)
- Verify TipTap + DOMPurify sanitization working

---

### Mocking Requirements

**Gmail API Mock**
- Mock OAuth token exchange endpoint
- Mock Gmail send API (`/gmail/v1/users/me/messages/send`)
- Mock Gmail message retrieval for testing
- Mock token refresh endpoint

**S3 Mock**
- Mock presigned URL generation
- Mock file upload to S3 (use local filesystem in tests)
- Mock file deletion

**AI Service Mock**
- Mock `generateEmailTemplate` mutation (reuse existing AI spec mocks)
- Return predefined formal/casual templates

**External Services**
- Use `msw` (Mock Service Worker) for API mocking
- Use `nock` for Node.js HTTP mocking (backend tests)
- Use `jest.mock()` for service layer mocking

---

## Test Coverage Goals

**Minimum Coverage: 80%**

**By Layer:**
- Frontend Components: 85% (high user-facing impact)
- Frontend Hooks: 90% (complex business logic)
- Backend Services: 85% (critical path for email sending)
- API Resolvers: 80% (well-defined inputs/outputs)
- Database Layer: 75% (mostly covered by service tests)

**Critical Paths (100% Coverage Required):**
- Gmail OAuth flow (security-critical)
- Email sending via Gmail API (core feature)
- Auto-save and draft recovery (data loss prevention)
- File upload security (prevents malicious uploads)

---

## Test Execution Strategy

**Local Development:**
```bash
# Unit tests (frontend + backend)
pnpm test

# E2E tests (requires running app)
pnpm test:e2e

# Performance tests (separate suite)
pnpm test:performance
```

**CI/CD Pipeline:**
1. Run unit tests on every commit
2. Run integration tests on PR creation
3. Run E2E tests on PR approval (before merge)
4. Run performance tests nightly
5. Generate coverage report and fail if <80%

**Test Data Setup:**
- Use Prisma seed scripts for test database
- Create test Gmail account for OAuth testing
- Create test S3 bucket for attachment uploads
- Use environment variable flags for test mode (`NODE_ENV=test`)
