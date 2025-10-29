# Contact Management Features - Setup & Usage Guide

> Last Updated: 2025-10-08
> Version: 1.0.0

## Overview

Cordiq's Contact Management system provides a comprehensive CRUD interface for managing professional contacts with features including search, filtering, sorting, and pagination.

## Features Implemented

✅ **Core CRUD Operations**
- Create new contacts with full profile information
- View contact details
- Edit existing contacts with optimistic UI updates
- Delete contacts with confirmation dialog

✅ **Advanced Search & Filtering**
- Full-text search across name, email, company, industry
- Filter by priority (HIGH, MEDIUM, LOW)
- Filter by company and industry
- Debounced search input for performance

✅ **Sorting & Pagination**
- Sort by name, priority, or creation date
- Cursor-based pagination for efficient data loading
- "Load More" button for seamless infinite scroll
- Supports 1000+ contacts with optimal performance

✅ **Responsive Design**
- Mobile-first responsive layouts
- WCAG 2.1 AA accessibility compliance
- 44px minimum touch targets on mobile
- Optimized for 375px (mobile), 768px (tablet), 1440px (desktop)

✅ **Security & Performance**
- All operations require authentication (JWT)
- Authorization checks ensure users only access own contacts
- Input validation with Zod schemas
- SQL injection prevention with Prisma ORM
- XSS prevention with class-validator
- Rate limiting (10 requests per 60 seconds)

---

## Quick Start

### Prerequisites

- Node.js v22+
- pnpm v8+
- PostgreSQL v17+
- Supabase account (for authentication)

### Setup Steps

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**

   **Frontend** (`apps/web/.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Backend** (`apps/api/.env`):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/cordiq_dev
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Run Database Migrations**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   ```

4. **Start Development Servers**
   ```bash
   # From project root
   pnpm dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - GraphQL Playground: http://localhost:4000/graphql

---

## Using Contact Management Features

### 1. Create a Contact

**Via UI:**
1. Navigate to http://localhost:3000/contacts
2. Click "Create Contact" button
3. Fill in required fields:
   - Name (required)
   - Email (required)
4. Fill in optional fields:
   - Phone
   - LinkedIn URL
   - Company
   - Industry
   - Role
   - Priority (HIGH, MEDIUM, LOW)
   - Gender
   - Birthday
   - Notes
5. Click "Create Contact"
6. Redirected to contact detail page

**Via GraphQL API:**
```graphql
mutation {
  createContact(input: {
    name: "John Doe"
    email: "john.doe@example.com"
    phone: "+1-555-0123"
    company: "TechCorp"
    industry: "Technology"
    role: "Senior Engineer"
    priority: HIGH
  }) {
    id
    name
    email
    createdAt
  }
}
```

### 2. View Contacts

**List View:**
- Navigate to http://localhost:3000/contacts
- See all contacts in responsive grid layout
- Search using search bar (top right)
- Apply filters (Show Filters button)
- Sort by name, priority, or date
- Load more contacts with pagination

**Detail View:**
- Click on any contact card
- View all contact information
- See creation and update timestamps
- Access Edit and Delete buttons

### 3. Search & Filter

**Search:**
- Type in search bar at top of contact list
- Searches across: name, email, company, industry
- Debounced for performance (500ms delay)

**Filters:**
- Click "Show Filters" button
- Select priority level (ALL, HIGH, MEDIUM, LOW)
- Filter by company (dropdown of existing companies)
- Filter by industry (dropdown of existing industries)
- Click "Apply Filters"
- Click "Clear Filters" to reset

**Sort:**
- Use sort dropdown in top bar
- Options: Name (A-Z), Name (Z-A), Priority (High to Low), Priority (Low to High), Newest First, Oldest First

### 4. Edit a Contact

**Via UI:**
1. Navigate to contact detail page
2. Click "Edit" button
3. Modify any fields
4. Click "Save Changes"
5. See optimistic UI update
6. Redirected back to detail page

**Via GraphQL API:**
```graphql
mutation {
  updateContact(
    id: "cm2ggkv5q0000abcdefghijkl"
    input: {
      priority: HIGH
      notes: "Follow up scheduled for next week"
    }
  ) {
    id
    priority
    notes
    updatedAt
  }
}
```

### 5. Delete a Contact

**Via UI:**
1. Navigate to contact detail page
2. Click "Delete" button (red, destructive style)
3. Confirm deletion in dialog
4. Contact deleted
5. Redirected to contact list

**Via GraphQL API:**
```graphql
mutation {
  deleteContact(id: "cm2ggkv5q0000abcdefghijkl")
}
```

---

## Testing

### Unit Tests

**Backend (246 tests):**
```bash
cd apps/api
pnpm test
```

Coverage includes:
- DTO validation (CreateContactDto, UpdateContactDto)
- Service layer (findOne, findAll, create, update, delete)
- Resolver integration tests
- Authorization checks

**Frontend (220 tests):**
```bash
cd apps/web
pnpm test
```

Coverage includes:
- Component testing (ContactCard, ContactForm, etc.)
- API client functions
- TanStack Query hooks
- Zod validation schemas

### E2E Tests

**Prerequisites:**
- Backend server running (http://localhost:4000)
- Frontend server running (http://localhost:3000)
- Valid test user authenticated

**Run E2E Tests:**
```bash
cd apps/web
pnpm test:e2e
```

**Test Suites:**
- `contact-list.spec.ts` - List view, search, filter, pagination
- `contact-create.spec.ts` - Contact creation flow
- `contact-detail.spec.ts` - Detail view and navigation
- `contact-edit.spec.ts` - Edit flow with validation
- `responsive.spec.ts` - Responsive design across viewports

**Run Specific Suite:**
```bash
pnpm test:e2e e2e/contacts/contact-list.spec.ts
```

**Run with UI:**
```bash
pnpm test:e2e:ui
```

### Performance Tests

**Prerequisites:**
- Seed performance data (1000+ contacts)

**Seed Performance Data:**
```bash
cd apps/api
PERFORMANCE_TEST_USER_EMAIL=test@cordiq.com pnpm db:seed:performance
```

This creates:
- 1000 test contacts
- Varied priorities, companies, industries
- Realistic data distribution

**Run Performance Tests:**
```bash
cd apps/web
pnpm test:e2e:performance
```

**Performance Thresholds:**
- List page load: <3 seconds
- Search response: <500ms
- Form submission: <1 second
- Pagination load: <2 seconds

---

## GraphQL API Reference

### Queries

**Get Single Contact:**
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

**Get Contact List (with Pagination):**
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

### Mutations

**Create Contact:**
```graphql
mutation CreateContact($input: CreateContactInput!) {
  createContact(input: $input) {
    id
    name
    email
    createdAt
  }
}
```

**Update Contact:**
```graphql
mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
  updateContact(id: $id, input: $input) {
    id
    name
    email
    updatedAt
  }
}
```

**Delete Contact:**
```graphql
mutation DeleteContact($id: ID!) {
  deleteContact(id: $id)
}
```

**📖 For complete API documentation, see:** `/docs/API.md`

---

## Database Schema

### Contact Model

```prisma
model Contact {
  id             String    @id @default(cuid())
  name           String
  email          String
  phone          String?
  linkedinUrl    String?
  profilePicture String?
  notes          String?   @db.Text
  priority       Priority  @default(MEDIUM)
  birthday       DateTime?
  gender         Gender?
  company        String?
  industry       String?
  role           String?
  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@unique([email, userId])
  @@index([userId])
  @@index([priority])
  @@index([company])
  @@index([industry])
  @@map("contacts")
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

### Migrations

**Run Migrations:**
```bash
cd apps/api
pnpm prisma migrate dev
```

**Reset Database:**
```bash
pnpm prisma migrate reset
```

**Generate Prisma Client:**
```bash
pnpm prisma generate
```

---

## Troubleshooting

### Common Issues

**1. Authentication Errors (401 Unauthorized)**
- Ensure you're logged in through the frontend
- JWT token is automatically included by TanStack Query
- Check Supabase configuration in environment variables

**2. Contact Not Found (404)**
- Verify contact ID is correct
- Ensure you own the contact (authorization check)
- Check that contact exists in database

**3. Validation Errors (400 Bad Request)**
- Check required fields: name and email
- Verify email format is valid
- LinkedIn URL must start with https://linkedin.com/ or https://www.linkedin.com/
- Notes max 5000 characters

**4. Performance Issues**
- Use pagination for large datasets
- Apply filters to reduce result set
- Check database indexes (should be auto-created by migrations)

**5. Rate Limiting (429 Too Many Requests)**
- Default limit: 10 requests per 60 seconds
- Wait for rate limit to reset
- In development, set `DISABLE_RATE_LIMIT=true` in apps/api/.env

### Debug Tools

**GraphQL Playground:**
- Access at http://localhost:4000/graphql
- Test queries and mutations directly
- View GraphQL schema documentation

**Database Inspection:**
```bash
cd apps/api
pnpm prisma studio
```
- Opens Prisma Studio at http://localhost:5555
- View and edit database records directly

**React Query Devtools:**
- Automatically included in development
- View query cache, mutations, and state
- Toggle visibility with keyboard shortcut

---

## Architecture

### Backend Stack

- **Framework:** NestJS
- **Database:** PostgreSQL 17
- **ORM:** Prisma
- **GraphQL:** Apollo Server with Code-First approach
- **Authentication:** Supabase JWT
- **Validation:** class-validator, class-transformer
- **Rate Limiting:** @nestjs/throttler

### Frontend Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** TailwindCSS, Headless UI
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack Query (React Query)
- **GraphQL Client:** graphql-request
- **Testing:** Jest, React Testing Library, Playwright

### Key Design Patterns

**Backend:**
- Repository pattern with Prisma
- Dependency injection with NestJS
- Guard-based authorization
- DTO validation at entry points

**Frontend:**
- Server Components for initial page load
- Client Components for interactivity
- Optimistic UI updates for mutations
- Cursor-based pagination
- Debounced search inputs

---

## Performance Optimization

### Backend Optimizations

1. **Database Indexes**
   - userId, priority, company, industry
   - Composite unique index on [email, userId]

2. **Query Optimization**
   - Cursor-based pagination (more efficient than offset)
   - Select only required fields
   - Eager loading with Prisma `include` when needed

3. **Caching**
   - TanStack Query automatic caching on frontend
   - Invalidation on mutations

### Frontend Optimizations

1. **Code Splitting**
   - Next.js automatic code splitting
   - Dynamic imports for heavy components

2. **Image Optimization**
   - Next.js Image component for profile pictures
   - Lazy loading for off-screen images

3. **Debouncing**
   - 500ms debounce on search input
   - Prevents excessive API calls

4. **Optimistic Updates**
   - Immediate UI feedback on create/update/delete
   - Rollback on error

---

## Security Best Practices

✅ **Authentication:** All operations require valid JWT token
✅ **Authorization:** Row-level security - users can only access own contacts
✅ **Input Validation:** Zod schemas on frontend, class-validator on backend
✅ **SQL Injection Prevention:** Prisma parameterized queries
✅ **XSS Prevention:** Input sanitization on text fields
✅ **Rate Limiting:** 10 requests per 60 seconds
✅ **HTTPS Only:** Enforced in production
✅ **CORS Configuration:** Restricted to frontend origin

---

## Next Steps

### Planned Enhancements

- [ ] Bulk import from CSV/Excel
- [ ] Bulk export with custom field selection
- [ ] LinkedIn profile scraping for auto-enrichment
- [ ] Profile picture upload to S3
- [ ] Contact deduplication
- [ ] Advanced filters (gender, birthday month, role)
- [ ] Contact history tracking (Git-like versioning)
- [ ] Virtual scrolling for very large datasets
- [ ] Real-time updates with GraphQL subscriptions

### Contributing

For development workflow and contribution guidelines, see:
- `CLAUDE.md` - Project development guide
- `.agent-os/product/roadmap.md` - Feature roadmap
- `/context/mcp-instructions.md` - MCP server usage

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/cordiq/issues
- API Documentation: `/docs/API.md`
- Development Guide: `CLAUDE.md`
