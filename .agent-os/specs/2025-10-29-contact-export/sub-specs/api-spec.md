# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-29-contact-export/spec.md

> Created: 2025-10-29
> Version: 1.0.0

## Overview

The Contact Export feature provides both GraphQL and REST API endpoints for exporting contacts. The GraphQL mutation is the primary interface for frontend usage, while the REST endpoint serves as a traditional HTTP alternative and enables programmatic integrations.

## GraphQL API

### Mutation: `exportContacts`

**Purpose:** Export contacts in CSV or Excel format based on specified scope and options.

**Type Definition:**

```graphql
type Mutation {
  exportContacts(input: ExportContactsInput!): ExportContactsPayload!
}

input ExportContactsInput {
  format: ExportFormat!
  scope: ExportScope!
  filename: String
  filterCriteria: ContactFilterInput
  contactIds: [ID!]
}

enum ExportFormat {
  CSV
  EXCEL
}

enum ExportScope {
  ALL
  FILTERED
  SELECTED
}

input ContactFilterInput {
  searchTerm: String
  priority: Priority
  company: String
  industry: String
  role: String
  gender: Gender
  birthdayMonth: Int
}

type ExportContactsPayload {
  exportId: ID!
  contactCount: Int!
  filename: String!
  downloadUrl: String!
  expiresAt: DateTime
}
```

**Request Example (All Contacts, CSV):**

```graphql
mutation ExportAllContactsCSV {
  exportContacts(input: {
    format: CSV
    scope: ALL
    filename: "my-contacts-backup"
  }) {
    exportId
    contactCount
    filename
    downloadUrl
    expiresAt
  }
}
```

**Response Example:**

```json
{
  "data": {
    "exportContacts": {
      "exportId": "exp_7f9b3c8d4e2a1f5b",
      "contactCount": 247,
      "filename": "my-contacts-backup-2025-10-29-143022.csv",
      "downloadUrl": "/api/exports/exp_7f9b3c8d4e2a1f5b/download",
      "expiresAt": null
    }
  }
}
```

**Request Example (Filtered Contacts, Excel):**

```graphql
mutation ExportFilteredContactsExcel {
  exportContacts(input: {
    format: EXCEL
    scope: FILTERED
    filename: "high-priority-tech"
    filterCriteria: {
      priority: HIGH
      industry: "Technology"
    }
  }) {
    exportId
    contactCount
    filename
    downloadUrl
  }
}
```

**Response Example:**

```json
{
  "data": {
    "exportContacts": {
      "exportId": "exp_a3f8d2c9e7b1a4f6",
      "contactCount": 42,
      "filename": "high-priority-tech-2025-10-29-143130.xlsx",
      "downloadUrl": "/api/exports/exp_a3f8d2c9e7b1a4f6/download",
      "expiresAt": null
    }
  }
}
```

**Request Example (Selected Contacts, Excel):**

```graphql
mutation ExportSelectedContactsExcel {
  exportContacts(input: {
    format: EXCEL
    scope: SELECTED
    contactIds: ["contact_123", "contact_456", "contact_789"]
    filename: "conference-attendees"
  }) {
    exportId
    contactCount
    filename
    downloadUrl
  }
}
```

**Error Response Example:**

```json
{
  "errors": [
    {
      "message": "Some contact IDs do not belong to the current user",
      "extensions": {
        "code": "FORBIDDEN",
        "invalidIds": ["contact_999"]
      }
    }
  ]
}
```

**Validation Rules:**

- `format`: Required, must be CSV or EXCEL
- `scope`: Required, must be ALL, FILTERED, or SELECTED
- `filename`: Optional, max 100 characters, alphanumeric + hyphens/underscores only
- `filterCriteria`: Required if scope is FILTERED, optional otherwise
- `contactIds`: Required if scope is SELECTED (min 1, max 10,000 IDs), forbidden otherwise

**Authorization:**
- Requires valid JWT token in `Authorization` header
- User must be authenticated
- User can only export their own contacts

---

## REST API

### Endpoint: `POST /api/contacts/export`

**Purpose:** Export contacts via traditional REST endpoint, returns file stream directly for download.

**Authentication:**
- Bearer token in `Authorization` header: `Authorization: Bearer <jwt_token>`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body (All Contacts, CSV):**

```json
{
  "format": "CSV",
  "scope": "ALL",
  "filename": "my-contacts-backup"
}
```

**Request Body (Filtered Contacts, Excel):**

```json
{
  "format": "EXCEL",
  "scope": "FILTERED",
  "filename": "high-priority-tech",
  "filterCriteria": {
    "priority": "HIGH",
    "industry": "Technology"
  }
}
```

**Request Body (Selected Contacts, Excel):**

```json
{
  "format": "EXCEL",
  "scope": "SELECTED",
  "filename": "conference-attendees",
  "contactIds": ["contact_123", "contact_456", "contact_789"]
}
```

**Success Response (200 OK):**

**Headers:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="my-contacts-backup-2025-10-29-143022.csv"
Content-Length: 45632
X-Export-Id: exp_7f9b3c8d4e2a1f5b
X-Contact-Count: 247
```

**Body:** File stream (CSV or XLSX binary data)

**Alternative Success Response (201 Created) - For Async Exports (>1000 contacts):**

```json
{
  "exportId": "exp_a3f8d2c9e7b1a4f6",
  "status": "PROCESSING",
  "contactCount": 5247,
  "estimatedTime": 30,
  "message": "Your export is being prepared. You will receive a download link shortly.",
  "pollUrl": "/api/exports/exp_a3f8d2c9e7b1a4f6/status"
}
```

**Error Responses:**

**400 Bad Request - Invalid Input:**
```json
{
  "error": "BAD_REQUEST",
  "message": "Invalid export format",
  "details": {
    "format": ["must be one of: CSV, EXCEL"]
  }
}
```

**400 Bad Request - Missing Required Fields:**
```json
{
  "error": "BAD_REQUEST",
  "message": "Validation failed",
  "details": {
    "filterCriteria": ["required when scope is FILTERED"],
    "contactIds": ["required when scope is SELECTED"]
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication token is missing or invalid"
}
```

**403 Forbidden:**
```json
{
  "error": "FORBIDDEN",
  "message": "Some contact IDs do not belong to the current user",
  "invalidIds": ["contact_999"]
}
```

**500 Internal Server Error:**
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Failed to generate export file",
  "exportId": "exp_7f9b3c8d4e2a1f5b"
}
```

---

## Query: Export History

### GraphQL Query: `exportHistory`

**Purpose:** Retrieve user's export history for display in Settings page.

**Type Definition:**

```graphql
type Query {
  exportHistory(limit: Int = 20): ExportHistoryConnection!
}

type ExportHistoryConnection {
  edges: [ExportHistoryEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type ExportHistoryEdge {
  node: ExportHistoryRecord!
}

type ExportHistoryRecord {
  id: ID!
  format: ExportFormat!
  scope: ExportScope!
  contactCount: Int!
  filename: String!
  fileSize: Int!
  createdAt: DateTime!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

**Request Example:**

```graphql
query GetExportHistory {
  exportHistory(limit: 20) {
    edges {
      node {
        id
        format
        scope
        contactCount
        filename
        fileSize
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

**Response Example:**

```json
{
  "data": {
    "exportHistory": {
      "edges": [
        {
          "node": {
            "id": "exp_7f9b3c8d4e2a1f5b",
            "format": "CSV",
            "scope": "ALL",
            "contactCount": 247,
            "filename": "my-contacts-backup-2025-10-29-143022.csv",
            "fileSize": 45632,
            "createdAt": "2025-10-29T14:30:22Z"
          }
        },
        {
          "node": {
            "id": "exp_a3f8d2c9e7b1a4f6",
            "format": "EXCEL",
            "scope": "FILTERED",
            "contactCount": 42,
            "filename": "high-priority-tech-2025-10-29-143130.xlsx",
            "fileSize": 12840,
            "createdAt": "2025-10-29T14:31:30Z"
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": false,
        "endCursor": "exp_a3f8d2c9e7b1a4f6"
      },
      "totalCount": 2
    }
  }
}
```

### REST Endpoint: `GET /api/contacts/export-history`

**Purpose:** Retrieve export history via REST API.

**Request:**
```
GET /api/contacts/export-history?limit=20
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 20, max: 100)
- `page` (optional): Page number for pagination (default: 1)

**Response (200 OK):**

```json
{
  "exports": [
    {
      "id": "exp_7f9b3c8d4e2a1f5b",
      "format": "CSV",
      "scope": "ALL",
      "contactCount": 247,
      "filename": "my-contacts-backup-2025-10-29-143022.csv",
      "fileSize": 45632,
      "createdAt": "2025-10-29T14:30:22Z"
    },
    {
      "id": "exp_a3f8d2c9e7b1a4f6",
      "format": "EXCEL",
      "scope": "FILTERED",
      "contactCount": 42,
      "filename": "high-priority-tech-2025-10-29-143130.xlsx",
      "fileSize": 12840,
      "createdAt": "2025-10-29T14:31:30Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 2,
    "hasNextPage": false
  }
}
```

---

## Controllers & Resolvers

### NestJS Controller: `ContactExportController`

**File:** `apps/api/src/contacts/contact-export.controller.ts`

**Endpoints:**
- `POST /api/contacts/export` → `exportContacts(dto, user)`
- `GET /api/contacts/export-history` → `getExportHistory(userId, limit, page)`

**Responsibilities:**
- Request validation using class-validator
- Authentication check using JWT guard
- Call `ContactExportService` methods
- Return file stream or JSON response
- Handle errors and return appropriate HTTP status codes

### GraphQL Resolver: `ContactExportResolver`

**File:** `apps/api/src/contacts/contact-export.resolver.ts`

**Mutations:**
- `exportContacts(input: ExportContactsInput)` → `ExportContactsPayload`

**Queries:**
- `exportHistory(limit: Int)` → `ExportHistoryConnection`

**Responsibilities:**
- Input validation using class-validator
- Authentication check using JWT guard decorator
- Call `ContactExportService` methods
- Transform service responses to GraphQL types
- Handle errors and return GraphQL errors

---

## Service Layer

### Service: `ContactExportService`

**File:** `apps/api/src/contacts/contact-export.service.ts`

**Methods:**

```typescript
async exportContacts(
  userId: string,
  format: ExportFormat,
  scope: ExportScope,
  options: ExportOptions
): Promise<ExportResult>

async getExportHistory(
  userId: string,
  limit: number = 20
): Promise<ExportHistoryRecord[]>

private async generateCSV(contacts: Contact[]): Promise<Buffer>

private async generateExcel(contacts: Contact[]): Promise<Buffer>

private sanitizeFilename(filename: string): string

private recordExportHistory(
  userId: string,
  exportData: ExportMetadata
): Promise<void>
```

**Dependencies:**
- `PrismaService` - Database queries
- `csv-writer` - CSV generation
- `exceljs` - Excel generation
- `sanitize-filename` - Filename sanitization

---

## Error Handling

**GraphQL Errors:**
- Use `ApolloError` with custom error codes
- Provide user-friendly messages
- Include validation details in extensions

**REST Errors:**
- Use standard HTTP status codes
- Return consistent JSON error format
- Log errors for debugging

**Error Codes:**
- `BAD_REQUEST` (400): Invalid input, validation failure
- `UNAUTHORIZED` (401): Missing or invalid JWT token
- `FORBIDDEN` (403): User doesn't own requested contacts
- `NOT_FOUND` (404): Export ID not found
- `INTERNAL_SERVER_ERROR` (500): File generation failure

---

## Performance Considerations

**Streaming Response:**
- Use Node.js streams for file generation
- Don't load entire file into memory
- Stream directly to HTTP response

**Database Optimization:**
- Use cursor-based pagination for large exports
- Batch fetch contacts in chunks of 500
- Select only required fields (exclude unnecessary relations)

**Caching:**
- No caching for export endpoints (always fresh data)
- Cache export history for 1 minute

**Rate Limiting:**
- None per requirements (monitor for abuse)
