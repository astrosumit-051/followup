# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-10-langchain-ai-email-generation/spec.md

> Created: 2025-10-10
> Version: 1.0.0

## Schema Changes

### New Tables

#### 1. `emails` Table

Stores all generated and sent emails with complete metadata for conversation history and analytics.

**Purpose:** Central repository for email content, enabling AI context building and communication tracking.

```prisma
model Email {
  id            String        @id @default(cuid())
  userId        String
  contactId     String
  subject       String
  body          String        @db.Text
  bodyHtml      String?       @db.Text // Rich text version (added in Spec 2)
  status        EmailStatus   @default(DRAFT)
  templateType  TemplateType? // FORMAL, CASUAL, CUSTOM, AI_GENERATED
  providerId    String?       // Which LLM generated this (openai, anthropic)
  tokensUsed    Int?          // API tokens consumed
  generatedAt   DateTime?     // When AI generated the template
  sentAt        DateTime?     // When email was actually sent (null for drafts)
  openedAt      DateTime?     // Email tracking (Phase 4)
  repliedAt     DateTime?     // Response received
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  contact       Contact       @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([contactId])
  @@index([status])
  @@index([sentAt])
}

enum EmailStatus {
  DRAFT          // Generated but not sent
  SCHEDULED      // Queued for sending
  SENT           // Successfully delivered
  FAILED         // Send attempt failed
  CANCELLED      // User cancelled scheduled send
}

enum TemplateType {
  FORMAL         // AI-generated professional style
  CASUAL         // AI-generated friendly style
  CUSTOM         // User-created from scratch
  AI_GENERATED   // Generic AI-generated
  TEMPLATE_BASED // Created from saved template
}
```

**Indexes:**
- `userId`: Fast retrieval of user's email history
- `contactId`: Quick lookup of conversation history with specific contact
- `status`: Filter by draft/sent/scheduled emails
- `sentAt`: Timeline queries and analytics

**Rationale:**
- `cuid()` for ID: Collision-resistant, URL-safe identifiers
- `@db.Text`: Email bodies can exceed standard VARCHAR(255) limits
- Nullable `sentAt`: Distinguishes drafts from sent emails
- `templateType`: Tracks which AI style performed better
- `providerId` + `tokensUsed`: Cost analysis and provider performance
- Cascade delete: Clean up emails when user/contact deleted

---

#### 2. `email_templates` Table

User-created email templates for reuse across multiple contacts.

**Purpose:** Template library allowing users to save and reuse effective email patterns.

```prisma
model EmailTemplate {
  id          String    @id @default(cuid())
  userId      String
  name        String    // User-friendly template name
  subject     String
  body        String    @db.Text
  bodyHtml    String?   @db.Text // Rich text version (added in Spec 2)
  isDefault   Boolean   @default(false) // User's default template
  category    String?   // e.g., "follow-up", "introduction", "thank-you"
  usageCount  Int       @default(0) // Track template popularity
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isDefault])
}
```

**Indexes:**
- `userId`: User's template library
- `isDefault`: Quick lookup of user's preferred template

**Rationale:**
- `usageCount`: Analytics for template effectiveness
- `category`: Optional grouping for large template libraries
- `isDefault`: One-click template selection
- No unique constraint on name: Users can have similar template names

---

#### 3. `conversation_history` Table

Lightweight tracking of all email interactions for AI context building.

**Purpose:** Provide AI with recent conversation context when generating follow-up emails.

```prisma
model ConversationHistory {
  id          String    @id @default(cuid())
  userId      String
  contactId   String
  emailId     String?   // Reference to emails table
  content     String    @db.Text // Concatenated subject + body for AI context
  direction   Direction // SENT or RECEIVED
  timestamp   DateTime  @default(now())
  metadata    Json?     // Store email metadata (opened, clicked, etc.)

  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  contact     Contact   @relation(fields: [contactId], references: [id], onDelete: Cascade)
  email       Email?    @relation(fields: [emailId], references: [id], onDelete: SetNull)

  @@index([userId, contactId]) // Composite index for efficient context retrieval
  @@index([timestamp])
}

enum Direction {
  SENT      // User sent this email
  RECEIVED  // User received response (Phase 4 feature)
}
```

**Indexes:**
- `[userId, contactId]`: Composite index for fast conversation history queries
- `timestamp`: Chronological sorting for AI context

**Rationale:**
- Separate table from `emails`: Supports future inbound email tracking
- `content` denormalized: Faster AI context retrieval without joins
- `Json metadata`: Flexible storage for tracking data (opens, clicks)
- `SetNull` on email delete: Preserve conversation history even if email record deleted

---

## Modified Tables

### `User` Table (Add Relations)

```prisma
model User {
  // ... existing fields ...

  // New relations
  emails              Email[]
  emailTemplates      EmailTemplate[]
  conversationHistory ConversationHistory[]
}
```

### `Contact` Table (Add Relations)

```prisma
model Contact {
  // ... existing fields ...

  // New relations
  emails              Email[]
  conversationHistory ConversationHistory[]
}
```

---

## Migration Strategy

### Migration 1: Create Core Tables

```bash
npx prisma migrate dev --name add_email_generation_tables
```

**Steps:**
1. Create `emails` table with all fields
2. Create `EmailStatus` and `TemplateType` enums
3. Create `email_templates` table
4. Create `conversation_history` table
5. Create `Direction` enum
6. Add foreign key constraints
7. Create indexes

**Rollback Plan:**
```sql
DROP TABLE conversation_history;
DROP TABLE email_templates;
DROP TABLE emails;
DROP TYPE Direction;
DROP TYPE TemplateType;
DROP TYPE EmailStatus;
```

---

## Data Integrity Constraints

1. **Foreign Keys:**
   - `emails.userId` → `users.id` (CASCADE delete)
   - `emails.contactId` → `contacts.id` (CASCADE delete)
   - `email_templates.userId` → `users.id` (CASCADE delete)
   - `conversation_history.userId` → `users.id` (CASCADE delete)
   - `conversation_history.contactId` → `contacts.id` (CASCADE delete)
   - `conversation_history.emailId` → `emails.id` (SET NULL)

2. **Business Logic Constraints:**
   - Only one `isDefault=true` template per user (enforced in application layer)
   - `sentAt` must be null for `status=DRAFT`
   - `templateType` required for `status=SENT` emails
   - `direction=SENT` requires `emailId` reference

3. **Performance Considerations:**
   - Composite index on `[userId, contactId]` for conversation queries
   - Index on `status` for draft/sent filtering
   - Index on `sentAt` for timeline analytics
   - Consider partitioning `conversation_history` by month (future optimization)

---

## Seed Data (Development/Testing)

```typescript
// Seed sample email templates for development
const sampleTemplates = [
  {
    name: "Conference Follow-up",
    subject: "Great meeting you at {event_name}!",
    body: "Hi {contact_name},\n\nIt was wonderful connecting with you at {event_name} yesterday...",
    category: "follow-up",
  },
  {
    name: "Introduction Request",
    subject: "Introduction to {target_name}",
    body: "Hi {contact_name},\n\nI hope this email finds you well. I'm reaching out to see if you might be willing to introduce me to {target_name}...",
    category: "introduction",
  },
];
```

---

## Expected Table Sizes (6 months post-launch)

- **emails:** ~100,000 records (assuming 200 users × 500 emails each)
  - Estimated size: 100MB (1KB avg per email)
  - Growth rate: ~500 records/day

- **email_templates:** ~1,000 records (200 users × 5 templates avg)
  - Estimated size: 1MB
  - Growth rate: Slow (5 records/day)

- **conversation_history:** ~100,000 records (matches email count)
  - Estimated size: 50MB (500 bytes avg per entry)
  - Growth rate: ~500 records/day

**Total Additional Storage:** ~150MB initially, growing ~1MB/day

**Database Scaling Plan:**
- Phase 2-3: Single PostgreSQL instance (sufficient)
- Phase 4: Add read replica for analytics queries
- Phase 5: Consider partitioning `conversation_history` by quarter

---

## Security Considerations

1. **Row-Level Security (RLS):**
   - Enable RLS on all three new tables
   - Users can only access their own emails/templates/history
   - Supabase RLS policies:
     ```sql
     CREATE POLICY "Users can view own emails"
       ON emails FOR SELECT
       USING (auth.uid() = user_id);

     CREATE POLICY "Users can insert own emails"
       ON emails FOR INSERT
       WITH CHECK (auth.uid() = user_id);
     ```

2. **Data Encryption:**
   - Email bodies contain sensitive information: encrypt at rest (PostgreSQL encryption)
   - Email account OAuth tokens (added in Spec 3): AES-256 encryption

3. **Data Retention:**
   - Keep all emails indefinitely (user-controlled deletion)
   - Archive conversation_history >1 year old to cold storage (Phase 5)
   - Implement soft delete for user-facing email deletion (add `deletedAt` field)
