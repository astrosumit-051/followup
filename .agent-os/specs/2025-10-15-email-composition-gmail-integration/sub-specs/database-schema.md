# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-15-email-composition-gmail-integration/spec.md

> Created: 2025-10-15
> Version: 1.0.0

## Schema Changes

### New Tables

#### 1. `email_drafts`

Stores auto-saved email drafts with rich text content and attachment references.

```prisma
model EmailDraft {
  id          String   @id @default(uuid())
  userId      String
  contactId   String

  // Email content
  subject     String?
  bodyJson    Json     // TipTap document JSON format
  bodyHtml    String?  @db.Text // Rendered HTML for sending

  // Attachments (S3 URLs)
  attachments Json[]   // Array of { key, filename, size, contentType, s3Url }

  // Signature
  signatureId String?

  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastSyncedAt DateTime? // Last DB sync from localStorage

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  signature   EmailSignature? @relation(fields: [signatureId], references: [id], onDelete: SetNull)

  @@index([userId, contactId])
  @@index([userId, updatedAt])
  @@unique([userId, contactId]) // One draft per user-contact pair
}
```

**Justification:**
- `bodyJson`: Stores TipTap document format for editing (preserves formatting structure)
- `bodyHtml`: Pre-rendered HTML for Gmail API sending (avoids runtime conversion)
- `attachments`: Array of S3 metadata (not file contents) for smaller payload
- `lastSyncedAt`: Tracks DB sync timestamp for localStorage conflict resolution
- Unique constraint prevents multiple drafts per contact (latest overwrites)

---

#### 2. `email_signatures`

Stores user-created email signatures with rich text formatting and context flags.

```prisma
model EmailSignature {
  id                  String   @id @default(uuid())
  userId              String

  // Signature content
  name                String   // User-friendly name: "Formal", "Casual", "Sales Pitch"
  contentJson         Json     // TipTap document format
  contentHtml         String   @db.Text // Rendered HTML

  // Context-based selection
  isDefaultForFormal  Boolean  @default(false)
  isDefaultForCasual  Boolean  @default(false)
  isGlobalDefault     Boolean  @default(false)

  // Metadata
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  usageCount          Int      @default(0) // Track how often used

  // Relations
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailDrafts         EmailDraft[]
  sentEmails          Email[]  // Reference to sent emails using this signature

  @@index([userId])
  @@index([userId, isGlobalDefault])
}
```

**Justification:**
- `contentJson` + `contentHtml`: Same pattern as drafts for editing + sending
- Three default flags: `isGlobalDefault` (fallback), `isDefaultForFormal`, `isDefaultForCasual`
- `usageCount`: Analytics for identifying most-used signatures
- User can have max 10 signatures (enforced in business logic, not DB constraint)

---

#### 3. `gmail_tokens`

Stores encrypted Gmail OAuth tokens for sending emails via Gmail API.

```prisma
model GmailToken {
  id            String   @id @default(uuid())
  userId        String   @unique // One Gmail account per user

  // OAuth tokens (encrypted)
  accessToken   String   @db.Text // Encrypted with AES-256-GCM
  refreshToken  String   @db.Text // Encrypted with AES-256-GCM
  expiresAt     DateTime // Access token expiry

  // Gmail account info
  emailAddress  String   // user@gmail.com
  scope         String[] // ["gmail.send", "gmail.readonly"]

  // Metadata
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastUsedAt    DateTime? // Last email sent timestamp

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt]) // Query for tokens needing refresh
}
```

**Justification:**
- `accessToken` and `refreshToken` stored encrypted (never plaintext)
- `expiresAt`: Backend checks and refreshes tokens before use
- `lastUsedAt`: Track engagement, identify inactive accounts for cleanup
- `@unique` on `userId`: One Gmail connection per user (can be extended later)

---

### Modified Tables

#### 4. Update `email_templates` (Existing)

Add fields to support user-created templates from drafts.

```prisma
model EmailTemplate {
  id              String   @id @default(uuid())
  userId          String

  // Existing fields (from AI spec)
  name            String
  subject         String
  bodyJson        Json
  bodyHtml        String   @db.Text
  templateType    TemplateType
  isDefault       Boolean  @default(false)

  // NEW FIELDS for user templates
  isUserCreated   Boolean  @default(false) // vs. AI-generated
  category        String?  // "follow-up", "introduction", "thank-you", "custom"
  usageCount      Int      @default(0)     // Track popularity

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isUserCreated])
  @@index([userId, category])
}
```

**Changes:**
- `isUserCreated`: Differentiates user templates from AI-generated
- `category`: Allows filtering templates by use case
- `usageCount`: Analytics for template effectiveness

---

#### 5. Update `emails` (Existing)

Add fields to track Gmail API sending and signature usage.

```prisma
model Email {
  id              String   @id @default(uuid())
  userId          String
  contactId       String

  // Existing fields
  subject         String
  body            String   @db.Text
  status          EmailStatus
  generatedAt     DateTime @default(now())
  sentAt          DateTime?

  // NEW FIELDS
  gmailMessageId  String?  // Gmail API message ID for tracking
  gmailThreadId   String?  // Gmail thread ID for conversations
  signatureId     String?  // Signature used in this email
  attachments     Json[]   // Array of S3 URLs
  campaignId      String?  // Bulk campaign ID (for analytics on bulk sends)
  isColdEmail     Boolean  @default(false) // True if no conversation history at send time

  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  contact         Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  signature       EmailSignature? @relation(fields: [signatureId], references: [id], onDelete: SetNull)

  @@index([userId, status])
  @@index([gmailMessageId])
  @@index([campaignId]) // Query emails from same campaign
}
```

**Changes:**
- `gmailMessageId`: Required for tracking sent emails in Gmail
- `gmailThreadId`: Future support for email threading/replies
- `signatureId`: Track which signature was used (analytics)
- `attachments`: S3 URLs for sent email attachments
- `campaignId`: Groups emails from same bulk send for analytics (e.g., "View all emails from Campaign ABC")
- `isColdEmail`: Tracks if this was a cold email (no conversation history when sent), useful for response rate analytics

---

## Migration Scripts

### Migration 1: Create `email_drafts` Table

```sql
-- CreateTable
CREATE TABLE "email_drafts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "subject" TEXT,
    "bodyJson" JSONB NOT NULL,
    "bodyHtml" TEXT,
    "attachments" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "signatureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    CONSTRAINT "email_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "email_drafts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE CASCADE,
    CONSTRAINT "email_drafts_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "email_signatures" ("id") ON DELETE SET NULL
);

CREATE INDEX "email_drafts_userId_contactId_idx" ON "email_drafts"("userId", "contactId");
CREATE INDEX "email_drafts_userId_updatedAt_idx" ON "email_drafts"("userId", "updatedAt");
CREATE UNIQUE INDEX "email_drafts_userId_contactId_key" ON "email_drafts"("userId", "contactId");
```

---

### Migration 2: Create `email_signatures` Table

```sql
-- CreateTable
CREATE TABLE "email_signatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "isDefaultForFormal" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultForCasual" BOOLEAN NOT NULL DEFAULT false,
    "isGlobalDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "email_signatures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX "email_signatures_userId_idx" ON "email_signatures"("userId");
CREATE INDEX "email_signatures_userId_isGlobalDefault_idx" ON "email_signatures"("userId", "isGlobalDefault");
```

---

### Migration 3: Create `gmail_tokens` Table

```sql
-- CreateTable
CREATE TABLE "gmail_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "scope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    CONSTRAINT "gmail_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX "gmail_tokens_userId_idx" ON "gmail_tokens"("userId");
CREATE INDEX "gmail_tokens_expiresAt_idx" ON "gmail_tokens"("expiresAt");
```

---

### Migration 4: Update `email_templates` Table

```sql
-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN "isUserCreated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "email_templates" ADD COLUMN "category" TEXT;
ALTER TABLE "email_templates" ADD COLUMN "usageCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "email_templates_userId_isUserCreated_idx" ON "email_templates"("userId", "isUserCreated");
CREATE INDEX "email_templates_userId_category_idx" ON "email_templates"("userId", "category");
```

---

### Migration 5: Update `emails` Table

```sql
-- AlterTable
ALTER TABLE "emails" ADD COLUMN "gmailMessageId" TEXT;
ALTER TABLE "emails" ADD COLUMN "gmailThreadId" TEXT;
ALTER TABLE "emails" ADD COLUMN "signatureId" TEXT;
ALTER TABLE "emails" ADD COLUMN "attachments" JSONB[] DEFAULT ARRAY[]::JSONB[];
ALTER TABLE "emails" ADD COLUMN "campaignId" TEXT;
ALTER TABLE "emails" ADD COLUMN "isColdEmail" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "emails" ADD CONSTRAINT "emails_signatureId_fkey"
    FOREIGN KEY ("signatureId") REFERENCES "email_signatures" ("id") ON DELETE SET NULL;

CREATE INDEX "emails_gmailMessageId_idx" ON "emails"("gmailMessageId");
CREATE INDEX "emails_campaignId_idx" ON "emails"("campaignId");
```

---

## Indexes

**Performance Justification:**

1. `email_drafts_userId_contactId_idx`
   - Query: Find draft for specific contact (most common query)
   - Cardinality: High (unique per user-contact)

2. `email_drafts_userId_updatedAt_idx`
   - Query: List recent drafts for user
   - Cardinality: High (many drafts per user over time)

3. `email_signatures_userId_idx`
   - Query: List all signatures for user settings page
   - Cardinality: Low (max 10 signatures per user)

4. `email_signatures_userId_isGlobalDefault_idx`
   - Query: Find default signature for auto-selection
   - Cardinality: Low (1 global default per user)

5. `gmail_tokens_expiresAt_idx`
   - Query: Background job to refresh expiring tokens
   - Cardinality: Medium (all users with Gmail connected)

6. `emails_gmailMessageId_idx`
   - Query: Track email status from Gmail API webhooks
   - Cardinality: High (unique per sent email)

7. `emails_campaignId_idx`
   - Query: List all emails sent in the same bulk campaign (analytics)
   - Cardinality: Medium (100 emails per campaign, multiple campaigns per user)

---

## Data Migration

**Existing Users:**
- No data migration needed (all new tables)
- Existing `emails` and `email_templates` tables extended with nullable columns

**Seeding:**
- Create default signature for each user: "Default Signature" with basic contact info
- Set `isGlobalDefault = true` for this signature

**Rollback Strategy:**
- All new tables can be dropped safely
- New columns on existing tables are nullable (safe to remove)

---

## Storage Estimates

**email_drafts:**
- Average row size: 5KB (bodyJson + attachments array)
- Expected rows per user: 20 active drafts
- 10,000 users: 20 * 10,000 = 200,000 rows = ~1GB

**email_signatures:**
- Average row size: 2KB (contentJson + contentHtml)
- Expected rows per user: 3 signatures
- 10,000 users: 3 * 10,000 = 30,000 rows = ~60MB

**gmail_tokens:**
- Average row size: 1KB (encrypted tokens)
- Expected rows: 1 per user
- 10,000 users: 10,000 rows = ~10MB

**Total Additional Storage: ~1.07GB for 10,000 users**

**S3 Attachment Storage:**
- Average attachment size: 2MB
- Average attachments per draft: 1.5
- Active drafts: 200,000
- S3 storage: 200,000 * 1.5 * 2MB = ~600GB
- Cost: 600GB * $0.023/GB/month = ~$13.80/month
- With 30-day orphan cleanup: ~$5/month (assuming 60% are sent)
