# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-06-contact-crud-operations/spec.md

> Created: 2025-10-06
> Version: 1.0.0

## Technical Requirements

### Backend Requirements

- **NestJS GraphQL resolvers** for all CRUD operations
- **Authorization checks** ensuring users can only access their own contacts
- **Input validation** using class-validator DTOs
- **Prisma ORM** for database operations with proper error handling
- **Pagination support** with cursor-based pagination for large contact lists
- **Search functionality** using Prisma's fulltext search or `contains` filters
- **Filter capabilities** by priority, company, industry, role
- **Soft delete option** to preserve data integrity (add `deletedAt` field)

### Frontend Requirements

- **React Server Components** for initial data loading
- **React Hook Form** for form state management
- **Zod schemas** for client-side validation matching backend DTOs
- **TanStack Query** for data fetching, caching, and optimistic updates
- **Shadcn/UI components** for consistent design system
- **Responsive design** following design principles (mobile-first approach)
- **Loading states** and error handling with user-friendly messages
- **Toast notifications** for success/error feedback

### Performance Requirements

- Contact list page load: <2 seconds for 100 contacts
- Search results: Real-time filtering (<200ms response)
- Form submission: <1 second response time
- Pagination: Smooth scrolling with prefetching

## Approach

We'll implement this feature using a **modular, test-driven approach** with clear separation between backend and frontend:

### Backend Implementation Strategy

1. **Create DTOs First** - Define CreateContactDto, UpdateContactDto with validation rules
2. **Implement Service Layer** - ContactService with CRUD methods using Prisma
3. **Build GraphQL Resolvers** - ContactResolver with @UseGuards(AuthGuard) protection
4. **Add Pagination Logic** - Implement cursor-based pagination helper
5. **Implement Search/Filter** - Build query builder for dynamic filtering

**Why This Approach:**
- DTOs ensure type safety and validation consistency
- Service layer separates business logic from GraphQL concerns
- Test each layer independently for better coverage
- Cursor-based pagination scales better than offset pagination

### Frontend Implementation Strategy

1. **Create Zod Schemas** - Define validation schemas matching backend DTOs
2. **Build Reusable Components** - ContactForm, ContactCard, ContactTable
3. **Implement Data Layer** - TanStack Query hooks for CRUD operations
4. **Create Page Views** - /contacts (list), /contacts/[id] (detail), /contacts/new (create)
5. **Add Search/Filter UI** - SearchBar and FilterDropdown components

**Why This Approach:**
- Zod provides runtime validation and TypeScript types
- Reusable components reduce code duplication
- TanStack Query handles caching and optimistic updates automatically
- Incremental page development allows testing at each step

## External Dependencies

### New Backend Dependencies

None required - all dependencies already installed:
- `@nestjs/graphql` (existing)
- `@nestjs/apollo` (existing)
- `class-validator` (existing)
- `class-transformer` (existing)
- `@prisma/client` (existing)

### New Frontend Dependencies

- **`react-hook-form`** (^7.50.0) - Form state management with performance optimization
  - **Justification:** Industry standard for React forms, excellent TypeScript support, minimal re-renders

- **`@hookform/resolvers`** (^3.3.4) - Zod integration for react-hook-form
  - **Justification:** Required for Zod schema validation in react-hook-form

- **`zod`** (^3.22.4) - Schema validation and TypeScript type inference
  - **Justification:** Type-safe validation, seamless TypeScript integration, runtime type checking

- **`@tanstack/react-query`** (^5.20.0) - Data fetching and caching
  - **Justification:** Best-in-class caching, automatic refetching, optimistic updates

- **`@tanstack/react-query-devtools`** (^5.20.0) - Debugging tools for React Query
  - **Justification:** Essential for development, helps debug caching behavior

### UI Component Library

We'll use **Shadcn/UI** components which are already set up in the project:
- Input, Textarea, Select components for forms
- Button, Card, Table components for layout
- Dialog component for delete confirmation
- Toast for notifications

**Note:** Shadcn/UI is not a traditional dependency - components are copied into the project and customized.

## Database Considerations

The Contact model already exists in the Prisma schema with all required fields. **No schema changes needed.**

Existing fields we'll use:
```prisma
model Contact {
  id              String    @id @default(uuid())
  userId          String
  name            String
  email           String?
  phone           String?
  linkedInUrl     String?
  company         String?
  industry        String?
  role            String?
  priority        Priority  @default(MEDIUM)
  gender          Gender?
  birthday        DateTime?
  profilePicture  String?
  notes           String?
  lastContactedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**Indexes to verify exist:**
- `[userId, priority]` - For filtering by priority
- `[userId, lastContactedAt]` - For sorting by last contact

These indexes already exist in the schema.

## Security Considerations

1. **Authorization Enforcement** - Every resolver must verify user owns the contact
2. **Input Sanitization** - Validate and sanitize all string inputs (especially notes field)
3. **SQL Injection Prevention** - Prisma parameterized queries (handled automatically)
4. **XSS Prevention** - Sanitize HTML in notes field if rich text is added
5. **Rate Limiting** - Apply rate limits to create/update operations (future enhancement)

**Implementation:**
- Use `@CurrentUser()` decorator to get authenticated user
- Filter all queries by `userId` from JWT token
- Never trust client-provided `userId` in mutations
