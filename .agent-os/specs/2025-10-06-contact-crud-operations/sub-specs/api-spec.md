# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-06-contact-crud-operations/spec.md

> Created: 2025-10-06
> Version: 1.0.0

## GraphQL Type Definitions

### Contact Type

```graphql
type Contact {
  id: ID!
  userId: String!
  name: String!
  email: String
  phone: String
  linkedInUrl: String
  company: String
  industry: String
  role: String
  priority: Priority!
  gender: Gender
  birthday: DateTime
  profilePicture: String
  notes: String
  lastContactedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}
```

### Input Types

```graphql
input CreateContactInput {
  name: String!
  email: String
  phone: String
  linkedInUrl: String
  company: String
  industry: String
  role: String
  priority: Priority
  gender: Gender
  birthday: DateTime
  notes: String
}

input UpdateContactInput {
  name: String
  email: String
  phone: String
  linkedInUrl: String
  company: String
  industry: String
  role: String
  priority: Priority
  gender: Gender
  birthday: DateTime
  notes: String
  lastContactedAt: DateTime
}

input ContactFilterInput {
  priority: Priority
  company: String
  industry: String
  role: String
  search: String
}

input ContactPaginationInput {
  cursor: String
  limit: Int
}
```

### Pagination Types

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

## GraphQL Queries

### Get Single Contact

```graphql
query GetContact($id: ID!) {
  contact(id: $id): Contact
}
```

**Purpose:** Fetch detailed information for a single contact

**Authorization:** User must own the contact (userId matches JWT)

**Parameters:**
- `id` (required): Contact UUID

**Response:**
- Returns Contact object if found and user has access
- Returns null if not found or unauthorized

**Errors:**
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: Contact belongs to different user
- `NOT_FOUND`: Contact ID doesn't exist

**Example:**
```graphql
query {
  contact(id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890") {
    id
    name
    email
    company
    priority
  }
}
```

### List Contacts

```graphql
query ListContacts(
  $filter: ContactFilterInput
  $pagination: ContactPaginationInput
  $orderBy: ContactOrderByInput
) {
  contacts(
    filter: $filter
    pagination: $pagination
    orderBy: $orderBy
  ): ContactConnection!
}
```

**Purpose:** Fetch paginated list of user's contacts with filtering and sorting

**Authorization:** User can only see their own contacts

**Parameters:**
- `filter` (optional): Filter criteria (priority, company, industry, search term)
- `pagination` (optional): Cursor and limit (default limit: 20, max: 100)
- `orderBy` (optional): Sort field and direction (default: createdAt DESC)

**Response:**
- Returns ContactConnection with edges, pageInfo, and totalCount

**Example:**
```graphql
query {
  contacts(
    filter: { priority: HIGH, search: "john" }
    pagination: { limit: 10 }
    orderBy: { field: NAME, direction: ASC }
  ) {
    edges {
      node {
        id
        name
        company
        priority
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

## GraphQL Mutations

### Create Contact

```graphql
mutation CreateContact($input: CreateContactInput!) {
  createContact(input: $input): Contact!
}
```

**Purpose:** Create a new contact for the authenticated user

**Authorization:** User must be authenticated

**Parameters:**
- `input` (required): CreateContactInput with contact details

**Validation:**
- `name`: Required, min 1 char, max 255 chars
- `email`: Optional, valid email format
- `phone`: Optional, max 50 chars
- `linkedInUrl`: Optional, valid URL format
- `company`: Optional, max 255 chars
- `industry`: Optional, max 255 chars
- `role`: Optional, max 255 chars
- `notes`: Optional, max 10,000 chars

**Response:**
- Returns created Contact object

**Errors:**
- `UNAUTHORIZED`: User not authenticated
- `BAD_REQUEST`: Validation failed (invalid email, URL, etc.)

**Example:**
```graphql
mutation {
  createContact(input: {
    name: "John Doe"
    email: "john@example.com"
    company: "Acme Corp"
    priority: HIGH
  }) {
    id
    name
    email
    priority
    createdAt
  }
}
```

### Update Contact

```graphql
mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
  updateContact(id: $id, input: $input): Contact!
}
```

**Purpose:** Update existing contact fields

**Authorization:** User must own the contact

**Parameters:**
- `id` (required): Contact UUID to update
- `input` (required): UpdateContactInput with fields to update (all optional)

**Validation:**
- Same validation rules as CreateContact
- Only provided fields are updated
- Cannot update `userId`, `id`, `createdAt`

**Response:**
- Returns updated Contact object

**Errors:**
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: Contact belongs to different user
- `NOT_FOUND`: Contact ID doesn't exist
- `BAD_REQUEST`: Validation failed

**Example:**
```graphql
mutation {
  updateContact(
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    input: {
      priority: LOW
      notes: "Updated contact notes"
    }
  ) {
    id
    priority
    notes
    updatedAt
  }
}
```

### Delete Contact

```graphql
mutation DeleteContact($id: ID!) {
  deleteContact(id: $id): Boolean!
}
```

**Purpose:** Permanently delete a contact and all related data

**Authorization:** User must own the contact

**Parameters:**
- `id` (required): Contact UUID to delete

**Cascade Behavior:**
- Deletes all related emails (via Prisma onDelete: Cascade)
- Deletes all related activities (via Prisma onDelete: Cascade)
- Deletes all related reminders (via Prisma onDelete: Cascade)
- Deletes all contact-tag relationships (via Prisma onDelete: Cascade)

**Response:**
- Returns `true` if deleted successfully

**Errors:**
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: Contact belongs to different user
- `NOT_FOUND`: Contact ID doesn't exist

**Example:**
```graphql
mutation {
  deleteContact(id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
}
```

## Controller/Resolver Structure

### ContactResolver (apps/api/src/contact/contact.resolver.ts)

```typescript
@Resolver(() => Contact)
@UseGuards(AuthGuard)
export class ContactResolver {
  constructor(private readonly contactService: ContactService) {}

  @Query(() => Contact, { nullable: true })
  async contact(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Contact | null>

  @Query(() => ContactConnection)
  async contacts(
    @Args('filter', { nullable: true }) filter?: ContactFilterInput,
    @Args('pagination', { nullable: true }) pagination?: ContactPaginationInput,
    @Args('orderBy', { nullable: true }) orderBy?: ContactOrderByInput,
    @CurrentUser() user: any,
  ): Promise<ContactConnection>

  @Mutation(() => Contact)
  async createContact(
    @Args('input') input: CreateContactInput,
    @CurrentUser() user: any,
  ): Promise<Contact>

  @Mutation(() => Contact)
  async updateContact(
    @Args('id') id: string,
    @Args('input') input: UpdateContactInput,
    @CurrentUser() user: any,
  ): Promise<Contact>

  @Mutation(() => Boolean)
  async deleteContact(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<boolean>
}
```

### ContactService (apps/api/src/contact/contact.service.ts)

```typescript
@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string, userId: string): Promise<Contact | null>

  async findAll(
    userId: string,
    filter?: ContactFilterInput,
    pagination?: ContactPaginationInput,
    orderBy?: ContactOrderByInput,
  ): Promise<ContactConnection>

  async create(userId: string, data: CreateContactDto): Promise<Contact>

  async update(id: string, userId: string, data: UpdateContactDto): Promise<Contact>

  async delete(id: string, userId: string): Promise<boolean>
}
```

## Error Handling

All API errors follow this format:

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

**Error Codes:**
- `UNAUTHORIZED` (401): User not authenticated
- `FORBIDDEN` (403): User cannot access resource
- `NOT_FOUND` (404): Resource doesn't exist
- `BAD_REQUEST` (400): Validation failed
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error
