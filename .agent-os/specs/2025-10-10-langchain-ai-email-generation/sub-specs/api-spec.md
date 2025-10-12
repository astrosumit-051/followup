# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-10-langchain-ai-email-generation/spec.md

> Created: 2025-10-10
> Version: 1.0.0

## GraphQL Schema Additions

### Types

```graphql
"""
Email record with generation metadata and content
"""
type Email {
  id: ID!
  userId: ID!
  contactId: ID!
  subject: String!
  body: String!
  bodyHtml: String
  status: EmailStatus!
  templateType: TemplateType
  providerId: String
  tokensUsed: Int
  generatedAt: DateTime
  sentAt: DateTime
  openedAt: DateTime
  repliedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  user: User!
  contact: Contact!
}

"""
Email status enumeration
"""
enum EmailStatus {
  DRAFT
  SCHEDULED
  SENT
  FAILED
  CANCELLED
}

"""
Template type enumeration
"""
enum TemplateType {
  FORMAL
  CASUAL
  CUSTOM
  AI_GENERATED
  TEMPLATE_BASED
}

"""
User-created email template
"""
type EmailTemplate {
  id: ID!
  userId: ID!
  name: String!
  subject: String!
  body: String!
  bodyHtml: String
  isDefault: Boolean!
  category: String
  usageCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!

  # Relations
  user: User!
}

"""
Conversation history entry
"""
type ConversationHistory {
  id: ID!
  userId: ID!
  contactId: ID!
  emailId: ID
  content: String!
  direction: Direction!
  timestamp: DateTime!
  metadata: JSON

  # Relations
  user: User!
  contact: Contact!
  email: Email
}

"""
Communication direction enumeration
"""
enum Direction {
  SENT
  RECEIVED
}

"""
AI-generated email template pair (formal and casual)
"""
type GeneratedEmailTemplate {
  formal: EmailVariant!
  casual: EmailVariant!
  providerId: String!
  tokensUsed: Int!
  generatedAt: DateTime!
}

"""
Single email variant (formal or casual)
"""
type EmailVariant {
  subject: String!
  body: String!
  templateType: TemplateType!
}

"""
Paginated email list response
"""
type EmailConnection {
  edges: [EmailEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type EmailEdge {
  node: Email!
  cursor: String!
}
```

---

## Queries

### 1. Get Single Email

```graphql
"""
Retrieve a single email by ID
"""
email(id: ID!): Email
```

**Authorization:** User must own the email (userId matches authenticated user)

**Example Request:**
```graphql
query GetEmail($id: ID!) {
  email(id: $id) {
    id
    subject
    body
    status
    templateType
    contact {
      id
      name
      email
    }
    generatedAt
    sentAt
  }
}
```

**Example Response:**
```json
{
  "data": {
    "email": {
      "id": "clx123abc",
      "subject": "Great meeting you at TechConf 2025!",
      "body": "Hi Sarah,\n\nIt was wonderful...",
      "status": "SENT",
      "templateType": "FORMAL",
      "contact": {
        "id": "clx456def",
        "name": "Sarah Chen",
        "email": "sarah.chen@example.com"
      },
      "generatedAt": "2025-10-10T14:30:00Z",
      "sentAt": "2025-10-10T14:35:00Z"
    }
  }
}
```

---

### 2. List Emails (Paginated)

```graphql
"""
List emails with filtering and pagination
"""
emails(
  status: EmailStatus
  contactId: ID
  first: Int = 20
  after: String
): EmailConnection!
```

**Authorization:** Returns only authenticated user's emails

**Filters:**
- `status`: Filter by DRAFT, SENT, etc.
- `contactId`: Filter by specific contact
- `first`: Number of results per page (max 100)
- `after`: Cursor for pagination

**Example Request:**
```graphql
query ListEmails($status: EmailStatus, $first: Int, $after: String) {
  emails(status: $status, first: $first, after: $after) {
    edges {
      node {
        id
        subject
        status
        templateType
        contact {
          name
        }
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

---

### 3. Get Conversation History

```graphql
"""
Retrieve conversation history with a specific contact
"""
conversationHistory(
  contactId: ID!
  first: Int = 10
): [ConversationHistory!]!
```

**Authorization:** User must own the contact

**Returns:** Last N conversation entries, sorted by timestamp DESC

**Example Request:**
```graphql
query GetConversationHistory($contactId: ID!) {
  conversationHistory(contactId: $contactId, first: 5) {
    id
    content
    direction
    timestamp
    email {
      subject
      status
    }
  }
}
```

---

### 4. List Email Templates

```graphql
"""
List user's email templates
"""
emailTemplates: [EmailTemplate!]!
```

**Authorization:** Returns only authenticated user's templates

**Example Request:**
```graphql
query ListTemplates {
  emailTemplates {
    id
    name
    subject
    body
    isDefault
    category
    usageCount
  }
}
```

---

## Mutations

### 1. Generate Email Template (Primary Feature)

```graphql
"""
Generate AI-powered email template for a contact
"""
generateEmailTemplate(input: GenerateEmailInput!): GeneratedEmailTemplate!

input GenerateEmailInput {
  contactId: ID!
  context: String # Additional context from user (optional)
  includeHistory: Boolean = true # Include conversation history in AI context
}
```

**Authorization:** User must own the contact

**Business Logic:**
1. Fetch contact data (name, company, role, notes, priority)
2. Fetch conversation history (last 5 emails if `includeHistory=true`)
3. Build AI prompt with contact context
4. Generate formal and casual variants using LangChain
5. Cache result for 1 hour
6. Store generated templates in `emails` table with `status=DRAFT`
7. Return both variants to client

**Rate Limiting:** 10 requests/minute per user

**Example Request:**
```graphql
mutation GenerateEmail($input: GenerateEmailInput!) {
  generateEmailTemplate(input: $input) {
    formal {
      subject
      body
      templateType
    }
    casual {
      subject
      body
      templateType
    }
    providerId
    tokensUsed
    generatedAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "contactId": "clx456def",
    "context": "Follow up about the SaaS integration opportunity we discussed",
    "includeHistory": true
  }
}
```

**Example Response:**
```json
{
  "data": {
    "generateEmailTemplate": {
      "formal": {
        "subject": "Following Up on SaaS Integration Discussion",
        "body": "Dear Sarah,\n\nI hope this message finds you well. I wanted to follow up on our conversation at TechConf 2025 regarding the SaaS integration opportunity...",
        "templateType": "FORMAL"
      },
      "casual": {
        "subject": "Re: SaaS Integration Opportunity",
        "body": "Hey Sarah!\n\nGreat meeting you at TechConf yesterday! I wanted to circle back on the SaaS integration idea we chatted about...",
        "templateType": "CASUAL"
      },
      "providerId": "openai",
      "tokensUsed": 287,
      "generatedAt": "2025-10-10T15:45:00Z"
    }
  }
}
```

**Error Scenarios:**
- `UNAUTHORIZED`: User doesn't own the contact
- `RATE_LIMIT_EXCEEDED`: Too many requests (429)
- `CONTACT_NOT_FOUND`: Invalid contactId (404)
- `AI_SERVICE_UNAVAILABLE`: All LLM providers failed (503)
- `INVALID_INPUT`: Context too long or malicious (400)

---

### 2. Save Email (Draft or Send)

```graphql
"""
Save email as draft or mark as sent (sending happens via email provider integration)
"""
saveEmail(input: SaveEmailInput!): Email!

input SaveEmailInput {
  contactId: ID!
  subject: String!
  body: String!
  bodyHtml: String
  status: EmailStatus = DRAFT
  templateType: TemplateType!
  providerId: String # Which LLM generated this (if applicable)
  tokensUsed: Int # API tokens used (if applicable)
}
```

**Authorization:** User must own the contact

**Business Logic:**
1. Validate contact ownership
2. Sanitize email content (prevent XSS)
3. Create email record with `status`
4. If `status=SENT`, also create conversation history entry
5. Return saved email

**Example Request:**
```graphql
mutation SaveEmail($input: SaveEmailInput!) {
  saveEmail(input: $input) {
    id
    subject
    body
    status
    templateType
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "contactId": "clx456def",
    "subject": "Following Up on SaaS Integration Discussion",
    "body": "Dear Sarah,\n\nI hope this message finds you well...",
    "status": "DRAFT",
    "templateType": "FORMAL",
    "providerId": "openai",
    "tokensUsed": 287
  }
}
```

---

### 3. Update Email (Edit Draft)

```graphql
"""
Update an existing email draft
"""
updateEmail(input: UpdateEmailInput!): Email!

input UpdateEmailInput {
  id: ID!
  subject: String
  body: String
  bodyHtml: String
  status: EmailStatus
}
```

**Authorization:** User must own the email and email must be `status=DRAFT`

**Validation:** Cannot update emails with `status=SENT`

---

### 4. Delete Email

```graphql
"""
Delete an email (drafts only)
"""
deleteEmail(id: ID!): Boolean!
```

**Authorization:** User must own the email

**Business Logic:**
- If `status=DRAFT`: Hard delete from database
- If `status=SENT`: Soft delete (add `deletedAt` field - Phase 3)

---

### 5. Create Email Template

```graphql
"""
Create a new email template for reuse
"""
createEmailTemplate(input: CreateTemplateInput!): EmailTemplate!

input CreateTemplateInput {
  name: String!
  subject: String!
  body: String!
  bodyHtml: String
  category: String
  isDefault: Boolean = false
}
```

**Authorization:** Authenticated user

**Business Logic:**
- If `isDefault=true`, set all other user templates to `isDefault=false`

---

### 6. Update Email Template

```graphql
"""
Update an existing email template
"""
updateEmailTemplate(input: UpdateTemplateInput!): EmailTemplate!

input UpdateTemplateInput {
  id: ID!
  name: String
  subject: String
  body: String
  bodyHtml: String
  category: String
  isDefault: Boolean
}
```

**Authorization:** User must own the template

---

### 7. Delete Email Template

```graphql
"""
Delete an email template
"""
deleteEmailTemplate(id: ID!): Boolean!
```

**Authorization:** User must own the template

---

## Error Handling

### Standard Error Format

```graphql
type Error {
  message: String!
  code: String!
  field: String # Which input field caused the error (if applicable)
}
```

### Error Codes

- `UNAUTHORIZED` - User not authenticated or doesn't own resource
- `FORBIDDEN` - Action not allowed (e.g., editing sent email)
- `NOT_FOUND` - Resource doesn't exist
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `AI_SERVICE_UNAVAILABLE` - LLM providers unavailable
- `INTERNAL_ERROR` - Unexpected server error

---

## Rate Limiting

- **generateEmailTemplate:** 10 requests/minute per user
- **All other mutations:** 60 requests/minute per user
- **All queries:** 120 requests/minute per user

Limit headers returned in GraphQL extensions:
```json
{
  "extensions": {
    "rateLimit": {
      "limit": 10,
      "remaining": 7,
      "reset": 1697384400
    }
  }
}
```

---

## Caching Strategy

### Apollo Server Cache Hints

```graphql
type Email @cacheControl(maxAge: 300) { # 5 minutes
  ...
}

type EmailTemplate @cacheControl(maxAge: 3600) { # 1 hour
  ...
}
```

### Redis Caching

- `generateEmailTemplate` responses: 1 hour TTL
- Conversation history queries: 5 minutes TTL
- Email template lists: 1 hour TTL

---

## Subscription Support (Phase 4)

```graphql
"""
Subscribe to real-time email status updates (sent, opened, replied)
"""
emailStatusChanged(emailId: ID!): Email!
```

**Use Case:** Real-time notifications when recipient opens email or replies
