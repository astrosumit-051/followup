# RelationHub GraphQL API Documentation

> Last Updated: 2025-10-08
> Version: 1.0.0

## Overview

RelationHub provides a GraphQL API for managing professional contacts, relationships, and networking activities. All API endpoints require authentication via JWT tokens from Supabase.

## GraphQL Endpoint

**Development:**
```
http://localhost:4000/graphql
```

**GraphQL Playground:**
```
http://localhost:4000/graphql
```
(Available in development mode only)

## Authentication

All GraphQL operations require a valid JWT token in the Authorization header:

```
Authorization: Bearer <SUPABASE_JWT_TOKEN>
```

The JWT token is obtained from Supabase authentication and contains the user's ID, which is automatically extracted by the API for authorization checks.

---

## Contact Management API

### Types

#### Contact
```graphql
type Contact {
  id: ID!
  name: String!
  email: String!
  phone: String
  linkedinUrl: String
  profilePicture: String
  notes: String
  priority: Priority!
  birthday: DateTime
  gender: Gender
  company: String
  industry: String
  role: String
  userId: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

#### Priority Enum
```graphql
enum Priority {
  HIGH
  MEDIUM
  LOW
}
```

#### Gender Enum
```graphql
enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}
```

#### ContactConnection (Pagination)
```graphql
type ContactConnection {
  edges: [ContactEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type ContactEdge {
  node: Contact!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Queries

#### Get Single Contact

```graphql
query GetContact($id: ID!) {
  contact(id: $id) {
    id
    name
    email
    phone
    linkedinUrl
    profilePicture
    notes
    priority
    birthday
    gender
    company
    industry
    role
    createdAt
    updatedAt
  }
}
```

**Variables:**
```json
{
  "id": "cm2ggkv5q0000abcdefghijkl"
}
```

**Response:**
```json
{
  "data": {
    "contact": {
      "id": "cm2ggkv5q0000abcdefghijkl",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0123",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "profilePicture": null,
      "notes": "Met at Tech Conference 2024",
      "priority": "HIGH",
      "birthday": "1990-05-15T00:00:00.000Z",
      "gender": "MALE",
      "company": "TechCorp",
      "industry": "Technology",
      "role": "Senior Engineer",
      "createdAt": "2025-10-08T10:30:00.000Z",
      "updatedAt": "2025-10-08T10:30:00.000Z"
    }
  }
}
```

**Errors:**
- `404 Not Found` - Contact does not exist
- `403 Forbidden` - User does not own this contact
- `401 Unauthorized` - Missing or invalid JWT token

---

#### Get Contact List (with Pagination & Filters)

```graphql
query GetContacts(
  $filters: ContactFilterInput
  $pagination: ContactPaginationInput
  $sortBy: ContactSortField
  $sortOrder: SortOrder
) {
  contacts(
    filters: $filters
    pagination: $pagination
    sortBy: $sortBy
    sortOrder: $sortOrder
  ) {
    edges {
      node {
        id
        name
        email
        phone
        company
        industry
        priority
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

**Variables:**
```json
{
  "filters": {
    "search": "john",
    "priority": "HIGH",
    "company": "TechCorp",
    "industry": "Technology"
  },
  "pagination": {
    "limit": 20,
    "cursor": null
  },
  "sortBy": "NAME",
  "sortOrder": "asc"
}
```

**Response:**
```json
{
  "data": {
    "contacts": {
      "edges": [
        {
          "node": {
            "id": "cm2ggkv5q0000abcdefghijkl",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+1-555-0123",
            "company": "TechCorp",
            "industry": "Technology",
            "priority": "HIGH",
            "createdAt": "2025-10-08T10:30:00.000Z"
          },
          "cursor": "Y3JlYXRlZEF0OjIwMjUtMTAtMDhUMTA6MzA6MDAuMDAwWg=="
        }
      ],
      "pageInfo": {
        "hasNextPage": true,
        "hasPreviousPage": false,
        "startCursor": "Y3JlYXRlZEF0OjIwMjUtMTAtMDhUMTA6MzA6MDAuMDAwWg==",
        "endCursor": "Y3JlYXRlZEF0OjIwMjUtMTAtMDhUMTI6MDA6MDAuMDAwWg=="
      },
      "totalCount": 42
    }
  }
}
```

**Filter Options:**
- `search: String` - Full-text search across name, email, company, industry
- `priority: Priority` - Filter by HIGH, MEDIUM, or LOW priority
- `company: String` - Exact match company name
- `industry: String` - Exact match industry
- `gender: Gender` - Filter by gender

**Pagination Options:**
- `limit: Int` - Number of results per page (default: 20, max: 100)
- `cursor: String` - Cursor for next/previous page (from pageInfo)

**Sort Options:**
- `sortBy: ContactSortField` - NAME | PRIORITY | CREATED_AT | UPDATED_AT
- `sortOrder: SortOrder` - asc | desc

---

### Mutations

#### Create Contact

```graphql
mutation CreateContact($input: CreateContactInput!) {
  createContact(input: $input) {
    id
    name
    email
    phone
    linkedinUrl
    priority
    company
    industry
    role
    notes
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-0456",
    "linkedinUrl": "https://linkedin.com/in/janesmith",
    "priority": "MEDIUM",
    "company": "InnovateCo",
    "industry": "Healthcare",
    "role": "Product Manager",
    "notes": "Introduced by mutual friend at startup event",
    "birthday": "1992-08-20T00:00:00.000Z",
    "gender": "FEMALE"
  }
}
```

**Required Fields:**
- `name: String!` - Contact's full name (1-100 characters)
- `email: String!` - Valid email address

**Optional Fields:**
- `phone: String` - Phone number
- `linkedinUrl: String` - LinkedIn profile URL (must start with https://linkedin.com/ or https://www.linkedin.com/)
- `profilePicture: String` - URL to profile picture
- `notes: String` - Free-text notes (max 5000 characters)
- `priority: Priority` - HIGH, MEDIUM, or LOW (default: MEDIUM)
- `birthday: DateTime` - ISO 8601 date
- `gender: Gender` - MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
- `company: String` - Company name (max 100 characters)
- `industry: String` - Industry (max 100 characters)
- `role: String` - Job role/title (max 100 characters)

**Validation Rules:**
- Name must be 1-100 characters
- Email must be valid format
- LinkedIn URL must be valid LinkedIn profile URL
- Notes max 5000 characters
- Company, industry, role max 100 characters each

**Response:**
```json
{
  "data": {
    "createContact": {
      "id": "cm2ggkv5q0001abcdefghijkl",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1-555-0456",
      "linkedinUrl": "https://linkedin.com/in/janesmith",
      "priority": "MEDIUM",
      "company": "InnovateCo",
      "industry": "Healthcare",
      "role": "Product Manager",
      "notes": "Introduced by mutual friend at startup event",
      "createdAt": "2025-10-08T11:00:00.000Z"
    }
  }
}
```

**Errors:**
- `400 Bad Request` - Validation errors (invalid email, URL, etc.)
- `401 Unauthorized` - Missing or invalid JWT token
- `409 Conflict` - Duplicate email for this user

---

#### Update Contact

```graphql
mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
  updateContact(id: $id, input: $input) {
    id
    name
    email
    phone
    linkedinUrl
    priority
    company
    industry
    role
    notes
    updatedAt
  }
}
```

**Variables:**
```json
{
  "id": "cm2ggkv5q0001abcdefghijkl",
  "input": {
    "priority": "HIGH",
    "notes": "Promoted to VP of Product. Schedule follow-up call."
  }
}
```

**All fields in UpdateContactInput are optional** - only provide fields you want to update.

**Response:**
```json
{
  "data": {
    "updateContact": {
      "id": "cm2ggkv5q0001abcdefghijkl",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1-555-0456",
      "linkedinUrl": "https://linkedin.com/in/janesmith",
      "priority": "HIGH",
      "company": "InnovateCo",
      "industry": "Healthcare",
      "role": "Product Manager",
      "notes": "Promoted to VP of Product. Schedule follow-up call.",
      "updatedAt": "2025-10-08T14:30:00.000Z"
    }
  }
}
```

**Errors:**
- `404 Not Found` - Contact does not exist
- `403 Forbidden` - User does not own this contact
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid JWT token

---

#### Delete Contact

```graphql
mutation DeleteContact($id: ID!) {
  deleteContact(id: $id)
}
```

**Variables:**
```json
{
  "id": "cm2ggkv5q0001abcdefghijkl"
}
```

**Response:**
```json
{
  "data": {
    "deleteContact": true
  }
}
```

**Errors:**
- `404 Not Found` - Contact does not exist
- `403 Forbidden` - User does not own this contact
- `401 Unauthorized` - Missing or invalid JWT token

---

## User Profile API

### Query Current User

```graphql
query GetCurrentUser {
  me {
    id
    email
    name
    profilePicture
    lastLoginAt
    createdAt
  }
}
```

**Response:**
```json
{
  "data": {
    "me": {
      "id": "user-123-abc",
      "email": "user@example.com",
      "name": "Current User",
      "profilePicture": "https://example.com/avatar.jpg",
      "lastLoginAt": "2025-10-08T09:00:00.000Z",
      "createdAt": "2025-10-01T10:00:00.000Z"
    }
  }
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

**Default Limits:**
- 10 requests per 60 seconds per IP address
- Applies to all GraphQL operations

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1696776000
```

**Rate Limit Exceeded:**
```json
{
  "errors": [
    {
      "message": "Rate limit exceeded. Please try again later.",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED"
      }
    }
  ]
}
```

**Note:** Rate limiting can be disabled in development environments by setting `DISABLE_RATE_LIMIT=true` environment variable. This is NOT allowed in production.

---

## Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Contact not found",
      "extensions": {
        "code": "NOT_FOUND",
        "statusCode": 404
      }
    }
  ]
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHENTICATED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | User lacks permission for resource |
| `NOT_FOUND` | 404 | Resource does not exist |
| `BAD_REQUEST` | 400 | Validation error or malformed request |
| `CONFLICT` | 409 | Resource already exists (duplicate email) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## Testing the API

### Using GraphQL Playground (Development)

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to http://localhost:4000/graphql

3. Get a JWT token by logging in through the frontend (http://localhost:3000/login)

4. Add the authorization header in Playground:
   ```json
   {
     "Authorization": "Bearer <YOUR_JWT_TOKEN>"
   }
   ```

### Using curl

```bash
# Get contacts
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "query": "query { contacts(pagination: { limit: 10 }) { edges { node { id name email } } } }"
  }'
```

### Using Postman/Insomnia

1. Create a new GraphQL request
2. Set URL to `http://localhost:4000/graphql`
3. Add Authorization header: `Bearer <YOUR_JWT_TOKEN>`
4. Use the GraphQL query builder or raw query editor

---

## Best Practices

### Pagination

Always use cursor-based pagination for large datasets:

```graphql
# First page
query {
  contacts(pagination: { limit: 20 }) {
    edges { node { id name } cursor }
    pageInfo { hasNextPage endCursor }
  }
}

# Next page
query {
  contacts(pagination: { limit: 20, cursor: "END_CURSOR_FROM_PREVIOUS" }) {
    edges { node { id name } cursor }
    pageInfo { hasNextPage endCursor }
  }
}
```

### Field Selection

Only request fields you need to minimize response size:

```graphql
# Good - minimal fields
query {
  contacts(pagination: { limit: 20 }) {
    edges {
      node {
        id
        name
        email
      }
    }
  }
}

# Bad - requesting all fields unnecessarily
query {
  contacts(pagination: { limit: 20 }) {
    edges {
      node {
        id
        name
        email
        phone
        linkedinUrl
        profilePicture
        notes
        priority
        birthday
        gender
        company
        industry
        role
        createdAt
        updatedAt
      }
    }
  }
}
```

### Error Handling

Always handle errors gracefully:

```typescript
try {
  const result = await client.query({ query: GET_CONTACTS });
  // Handle success
} catch (error) {
  if (error.graphQLErrors) {
    // Handle GraphQL errors
    error.graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`GraphQL Error: ${message}`, extensions);
    });
  }
  if (error.networkError) {
    // Handle network errors
    console.error('Network Error:', error.networkError);
  }
}
```

---

## Security Considerations

1. **Authentication Required:** All operations require valid JWT token
2. **Authorization Checks:** Users can only access their own contacts
3. **Input Validation:** All inputs validated with class-validator
4. **SQL Injection Prevention:** Prisma ORM uses parameterized queries
5. **XSS Prevention:** Input sanitization on all text fields
6. **Rate Limiting:** Protects against brute-force attacks
7. **CORS:** Configured for frontend origin only

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/yourusername/relationhub/issues
- Documentation: See `/docs` folder
- CLAUDE.md: Project development guide
