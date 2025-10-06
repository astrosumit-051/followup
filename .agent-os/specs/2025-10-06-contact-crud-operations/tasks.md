# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-10-06-contact-crud-operations/spec.md

> Created: 2025-10-06
> Status: Ready for Implementation

## Tasks

- [x] 1. Backend: DTOs and Validation
  - [x] 1.1 Write unit tests for CreateContactDto validation
  - [x] 1.2 Create CreateContactDto with class-validator decorators (apps/api/src/contact/dto/create-contact.dto.ts)
  - [x] 1.3 Write unit tests for UpdateContactDto validation
  - [x] 1.4 Create UpdateContactDto with optional fields (apps/api/src/contact/dto/update-contact.dto.ts)
  - [x] 1.5 Create ContactFilterInput and ContactPaginationInput DTOs
  - [x] 1.6 Verify all DTO tests pass (86 tests passing)

- [x] 2. Backend: Contact Service Layer (33 tests passing)
  - [x] 2.1 Write unit tests for ContactService.findOne()
  - [x] 2.2 Implement ContactService.findOne() with Prisma (apps/api/src/contact/contact.service.ts)
  - [x] 2.3 Write unit tests for ContactService.findAll() with pagination
  - [x] 2.4 Implement ContactService.findAll() with cursor-based pagination and filters
  - [x] 2.5 Write unit tests for ContactService.create()
  - [x] 2.6 Implement ContactService.create() with userId injection
  - [x] 2.7 Write unit tests for ContactService.update() with authorization
  - [x] 2.8 Implement ContactService.update() with ownership verification
  - [x] 2.9 Write unit tests for ContactService.delete() with cascade behavior
  - [x] 2.10 Implement ContactService.delete() with ownership verification
  - [x] 2.11 Verify all service unit tests pass

- [x] 3. Backend: GraphQL Type Definitions
  - [x] 3.1 Create Contact GraphQL type (apps/api/src/contact/entities/contact.entity.ts)
  - [x] 3.2 Create ContactConnection and ContactEdge types for pagination
  - [x] 3.3 Create PageInfo type with hasNextPage, cursors, etc.
  - [x] 3.4 Create Priority and Gender GraphQL enums
  - [x] 3.5 Verify GraphQL schema generation works

- [ ] 4. Backend: Contact Resolver
  - [ ] 4.1 Write integration tests for contact query (single contact retrieval)
  - [ ] 4.2 Implement contact query resolver with @UseGuards(AuthGuard)
  - [ ] 4.3 Write integration tests for contacts query (list with pagination)
  - [ ] 4.4 Implement contacts query resolver with filtering and pagination
  - [ ] 4.5 Write integration tests for createContact mutation
  - [ ] 4.6 Implement createContact mutation with @CurrentUser() decorator
  - [ ] 4.7 Write integration tests for updateContact mutation with authorization
  - [ ] 4.8 Implement updateContact mutation with ownership check
  - [ ] 4.9 Write integration tests for deleteContact mutation with cascade
  - [ ] 4.10 Implement deleteContact mutation with ownership check
  - [ ] 4.11 Verify all resolver integration tests pass

- [ ] 5. Backend: Contact Module Setup
  - [ ] 5.1 Create ContactModule with providers (ContactService, ContactResolver)
  - [ ] 5.2 Import ContactModule in AppModule
  - [ ] 5.3 Add AuthModule import for @UseGuards(AuthGuard)
  - [ ] 5.4 Verify GraphQL Playground shows contact queries and mutations
  - [ ] 5.5 Test GraphQL API manually with valid JWT token
  - [ ] 5.6 Run all backend tests and verify 80%+ coverage

- [ ] 6. Frontend: Install Dependencies
  - [ ] 6.1 Install react-hook-form and @hookform/resolvers
  - [ ] 6.2 Install zod for validation
  - [ ] 6.3 Install @tanstack/react-query and devtools
  - [ ] 6.4 Verify dependencies installed correctly

- [ ] 7. Frontend: Validation Schemas
  - [ ] 7.1 Create Zod schema for CreateContactInput (apps/web/lib/validations/contact.ts)
  - [ ] 7.2 Create Zod schema for UpdateContactInput
  - [ ] 7.3 Export TypeScript types from Zod schemas
  - [ ] 7.4 Write unit tests for Zod validation rules
  - [ ] 7.5 Verify all validation tests pass

- [ ] 8. Frontend: API Client Layer
  - [ ] 8.1 Create GraphQL queries for contact and contacts (apps/web/lib/graphql/contacts.ts)
  - [ ] 8.2 Create GraphQL mutations for createContact, updateContact, deleteContact
  - [ ] 8.3 Create TanStack Query hooks for useContact()
  - [ ] 8.4 Create TanStack Query hooks for useContacts() with pagination
  - [ ] 8.5 Create TanStack Query mutation hooks for useCreateContact()
  - [ ] 8.6 Create TanStack Query mutation hooks for useUpdateContact()
  - [ ] 8.7 Create TanStack Query mutation hooks for useDeleteContact()
  - [ ] 8.8 Write unit tests for API client functions
  - [ ] 8.9 Verify all API client tests pass

- [ ] 9. Frontend: Reusable Contact Components
  - [ ] 9.1 Create ContactCard component for list display (apps/web/components/contacts/ContactCard.tsx)
  - [ ] 9.2 Create ContactForm component with react-hook-form (apps/web/components/contacts/ContactForm.tsx)
  - [ ] 9.3 Create ContactListEmpty component for empty state
  - [ ] 9.4 Create ContactFilters component with priority, company, industry filters
  - [ ] 9.5 Create ContactSearchBar component with debounced input
  - [ ] 9.6 Create ContactSortDropdown component
  - [ ] 9.7 Create ContactDeleteDialog confirmation component
  - [ ] 9.8 Write component unit tests with React Testing Library
  - [ ] 9.9 Verify all component tests pass

- [ ] 10. Frontend: Contact List Page
  - [ ] 10.1 Create app/(dashboard)/contacts/page.tsx with Server Component
  - [ ] 10.2 Implement contact list display with ContactCard grid
  - [ ] 10.3 Implement search functionality with debouncing
  - [ ] 10.4 Implement filter UI with ContactFilters component
  - [ ] 10.5 Implement sorting UI with ContactSortDropdown
  - [ ] 10.6 Implement cursor-based pagination (infinite scroll or load more button)
  - [ ] 10.7 Implement empty state with ContactListEmpty
  - [ ] 10.8 Add "Create Contact" button linking to /contacts/new
  - [ ] 10.9 Write E2E tests for contact list page with Playwright
  - [ ] 10.10 Verify all E2E tests pass

- [ ] 11. Frontend: Create Contact Page
  - [ ] 11.1 Create app/(dashboard)/contacts/new/page.tsx
  - [ ] 11.2 Implement ContactForm with all fields
  - [ ] 11.3 Implement form submission with useCreateContact hook
  - [ ] 11.4 Implement optimistic UI updates
  - [ ] 11.5 Show success toast on creation
  - [ ] 11.6 Redirect to contact detail page after creation
  - [ ] 11.7 Handle validation errors and display field-level errors
  - [ ] 11.8 Implement loading state and disabled submit button
  - [ ] 11.9 Write E2E tests for contact creation flow
  - [ ] 11.10 Verify all E2E tests pass

- [ ] 12. Frontend: Contact Detail Page
  - [ ] 12.1 Create app/(dashboard)/contacts/[id]/page.tsx with Server Component
  - [ ] 12.2 Fetch contact data with useContact hook
  - [ ] 12.3 Display all contact fields in detail view
  - [ ] 12.4 Add "Edit" button navigating to /contacts/[id]/edit
  - [ ] 12.5 Add "Delete" button with ContactDeleteDialog
  - [ ] 12.6 Implement delete functionality with useDeleteContact hook
  - [ ] 12.7 Show success toast on deletion
  - [ ] 12.8 Redirect to /contacts after deletion
  - [ ] 12.9 Handle loading and error states
  - [ ] 12.10 Write E2E tests for contact detail page
  - [ ] 12.11 Verify all E2E tests pass

- [ ] 13. Frontend: Edit Contact Page
  - [ ] 13.1 Create app/(dashboard)/contacts/[id]/edit/page.tsx
  - [ ] 13.2 Pre-fill ContactForm with existing contact data
  - [ ] 13.3 Implement form submission with useUpdateContact hook
  - [ ] 13.4 Implement optimistic UI updates
  - [ ] 13.5 Show success toast on update
  - [ ] 13.6 Navigate back to detail page after update
  - [ ] 13.7 Add "Cancel" button to navigate back without saving
  - [ ] 13.8 Handle validation errors
  - [ ] 13.9 Write E2E tests for contact edit flow
  - [ ] 13.10 Verify all E2E tests pass

- [ ] 14. Frontend: Responsive Design
  - [ ] 14.1 Test contact list page on mobile viewport (375px)
  - [ ] 14.2 Adjust ContactCard layout for mobile (stacked, full-width)
  - [ ] 14.3 Test contact list page on tablet viewport (768px)
  - [ ] 14.4 Test contact list page on desktop viewport (1440px)
  - [ ] 14.5 Test ContactForm responsiveness on all viewports
  - [ ] 14.6 Test ContactFilters and search on mobile (drawer or accordion)
  - [ ] 14.7 Verify touch interactions work on mobile devices
  - [ ] 14.8 Write responsive E2E tests for all viewports
  - [ ] 14.9 Verify all responsive tests pass

- [ ] 15. Security & Performance Validation
  - [ ] 15.1 Run Semgrep scan on all contact CRUD code
  - [ ] 15.2 Verify authorization checks in every resolver method
  - [ ] 15.3 Test SQL injection prevention with malicious inputs
  - [ ] 15.4 Test XSS prevention in notes field
  - [ ] 15.5 Verify rate limiting on mutations (if configured)
  - [ ] 15.6 Test contact list performance with 1000+ contacts
  - [ ] 15.7 Verify search response time <500ms
  - [ ] 15.8 Verify form submission time <1 second
  - [ ] 15.9 Test pagination performance
  - [ ] 15.10 Address all Semgrep findings

- [ ] 16. Documentation & Final Testing
  - [ ] 16.1 Update CLAUDE.md with contact feature usage notes
  - [ ] 16.2 Document GraphQL API in README or API docs
  - [ ] 16.3 Run full test suite (unit + integration + E2E)
  - [ ] 16.4 Verify 80%+ code coverage across all contact code
  - [ ] 16.5 Test complete workflow: create → list → detail → edit → delete
  - [ ] 16.6 Test error scenarios (network failure, validation errors, unauthorized access)
  - [ ] 16.7 Verify all console errors are handled
  - [ ] 16.8 Create brief setup guide for contact management features
  - [ ] 16.9 Update roadmap.md to mark Contact CRUD as complete
  - [ ] 16.10 Verify all tests pass before marking complete
