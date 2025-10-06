# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-10-06-contact-crud-operations/spec.md

> Created: 2025-10-06
> Version: 1.0.0

## Test Coverage Goals

- **Overall Coverage:** 80%+ across all contact CRUD code
- **Unit Tests:** 100% coverage of service methods and validation logic
- **Integration Tests:** All GraphQL resolvers with authentication scenarios
- **E2E Tests:** Complete user workflows from frontend to database

## Unit Tests

### ContactService Tests (apps/api/src/contact/contact.service.spec.ts)

**Test Suite: findOne()**
- ✓ Should return contact when user owns it
- ✓ Should return null when contact doesn't exist
- ✓ Should return null when contact belongs to different user
- ✓ Should handle database errors gracefully

**Test Suite: findAll()**
- ✓ Should return paginated contacts for user
- ✓ Should return empty array when user has no contacts
- ✓ Should filter by priority correctly
- ✓ Should filter by company correctly
- ✓ Should filter by industry correctly
- ✓ Should search by name (case-insensitive)
- ✓ Should search by email (case-insensitive)
- ✓ Should search by company (case-insensitive)
- ✓ Should combine multiple filters
- ✓ Should sort by name ascending
- ✓ Should sort by createdAt descending (default)
- ✓ Should sort by lastContactedAt descending
- ✓ Should implement cursor-based pagination correctly
- ✓ Should respect pagination limit (max 100)
- ✓ Should return correct pageInfo (hasNextPage, hasPreviousPage, cursors)
- ✓ Should return correct totalCount
- ✓ Should only return user's own contacts

**Test Suite: create()**
- ✓ Should create contact with all fields
- ✓ Should create contact with only required fields (name)
- ✓ Should set userId from authenticated user
- ✓ Should set default priority to MEDIUM
- ✓ Should set createdAt and updatedAt timestamps
- ✓ Should throw error if userId is missing
- ✓ Should throw error if name is empty
- ✓ Should handle database constraint violations

**Test Suite: update()**
- ✓ Should update contact when user owns it
- ✓ Should update only provided fields
- ✓ Should update updatedAt timestamp
- ✓ Should throw error when contact doesn't exist
- ✓ Should throw error when user doesn't own contact
- ✓ Should not update userId
- ✓ Should not update id
- ✓ Should not update createdAt
- ✓ Should handle database errors

**Test Suite: delete()**
- ✓ Should delete contact when user owns it
- ✓ Should return true on successful deletion
- ✓ Should cascade delete related emails
- ✓ Should cascade delete related activities
- ✓ Should cascade delete related reminders
- ✓ Should cascade delete contact-tag relationships
- ✓ Should throw error when contact doesn't exist
- ✓ Should throw error when user doesn't own contact

**Mocking Requirements:**
- Mock PrismaService with jest.fn() for all database operations
- Mock contact data factory for consistent test data
- Mock user context for authorization testing

### DTO Validation Tests

**CreateContactDto Tests (apps/api/src/contact/dto/create-contact.dto.spec.ts)**
- ✓ Should pass with all valid fields
- ✓ Should pass with only required field (name)
- ✓ Should fail when name is missing
- ✓ Should fail when name is empty string
- ✓ Should fail when name exceeds 255 characters
- ✓ Should fail when email is invalid format
- ✓ Should fail when linkedInUrl is invalid URL
- ✓ Should fail when phone exceeds 50 characters
- ✓ Should fail when notes exceed 10,000 characters
- ✓ Should accept valid Priority enum values
- ✓ Should reject invalid Priority values
- ✓ Should accept valid Gender enum values
- ✓ Should reject invalid Gender values
- ✓ Should accept valid DateTime for birthday
- ✓ Should sanitize HTML in notes field (if rich text enabled)

**UpdateContactDto Tests (apps/api/src/contact/dto/update-contact.dto.spec.ts)**
- ✓ Should pass with all fields undefined (partial update)
- ✓ Should pass with single field update
- ✓ Should pass with multiple field updates
- ✓ Same validation rules as CreateContactDto for each field
- ✓ Should not allow updating userId
- ✓ Should not allow updating id

## Integration Tests

### ContactResolver Tests (apps/api/src/contact/contact.resolver.spec.ts)

**Test Suite: contact query**
- ✓ Should return contact when authenticated user owns it
- ✓ Should return null when contact doesn't exist
- ✓ Should throw FORBIDDEN error when user doesn't own contact
- ✓ Should throw UNAUTHORIZED error when user not authenticated
- ✓ Should include all contact fields in response

**Test Suite: contacts query**
- ✓ Should return paginated contacts for authenticated user
- ✓ Should return empty result when user has no contacts
- ✓ Should filter by priority HIGH
- ✓ Should filter by priority MEDIUM
- ✓ Should filter by priority LOW
- ✓ Should filter by company
- ✓ Should filter by industry
- ✓ Should filter by role
- ✓ Should search across name, email, company
- ✓ Should combine search and filters
- ✓ Should paginate with default limit (20)
- ✓ Should paginate with custom limit
- ✓ Should respect max limit (100)
- ✓ Should implement cursor pagination
- ✓ Should return correct pageInfo
- ✓ Should return totalCount
- ✓ Should sort by name ASC
- ✓ Should sort by createdAt DESC (default)
- ✓ Should throw UNAUTHORIZED when not authenticated

**Test Suite: createContact mutation**
- ✓ Should create contact with all fields
- ✓ Should create contact with only required fields
- ✓ Should automatically set userId from JWT
- ✓ Should set default priority to MEDIUM
- ✓ Should throw UNAUTHORIZED when not authenticated
- ✓ Should throw BAD_REQUEST when validation fails
- ✓ Should throw BAD_REQUEST when email is invalid
- ✓ Should throw BAD_REQUEST when URL is invalid

**Test Suite: updateContact mutation**
- ✓ Should update contact when user owns it
- ✓ Should update single field
- ✓ Should update multiple fields
- ✓ Should not update userId even if provided
- ✓ Should throw UNAUTHORIZED when not authenticated
- ✓ Should throw FORBIDDEN when user doesn't own contact
- ✓ Should throw NOT_FOUND when contact doesn't exist
- ✓ Should throw BAD_REQUEST when validation fails

**Test Suite: deleteContact mutation**
- ✓ Should delete contact when user owns it
- ✓ Should return true on successful deletion
- ✓ Should throw UNAUTHORIZED when not authenticated
- ✓ Should throw FORBIDDEN when user doesn't own contact
- ✓ Should throw NOT_FOUND when contact doesn't exist
- ✓ Should verify cascade deletion of related data

**Mocking Requirements:**
- Mock ContactService for all operations
- Mock AuthGuard to provide authenticated user context
- Mock @CurrentUser decorator for user injection
- Create test GraphQL execution context

## E2E Tests (Frontend + Backend)

### Contact List Page Tests (apps/web/e2e/contacts/list.spec.ts)

**Test Suite: Contact List Display**
- ✓ Should display contact list when user has contacts
- ✓ Should display empty state when user has no contacts
- ✓ Should display contact cards with name, email, company, priority
- ✓ Should paginate contacts (load more on scroll or button click)
- ✓ Should redirect to login when not authenticated

**Test Suite: Search Functionality**
- ✓ Should filter contacts by search term in real-time
- ✓ Should search across name field
- ✓ Should search across email field
- ✓ Should search across company field
- ✓ Should debounce search input (wait 300ms before querying)
- ✓ Should display "No results" message when search returns empty

**Test Suite: Filter Functionality**
- ✓ Should filter by priority HIGH
- ✓ Should filter by priority MEDIUM
- ✓ Should filter by priority LOW
- ✓ Should filter by company dropdown
- ✓ Should filter by industry dropdown
- ✓ Should combine search and filters
- ✓ Should clear filters with reset button

**Test Suite: Sorting**
- ✓ Should sort by name A-Z
- ✓ Should sort by name Z-A
- ✓ Should sort by created date (newest first)
- ✓ Should sort by created date (oldest first)
- ✓ Should persist sort selection across page refreshes

### Contact Creation Tests (apps/web/e2e/contacts/create.spec.ts)

**Test Suite: Create Contact Form**
- ✓ Should display create contact form
- ✓ Should show all form fields (name, email, phone, LinkedIn, etc.)
- ✓ Should create contact with all fields filled
- ✓ Should create contact with only required field (name)
- ✓ Should show validation error when name is empty
- ✓ Should show validation error for invalid email
- ✓ Should show validation error for invalid LinkedIn URL
- ✓ Should show success toast after creation
- ✓ Should redirect to contact detail page after creation
- ✓ Should clear form after successful creation
- ✓ Should preserve form data on navigation back (if browser back)
- ✓ Should show loading state during submission
- ✓ Should disable submit button when submitting
- ✓ Should handle server errors gracefully

### Contact Detail & Edit Tests (apps/web/e2e/contacts/detail.spec.ts)

**Test Suite: Contact Detail View**
- ✓ Should display all contact information
- ✓ Should show edit button
- ✓ Should show delete button
- ✓ Should navigate to edit mode on edit button click
- ✓ Should display 404 error for non-existent contact
- ✓ Should display 403 error for unauthorized contact access

**Test Suite: Update Contact**
- ✓ Should pre-fill form with existing contact data
- ✓ Should update single field
- ✓ Should update multiple fields
- ✓ Should show validation errors
- ✓ Should show success toast after update
- ✓ Should display updated data after save
- ✓ Should cancel edit and revert changes
- ✓ Should show loading state during update

**Test Suite: Delete Contact**
- ✓ Should show delete confirmation dialog
- ✓ Should delete contact on confirmation
- ✓ Should cancel deletion on dialog cancel
- ✓ Should show success toast after deletion
- ✓ Should redirect to contact list after deletion
- ✓ Should remove contact from list immediately (optimistic update)

### Responsive Design Tests (apps/web/e2e/contacts/responsive.spec.ts)

**Test Suite: Mobile Viewport (375px)**
- ✓ Should display stacked card layout
- ✓ Should show hamburger menu
- ✓ Should display mobile-optimized form
- ✓ Should handle touch interactions

**Test Suite: Tablet Viewport (768px)**
- ✓ Should display grid layout (2 columns)
- ✓ Should show full navigation
- ✓ Should display responsive form

**Test Suite: Desktop Viewport (1440px)**
- ✓ Should display grid layout (3-4 columns)
- ✓ Should show sidebar filters
- ✓ Should display full-width form

## Performance Tests

**Load Testing**
- ✓ Should load list of 100 contacts in <2 seconds
- ✓ Should search 1000+ contacts in <500ms
- ✓ Should submit form in <1 second

**Optimization Verification**
- ✓ Should prefetch next page of contacts
- ✓ Should cache contact list with TanStack Query
- ✓ Should implement optimistic updates for create/update/delete
- ✓ Should debounce search input

## Security Tests

**Authorization Tests**
- ✓ Should prevent access to other users' contacts
- ✓ Should prevent unauthorized GraphQL queries
- ✓ Should verify JWT token on every request

**Input Validation Tests**
- ✓ Should sanitize HTML in notes field
- ✓ Should validate email format on server
- ✓ Should validate URL format on server
- ✓ Should reject excessively long inputs

**XSS Prevention Tests**
- ✓ Should escape user input in contact display
- ✓ Should prevent script injection in notes field
- ✓ Should sanitize LinkedIn URLs

## Test Coverage Enforcement

All code must pass the following thresholds before merging:

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## Testing Tools

- **Unit Tests:** Jest
- **Integration Tests:** Jest + @nestjs/testing
- **E2E Tests:** Playwright
- **Coverage Reports:** Jest coverage + Codecov
- **Mocking:** jest.fn(), createMock() from @golevelup/ts-jest
