# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-15-email-composition-gmail-integration/spec.md

> Created: 2025-10-15
> Version: 1.0.0

## GraphQL Schema

### Types

#### EmailDraft

```graphql
type EmailDraft {
  id: ID!
  userId: ID!
  contactId: ID!
  subject: String
  bodyJson: JSON!
  bodyHtml: String
  attachments: [Attachment!]!
  signature: EmailSignature
  createdAt: DateTime!
  updatedAt: DateTime!
  lastSyncedAt: DateTime

  # Relations
  user: User!
  contact: Contact!
}

type Attachment {
  key: String!        # S3 object key
  filename: String!   # Original filename
  size: Int!          # File size in bytes
  contentType: String! # MIME type
  s3Url: String!      # Pre-signed download URL (temp)
  uploadedAt: DateTime!
}
```

---

#### EmailSignature

```graphql
type EmailSignature {
  id: ID!
  userId: ID!
  name: String!
  contentJson: JSON!
  contentHtml: String!
  isDefaultForFormal: Boolean!
  isDefaultForCasual: Boolean!
  isGlobalDefault: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  usageCount: Int!

  # Relations
  user: User!
}
```

---

#### GmailConnection

```graphql
type GmailConnection {
  id: ID!
  userId: ID!
  emailAddress: String!
  isConnected: Boolean!
  scope: [String!]!
  lastUsedAt: DateTime
  createdAt: DateTime!

  # Note: Tokens not exposed via API (security)
}
```

---

### Input Types

#### CreateDraftInput

```graphql
input CreateDraftInput {
  contactId: ID!
  subject: String
  bodyJson: JSON!
  bodyHtml: String
  attachments: [AttachmentInput!]
  signatureId: ID
}

input AttachmentInput {
  key: String!
  filename: String!
  size: Int!
  contentType: String!
  s3Url: String!
}
```

---

#### UpdateDraftInput

```graphql
input UpdateDraftInput {
  subject: String
  bodyJson: JSON
  bodyHtml: String
  attachments: [AttachmentInput!]
  signatureId: ID
  lastSyncedAt: DateTime # For conflict detection
}
```

---

#### CreateSignatureInput

```graphql
input CreateSignatureInput {
  name: String!
  contentJson: JSON!
  contentHtml: String!
  isDefaultForFormal: Boolean
  isDefaultForCasual: Boolean
  isGlobalDefault: Boolean
}

input UpdateSignatureInput {
  name: String
  contentJson: JSON
  contentHtml: String
  isDefaultForFormal: Boolean
  isDefaultForCasual: Boolean
  isGlobalDefault: Boolean
}
```

---

#### SendEmailInput

```graphql
input SendEmailInput {
  contactId: ID!
  subject: String!
  bodyHtml: String!
  attachments: [AttachmentInput!]
  signatureId: ID
  draftId: ID # If sending from draft, include for deletion
}
```

---

### Queries

#### Get Email Draft

```graphql
query GetEmailDraft($contactId: ID!) {
  emailDraft(contactId: $contactId): EmailDraft
}
```

**Purpose:** Retrieve draft for specific contact (one draft per contact)
**Authorization:** User must own the contact
**Returns:** EmailDraft or null if no draft exists

---

#### List Email Drafts

```graphql
query ListEmailDrafts(
  $pagination: PaginationInput
  $sortBy: DraftSortField
  $sortOrder: SortOrder
) {
  emailDrafts(
    pagination: $pagination
    sortBy: $sortBy
    sortOrder: $sortOrder
  ): EmailDraftConnection!
}

enum DraftSortField {
  UPDATED_AT
  CREATED_AT
  CONTACT_NAME
}

type EmailDraftConnection {
  edges: [EmailDraft!]!
  pageInfo: PageInfo!
}
```

**Purpose:** List all drafts for current user
**Default Sort:** `UPDATED_AT DESC` (most recent first)
**Pagination:** Cursor-based with `take` and `skip`

---

#### Get Email Signature

```graphql
query GetEmailSignature($id: ID!) {
  emailSignature(id: $id): EmailSignature
}
```

**Purpose:** Retrieve single signature by ID
**Authorization:** User must own the signature

---

#### List Email Signatures

```graphql
query ListEmailSignatures {
  emailSignatures: [EmailSignature!]!
}
```

**Purpose:** List all signatures for current user
**Sort:** Alphabetical by name
**Max Results:** 10 per user (enforced in business logic)

---

#### Get Gmail Connection Status

```graphql
query GetGmailConnection {
  gmailConnection: GmailConnection
}
```

**Purpose:** Check if user has connected Gmail account
**Returns:** GmailConnection or null if not connected

---

### Mutations

#### Auto-Save Draft

```graphql
mutation AutoSaveDraft(
  $contactId: ID!
  $input: UpdateDraftInput!
) {
  autoSaveDraft(
    contactId: $contactId
    input: $input
  ): EmailDraft!
}
```

**Purpose:** Upsert draft (create or update)
**Conflict Handling:** Last-write-wins (checks `lastSyncedAt`)
**Rate Limit:** 60 requests/minute per user
**Returns:** Updated draft with new `updatedAt` timestamp

---

#### Delete Draft

```graphql
mutation DeleteDraft($contactId: ID!) {
  deleteDraft(contactId: $contactId): Boolean!
}
```

**Purpose:** Delete draft and cleanup S3 attachments
**Side Effects:** Removes associated S3 files via background job
**Returns:** `true` if deleted, `false` if not found

---

#### Create Email Signature

```graphql
mutation CreateEmailSignature($input: CreateSignatureInput!) {
  createEmailSignature(input: $input): EmailSignature!
}
```

**Purpose:** Create new signature
**Validation:**
- User cannot have more than 10 signatures
- If `isGlobalDefault: true`, unset other global defaults
**Returns:** Created signature

---

#### Update Email Signature

```graphql
mutation UpdateEmailSignature(
  $id: ID!
  $input: UpdateSignatureInput!
) {
  updateEmailSignature(id: $id, input: $input): EmailSignature!
}
```

**Purpose:** Update existing signature
**Validation:** Same as create
**Authorization:** User must own signature

---

#### Delete Email Signature

```graphql
mutation DeleteEmailSignature($id: ID!) {
  deleteEmailSignature(id: $id): Boolean!
}
```

**Purpose:** Delete signature
**Validation:** Cannot delete if referenced by drafts (set to null first)
**Returns:** `true` if deleted

---

#### Send Email via Gmail

```graphql
mutation SendEmailViaGmail($input: SendEmailInput!) {
  sendEmailViaGmail(input: $input): Email!
}
```

**Purpose:** Send email through user's Gmail account
**Prerequisites:**
- User must have Gmail connected (OAuth)
- Gmail tokens must be valid (auto-refreshed if expired)

**Process:**
1. Validate input (subject, body required)
2. Retrieve Gmail tokens from database (decrypt)
3. Build MIME email with attachments
4. Send via Gmail API
5. Store sent email in `emails` table with `gmailMessageId`
6. Delete draft if `draftId` provided
7. Create conversation history entry

**Rate Limit:** 100 emails/day per user (Gmail API limit)
**Returns:** Created Email record

**Error Codes:**
- `GMAIL_NOT_CONNECTED`: User hasn't connected Gmail
- `GMAIL_TOKEN_EXPIRED`: Token refresh failed
- `GMAIL_QUOTA_EXCEEDED`: Daily send limit reached
- `GMAIL_API_ERROR`: Gmail API returned error

---

#### Send Bulk Campaign via Gmail

```graphql
mutation SendBulkCampaignViaGmail($input: SendBulkCampaignInput!) {
  sendBulkCampaignViaGmail(input: $input): BulkCampaignResult!
}

input SendBulkCampaignInput {
  contactIds: [ID!]!     # Up to 100 contact IDs
  subject: String!
  bodyHtml: String!      # Can include {{firstName}} and {{company}} placeholders
  attachments: [AttachmentInput!]
  signatureId: ID
  draftId: ID           # Optional, delete draft if provided
}

type BulkCampaignResult {
  campaignId: String!   # UUID for this bulk send campaign
  totalContacts: Int!
  successCount: Int!
  failedCount: Int!
  failedContacts: [FailedEmail!]!
}

type FailedEmail {
  contactId: ID!
  contactName: String!
  error: String!
}
```

**Purpose:** Send email to multiple contacts in bulk (campaign mode)

**Prerequisites:**
- User must have Gmail connected (OAuth)
- Maximum 100 contacts per campaign

**Process:**
1. Validate input (subject, body, contactIds required)
2. Generate unique `campaignId` (UUID)
3. Check conversation history for each contact to set `isColdEmail` flag
4. Replace `{{firstName}}` and `{{company}}` placeholders per contact
5. Queue each email as separate BullMQ job
6. Rate limit: 10 emails/minute (6-second delay between sends)
7. Process jobs in parallel (max 5 concurrent sends)
8. Track successes and failures
9. Store all sent emails in `emails` table with `campaignId`
10. Delete draft if `draftId` provided

**Rate Limit:** 100 emails/day per user (cumulative with single sends)

**Returns:** Campaign result summary

**Error Codes:**
- `GMAIL_NOT_CONNECTED`: User hasn't connected Gmail
- `TOO_MANY_CONTACTS`: More than 100 contacts provided
- `CAMPAIGN_QUOTA_EXCEEDED`: Daily email limit reached
- `PARTIAL_FAILURE`: Some emails failed (check `failedContacts` for details)

---

#### Polish Draft with AI

```graphql
mutation PolishDraft($input: PolishDraftInput!) {
  polishDraft(input: $input): PolishedDraftResult!
}

input PolishDraftInput {
  roughDraft: String!   # User's rough draft text
  contextType: EmailContextType # Optional: COLD_EMAIL or FOLLOW_UP
}

enum EmailContextType {
  COLD_EMAIL
  FOLLOW_UP
}

type PolishedDraftResult {
  formal: PolishedVersion!
  casual: PolishedVersion!
  elaborate: PolishedVersion!
  concise: PolishedVersion!
}

type PolishedVersion {
  content: String!
  wordCount: Int!
  wordCountDiff: Int!   # Difference from original (-20 means 20% shorter)
}
```

**Purpose:** Refine user's rough draft into 4 polished versions with different styles

**Process:**
1. Validate input (roughDraft required)
2. Send roughDraft to AI service (OpenRouter → Gemini → OpenAI → Anthropic)
3. Generate 4 versions in single LLM call with 4 style prompts:
   - **Formal**: Professional, structured, business-appropriate
   - **Casual**: Friendly, approachable, conversational
   - **Elaborate**: Comprehensive with additional context and detail
   - **Concise**: Essential points only, remove filler
4. Calculate word counts and differences
5. Return all 4 versions

**Rate Limit:** 20 requests/minute per user

**Returns:** 4 polished versions with metadata

**Error Codes:**
- `AI_SERVICE_UNAVAILABLE`: All LLM providers failed
- `DRAFT_TOO_SHORT`: Rough draft must be at least 10 characters
- `DRAFT_TOO_LONG`: Rough draft cannot exceed 5,000 characters

---

## REST Endpoints

### Gmail OAuth Flow

#### 1. Initiate Gmail OAuth

```
GET /api/auth/gmail/authorize
```

**Purpose:** Redirect user to Google OAuth consent screen
**Parameters:** None (userId from JWT)
**Response:** 302 Redirect to Google OAuth URL

**Google OAuth URL:**
```
https://accounts.google.com/o/oauth2/v2/auth
  ?client_id={CLIENT_ID}
  &redirect_uri={REDIRECT_URI}
  &response_type=code
  &scope=https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly
  &access_type=offline
  &prompt=consent
```

---

#### 2. OAuth Callback

```
GET /api/auth/gmail/callback
  ?code={AUTH_CODE}
  &state={USER_ID}
```

**Purpose:** Exchange auth code for tokens
**Process:**
1. Exchange `code` for access_token + refresh_token
2. Encrypt tokens with AES-256-GCM
3. Store in `gmail_tokens` table
4. Retrieve Gmail email address via API
5. Redirect to success page

**Response:** 302 Redirect to `/settings?gmail=success`

**Error Handling:**
- Invalid code: Redirect to `/settings?gmail=error`
- API failure: Redirect to `/settings?gmail=error`

---

#### 3. Disconnect Gmail

```
DELETE /api/auth/gmail/disconnect
```

**Purpose:** Revoke Gmail OAuth and delete tokens
**Authorization:** JWT token (userId)
**Process:**
1. Revoke tokens via Google API
2. Delete record from `gmail_tokens` table

**Response:**
```json
{
  "success": true,
  "message": "Gmail account disconnected successfully"
}
```

---

### Attachment Management

#### 1. Generate Presigned Upload URL

```
POST /api/attachments/presigned-url
```

**Purpose:** Generate presigned S3 PUT URL for direct browser upload
**Authorization:** JWT token

**Request Body:**
```json
{
  "filename": "resume.pdf",
  "contentType": "application/pdf",
  "size": 2048000 // bytes
}
```

**Validation:**
- `size` must be ≤ 25MB (26,214,400 bytes)
- `contentType` must be in whitelist: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `filename` extension must match `contentType`

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/key?signature=...",
  "key": "attachments/user-123/draft-456/resume-789.pdf",
  "expiresIn": 900 // 15 minutes
}
```

**Error Codes:**
- `FILE_TOO_LARGE`: File exceeds 25MB
- `INVALID_FILE_TYPE`: File type not allowed
- `S3_ERROR`: Failed to generate presigned URL

---

#### 2. Delete Attachment

```
DELETE /api/attachments/:key
```

**Purpose:** Delete attachment from S3 (when user removes from draft)
**Authorization:** JWT token (must own the draft)

**Parameters:**
- `key`: S3 object key (URL-encoded)

**Response:**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

---

## Rate Limiting

**Auto-Save Endpoint:**
- Limit: 60 requests per minute per user
- Strategy: Token bucket
- Exceeded: Return `429 Too Many Requests`

**Email Send Endpoint:**
- Limit: 100 emails per day per user (Gmail API limit)
- Strategy: Fixed window counter (resets daily at UTC midnight)
- Exceeded: Return `429` with `Retry-After: {seconds_until_reset}`

**Attachment Upload:**
- Limit: 20 presigned URLs per minute per user
- Strategy: Sliding window
- Exceeded: Return `429 Too Many Requests`

---

## Error Responses

### GraphQL Errors

```json
{
  "errors": [
    {
      "message": "User must own this contact",
      "extensions": {
        "code": "FORBIDDEN",
        "field": "contactId"
      }
    }
  ],
  "data": null
}
```

**Error Codes:**
- `UNAUTHENTICATED`: No valid JWT token
- `FORBIDDEN`: User lacks permission
- `NOT_FOUND`: Resource doesn't exist
- `BAD_REQUEST`: Invalid input
- `CONFLICT`: Concurrent modification detected
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

### REST Errors

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 25MB limit",
    "details": {
      "maxSize": 26214400,
      "providedSize": 30000000
    }
  }
}
```

**HTTP Status Codes:**
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid JWT)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (concurrent modification)
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error
- `503`: Service Unavailable (Gmail API down)

---

## WebSocket Events (Future Enhancement)

**Deferred to Phase 2:**
- Real-time draft synchronization across devices
- Live typing indicators
- Attachment upload progress via WebSocket

**Current Approach:**
- Polling for draft updates every 30 seconds (if multiple tabs open)
- Client-side localStorage as source of truth
