# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-10-15-email-composition-gmail-integration/spec.md

> Created: 2025-10-15
> Status: Ready for Implementation

## Tasks

- [ ] 1. Database Schema & Migrations
  - [ ] 1.1 Write tests for EmailDraft model validation
  - [ ] 1.2 Create Prisma schema for `email_drafts` table with bodyJson, attachments array, signatureId
  - [ ] 1.3 Create Prisma schema for `email_signatures` table with contentJson, default flags
  - [ ] 1.4 Create Prisma schema for `gmail_tokens` table with encrypted tokens, expiresAt
  - [ ] 1.5 Update `email_templates` table with isUserCreated, category, usageCount fields
  - [ ] 1.6 Update `emails` table with gmailMessageId, gmailThreadId, signatureId, attachments fields
  - [ ] 1.7 Run Prisma migration (`prisma migrate dev --name email-composition-gmail`)
  - [ ] 1.8 Create seed data for test signatures and drafts
  - [ ] 1.9 Verify all tests pass

- [ ] 2. Backend - Email Draft Service
  - [ ] 2.1 Write tests for EmailDraftService (auto-save, get, list, delete)
  - [ ] 2.2 Create `apps/api/src/email-draft/` module with NestJS CLI
  - [ ] 2.3 Implement EmailDraftService with Prisma operations
  - [ ] 2.4 Implement `autoSaveDraft()` with conflict detection (lastSyncedAt comparison)
  - [ ] 2.5 Implement `getDraftByContact()` with authorization check
  - [ ] 2.6 Implement `listDrafts()` with pagination and sorting
  - [ ] 2.7 Implement `deleteDraft()` with S3 cleanup job queuing
  - [ ] 2.8 Verify all tests pass (unit tests for service layer)

- [ ] 3. Backend - Email Signature Service
  - [ ] 3.1 Write tests for EmailSignatureService (CRUD, default flags logic)
  - [ ] 3.2 Create `apps/api/src/email-signature/` module with NestJS CLI
  - [ ] 3.3 Implement EmailSignatureService with Prisma
  - [ ] 3.4 Implement `createSignature()` with max 10 signatures enforcement
  - [ ] 3.5 Implement `createSignature()` with default flag conflict resolution (unset others)
  - [ ] 3.6 Implement `updateSignature()` with same default flag logic
  - [ ] 3.7 Implement `listSignatures()` sorted alphabetically
  - [ ] 3.8 Implement `deleteSignature()` with referential integrity (set drafts to null)
  - [ ] 3.9 Implement `getDefaultSignature()` with context-based selection (formal/casual/global)
  - [ ] 3.10 Verify all tests pass

- [ ] 4. Backend - Gmail OAuth Service
  - [ ] 4.1 Write tests for GmailOAuthService (auth URL, token exchange, refresh, disconnect)
  - [ ] 4.2 Install `googleapis` package and configure Google API client
  - [ ] 4.3 Create `apps/api/src/gmail-oauth/` module
  - [ ] 4.4 Implement `getAuthorizationUrl()` with correct scopes (gmail.send, gmail.readonly)
  - [ ] 4.5 Implement `handleCallback()` to exchange auth code for tokens
  - [ ] 4.6 Implement token encryption with AES-256-GCM (encryption key from environment variable)
  - [ ] 4.7 Implement token storage in `gmail_tokens` table
  - [ ] 4.8 Implement `refreshTokenIfNeeded()` with expiry check
  - [ ] 4.9 Implement `disconnect()` with Google API token revocation
  - [ ] 4.10 Verify all tests pass

- [ ] 5. Backend - Gmail Send Service
  - [ ] 5.1 Write tests for GmailSendService (MIME email construction, attachment handling, API sending)
  - [ ] 5.2 Create `apps/api/src/gmail-send/` module
  - [ ] 5.3 Implement `buildMimeEmail()` with RFC 2822 format (headers + body)
  - [ ] 5.4 Implement multipart MIME with base64 encoded attachments
  - [ ] 5.5 Implement `sendEmail()` via Gmail API (`/gmail/v1/users/me/messages/send`)
  - [ ] 5.6 Implement error handling for Gmail API errors (401, 429, 500) with retry logic
  - [ ] 5.7 Implement sent email storage in `emails` table with gmailMessageId
  - [ ] 5.8 Implement draft deletion after successful send
  - [ ] 5.9 Implement conversation history entry creation
  - [ ] 5.10 Verify all tests pass

- [ ] 6. Backend - Attachment Service
  - [ ] 6.1 Write tests for AttachmentService (presigned URL generation, file validation, S3 deletion)
  - [ ] 6.2 Install AWS SDK packages (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
  - [ ] 6.3 Create `apps/api/src/attachment/` module
  - [ ] 6.4 Implement `generatePresignedUploadUrl()` with file type whitelist validation
  - [ ] 6.5 Implement file size validation (≤25MB) before presigned URL generation
  - [ ] 6.6 Implement S3 PUT presigned URL generation (15-minute expiry)
  - [ ] 6.7 Implement `deleteAttachment()` with user authorization check
  - [ ] 6.8 Implement `cleanupOrphanedAttachments()` background job (deletes attachments >30 days old)
  - [ ] 6.9 Configure S3 bucket CORS for PUT from app domain
  - [ ] 6.10 Verify all tests pass

- [ ] 7. Backend - GraphQL Schema & Resolvers
  - [ ] 7.1 Write tests for GraphQL resolvers (EmailDraft, EmailSignature, Gmail mutations/queries)
  - [ ] 7.2 Define GraphQL types: EmailDraft, Attachment, EmailSignature, GmailConnection
  - [ ] 7.3 Define input types: CreateDraftInput, UpdateDraftInput, CreateSignatureInput, SendEmailInput
  - [ ] 7.4 Implement `emailDraft(contactId)` query with authorization
  - [ ] 7.5 Implement `emailDrafts()` query with pagination and sorting
  - [ ] 7.6 Implement `emailSignatures()` query
  - [ ] 7.7 Implement `gmailConnection()` query (status only, no token exposure)
  - [ ] 7.8 Implement `autoSaveDraft()` mutation with rate limiting (60 req/min)
  - [ ] 7.9 Implement `deleteDraft()` mutation
  - [ ] 7.10 Implement `createEmailSignature()`, `updateEmailSignature()`, `deleteEmailSignature()` mutations
  - [ ] 7.11 Implement `sendEmailViaGmail()` mutation with Gmail integration
  - [ ] 7.12 Add rate limiting for email send (100 emails/day per user)
  - [ ] 7.13 Verify all tests pass

- [ ] 8. Backend - REST API Endpoints
  - [ ] 8.1 Write tests for Gmail OAuth REST endpoints
  - [ ] 8.2 Implement `GET /api/auth/gmail/authorize` redirect endpoint
  - [ ] 8.3 Implement `GET /api/auth/gmail/callback` with auth code exchange
  - [ ] 8.4 Implement `DELETE /api/auth/gmail/disconnect` endpoint
  - [ ] 8.5 Write tests for attachment REST endpoints
  - [ ] 8.6 Implement `POST /api/attachments/presigned-url` endpoint
  - [ ] 8.7 Implement `DELETE /api/attachments/:key` endpoint
  - [ ] 8.8 Add rate limiting middleware to attachment endpoints
  - [ ] 8.9 Verify all tests pass

- [ ] 9. Frontend - TipTap Editor Component
  - [ ] 9.1 Write tests for EmailComposer component (rendering, formatting, toolbar)
  - [ ] 9.2 Install TipTap packages (`@tiptap/react`, `@tiptap/starter-kit`, extensions)
  - [ ] 9.3 Create `apps/web/components/email/EmailComposer.tsx` component
  - [ ] 9.4 Implement TipTap editor with starter kit (Bold, Italic, Underline, Lists)
  - [ ] 9.5 Implement custom toolbar with button states reflecting current selection
  - [ ] 9.6 Add keyboard shortcuts (Cmd/Ctrl+B, I, U for formatting)
  - [ ] 9.7 Implement subject input field with character count
  - [ ] 9.8 Implement recipient field (pre-populated from contact)
  - [ ] 9.9 Implement placeholder text: "Compose your email..."
  - [ ] 9.10 Style editor with Tailwind CSS (min-height: 300px, max-height: 600px with scroll)
  - [ ] 9.11 Verify all tests pass

- [ ] 10. Frontend - Auto-Save Hook
  - [ ] 10.1 Write tests for useAutoSave hook (localStorage, DB sync, conflict detection)
  - [ ] 10.2 Create `apps/web/hooks/useAutoSave.ts` hook
  - [ ] 10.3 Implement localStorage save every 2 seconds with debounce (lodash.debounce)
  - [ ] 10.4 Implement DB sync every 10 seconds with separate debounced API call
  - [ ] 10.5 Implement save status indicator ("Saving..." → "Saved 5s ago")
  - [ ] 10.6 Implement error handling (continue local saves if DB sync fails)
  - [ ] 10.7 Implement cleanup on unmount (cancel pending debounced saves)
  - [ ] 10.8 Verify all tests pass

- [ ] 11. Frontend - Draft Recovery Hook
  - [ ] 11.1 Write tests for useDraftRecovery hook (timestamp comparison, recovery flow)
  - [ ] 11.2 Create `apps/web/hooks/useDraftRecovery.ts` hook
  - [ ] 11.3 Implement localStorage timestamp comparison with DB on mount
  - [ ] 11.4 Implement recovery prompt modal (Recover / Discard buttons)
  - [ ] 11.5 Implement "Recover" action (load localStorage content)
  - [ ] 11.6 Implement "Discard" action (load DB content, clear localStorage)
  - [ ] 11.7 Implement no-prompt flow if timestamps match or localStorage empty
  - [ ] 11.8 Verify all tests pass

- [ ] 12. Frontend - File Upload Component
  - [ ] 12.1 Write tests for FileUploadZone component (drag-drop, validation, upload progress)
  - [ ] 12.2 Install `react-dropzone` package
  - [ ] 12.3 Create `apps/web/components/email/FileUploadZone.tsx` component
  - [ ] 12.4 Implement drag-and-drop zone with react-dropzone
  - [ ] 12.5 Implement file type validation (PDF, DOC, DOCX, XLS, XLSX only)
  - [ ] 12.6 Implement file size validation (25MB per file) with error messages
  - [ ] 12.7 Implement presigned URL fetch from backend
  - [ ] 12.8 Implement direct S3 upload with progress indicator (0-100%)
  - [ ] 12.9 Implement concurrent upload limiting (max 3 files at a time)
  - [ ] 12.10 Implement thumbnail generation for image attachments (Canvas API)
  - [ ] 12.11 Implement attachment removal (queue S3 deletion)
  - [ ] 12.12 Verify all tests pass

- [ ] 13. Frontend - Signature Components
  - [ ] 13.1 Write tests for SignatureSelector component (dropdown, preview, auto-selection)
  - [ ] 13.2 Create `apps/web/components/email/SignatureSelector.tsx` component
  - [ ] 13.3 Implement signature dropdown with all user signatures
  - [ ] 13.4 Implement default signature auto-selection based on context (formal/casual)
  - [ ] 13.5 Implement manual signature switching
  - [ ] 13.6 Implement signature preview on hover
  - [ ] 13.7 Write tests for SignatureManager component (CRUD, settings page)
  - [ ] 13.8 Create `apps/web/components/settings/SignatureManager.tsx` component
  - [ ] 13.9 Implement signature list with preview cards
  - [ ] 13.10 Implement "Create Signature" modal with TipTap editor
  - [ ] 13.11 Implement default flag checkboxes (global, formal, casual)
  - [ ] 13.12 Implement signature edit and delete with confirmation
  - [ ] 13.13 Implement max 10 signatures enforcement (disable "Create" button)
  - [ ] 13.14 Verify all tests pass

- [ ] 14. Frontend - AI Template Modal
  - [ ] 14.1 Write tests for AITemplateModal component (loading, template display, regeneration)
  - [ ] 14.2 Create `apps/web/components/email/AITemplateModal.tsx` component
  - [ ] 14.3 Implement "Generate with AI" button in composer
  - [ ] 14.4 Implement modal with loading state (spinner, 2-5s expected)
  - [ ] 14.5 Implement formal and casual template display with preview
  - [ ] 14.6 Implement "Use This Template" button (loads into composer)
  - [ ] 14.7 Implement "Regenerate" button (triggers new AI generation)
  - [ ] 14.8 Implement error state (AI generation failed)
  - [ ] 14.9 Implement modal close on "Cancel" or template selection
  - [ ] 14.10 Verify all tests pass

- [ ] 15. Frontend - Gmail OAuth Integration
  - [ ] 15.1 Write tests for useGmailAuth hook (OAuth popup, callback handling)
  - [ ] 15.2 Install `@react-oauth/google` package
  - [ ] 15.3 Create `apps/web/hooks/useGmailAuth.ts` hook
  - [ ] 15.4 Implement "Connect Gmail" button in Settings
  - [ ] 15.5 Implement OAuth popup window opening (redirect to `/api/auth/gmail/authorize`)
  - [ ] 15.6 Implement callback message listener (postMessage from popup)
  - [ ] 15.7 Implement connection status polling after callback
  - [ ] 15.8 Implement error handling (user cancels, invalid permissions)
  - [ ] 15.9 Implement "Disconnect Gmail" button with confirmation
  - [ ] 15.10 Verify all tests pass

- [ ] 16. Frontend - Template Library UI
  - [ ] 16.1 Write tests for TemplateLibrary component (list, load, save, delete)
  - [ ] 16.2 Create `apps/web/components/email/TemplateLibrary.tsx` component
  - [ ] 16.3 Implement "Save as Template" button in composer
  - [ ] 16.4 Implement save template modal with name input and category selection
  - [ ] 16.5 Implement template list view (grouped by category: follow-up, introduction, thank-you)
  - [ ] 16.6 Implement template preview cards with hover effect
  - [ ] 16.7 Implement "Load Template" action (loads into composer)
  - [ ] 16.8 Implement template edit modal (update name, category, content)
  - [ ] 16.9 Implement template delete with confirmation dialog
  - [ ] 16.10 Verify all tests pass

- [ ] 17. Integration Testing
  - [ ] 17.1 Write E2E test for complete email composition workflow
  - [ ] 17.2 Test: Load composer → Generate AI template → Edit → Upload attachment → Send via Gmail
  - [ ] 17.3 Test: Auto-save localStorage (2s) → DB sync (10s) → Save indicator updates
  - [ ] 17.4 Test: Browser crash → Recovery prompt → Restore draft from localStorage
  - [ ] 17.5 Test: Gmail OAuth flow → Connect → Send email → Verify in Gmail inbox
  - [ ] 17.6 Test: Signature auto-selection → Formal template → Formal signature loaded
  - [ ] 17.7 Test: Template library → Save draft as template → Load template → Edit and send
  - [ ] 17.8 Verify all integration tests pass

- [ ] 18. Security & Performance
  - [ ] 18.1 Run Semgrep scan on email composition code (focus: XSS, file upload, OAuth)
  - [ ] 18.2 Test file upload security (reject .exe, .py, .json, >25MB files)
  - [ ] 18.3 Test Gmail token encryption (verify tokens never in API responses)
  - [ ] 18.4 Test authorization (user cannot access other users' drafts/signatures)
  - [ ] 18.5 Test rate limiting (60 auto-saves/min, 100 emails/day)
  - [ ] 18.6 Performance test: Auto-save localStorage (<5ms) and DB sync (<200ms)
  - [ ] 18.7 Performance test: File upload (25MB in <10s)
  - [ ] 18.8 Performance test: Email send with attachments (<5s total)
  - [ ] 18.9 Verify 80%+ test coverage
  - [ ] 18.10 Fix any Semgrep findings or performance issues

- [ ] 19. Documentation & Environment Setup
  - [ ] 19.1 Update `.env.example` with Gmail OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
  - [ ] 19.2 Update `.env.example` with AWS S3 configuration (S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  - [ ] 19.3 Update `.env.example` with encryption key for Gmail tokens (ENCRYPTION_KEY)
  - [ ] 19.4 Create Gmail API project setup guide (`docs/GMAIL_OAUTH_SETUP.md`)
  - [ ] 19.5 Create S3 bucket configuration guide (`docs/S3_ATTACHMENT_SETUP.md`)
  - [ ] 19.6 Update `apps/web/README.md` with email composer usage documentation
  - [ ] 19.7 Update GraphQL schema documentation comments
  - [ ] 19.8 Create troubleshooting guide for common issues (OAuth errors, S3 upload failures)

- [ ] 20. Final Verification & PR
  - [ ] 20.1 Run full test suite (unit + integration + E2E) and verify all passing
  - [ ] 20.2 Test manual flow: Compose → AI generate → Upload → Auto-save → Recover → Send
  - [ ] 20.3 Test Gmail OAuth connection in staging environment
  - [ ] 20.4 Test S3 attachment upload in staging environment
  - [ ] 20.5 Verify email sent via Gmail API appears in actual Gmail inbox
  - [ ] 20.6 Run Semgrep final security scan (0 critical findings)
  - [ ] 20.7 Verify test coverage meets 80% minimum
  - [ ] 20.8 Create pull request with comprehensive description
  - [ ] 20.9 Update roadmap.md to mark "Email Composition Interface" and "Gmail OAuth Integration" as complete
