# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-10-29-contact-export/spec.md

> Created: 2025-10-29
> Status: Ready for Implementation

## Tasks

- [ ] 1. Database Schema & Migration
  - [ ] 1.1 Write Prisma schema tests for ContactExport model
  - [ ] 1.2 Create Prisma schema for ContactExport model with enums (ExportFormat, ExportScope)
  - [ ] 1.3 Add ContactExport relation to User model
  - [ ] 1.4 Generate Prisma migration files
  - [ ] 1.5 Run migration in development database
  - [ ] 1.6 Seed test data for export history (optional)
  - [ ] 1.7 Verify schema creation and foreign key constraints
  - [ ] 1.8 Verify all Prisma tests pass

- [ ] 2. Backend Service Layer - Export Logic
  - [ ] 2.1 Write unit tests for ContactExportService methods
  - [ ] 2.2 Install dependencies: csv-writer, exceljs, sanitize-filename
  - [ ] 2.3 Create ContactExportService with method stubs
  - [ ] 2.4 Implement exportContacts() main method with scope handling (ALL/FILTERED/SELECTED)
  - [ ] 2.5 Implement generateCSV() method with RFC 4180 compliance
  - [ ] 2.6 Implement generateExcel() method with styling and formatting
  - [ ] 2.7 Implement sanitizeFilename() utility function
  - [ ] 2.8 Implement recordExportHistory() database insertion
  - [ ] 2.9 Implement getExportHistory() query method
  - [ ] 2.10 Add error handling and logging
  - [ ] 2.11 Verify all service unit tests pass

- [ ] 3. Backend - GraphQL API
  - [ ] 3.1 Write integration tests for ContactExportResolver
  - [ ] 3.2 Create GraphQL schema types (ExportContactsInput, ExportContactsPayload, ExportHistoryConnection)
  - [ ] 3.3 Create DTOs for input validation (ExportContactsInput, ContactFilterInput)
  - [ ] 3.4 Create ContactExportResolver with @Mutation decorator
  - [ ] 3.5 Implement exportContacts mutation with authorization checks
  - [ ] 3.6 Implement exportHistory query with pagination
  - [ ] 3.7 Add GraphQL error handling with custom error codes
  - [ ] 3.8 Test GraphQL endpoints with GraphQL Playground
  - [ ] 3.9 Verify all GraphQL integration tests pass

- [ ] 4. Backend - REST API
  - [ ] 4.1 Write integration tests for ContactExportController
  - [ ] 4.2 Create ContactExportController with route decorators
  - [ ] 4.3 Implement POST /api/contacts/export endpoint
  - [ ] 4.4 Implement file streaming response with appropriate headers
  - [ ] 4.5 Implement GET /api/contacts/export-history endpoint
  - [ ] 4.6 Add request validation using class-validator
  - [ ] 4.7 Add JWT authentication guard
  - [ ] 4.8 Add error handling middleware
  - [ ] 4.9 Test REST endpoints with Postman/Insomnia
  - [ ] 4.10 Verify all REST integration tests pass

- [ ] 5. Frontend - Export Dialog Component
  - [ ] 5.1 Write component tests for ExportDialog
  - [ ] 5.2 Create ExportDialog component with shadcn Dialog
  - [ ] 5.3 Add format selector (RadioGroup: CSV/Excel)
  - [ ] 5.4 Add scope selector (RadioGroup: All/Filtered/Selected)
  - [ ] 5.5 Add contact count preview display
  - [ ] 5.6 Add filename input field with validation
  - [ ] 5.7 Add Confirm and Cancel buttons
  - [ ] 5.8 Create useExportContacts hook with GraphQL mutation
  - [ ] 5.9 Implement file download trigger on mutation success
  - [ ] 5.10 Add loading states and error handling
  - [ ] 5.11 Add responsive design for mobile/desktop
  - [ ] 5.12 Verify all component tests pass

- [ ] 6. Frontend - Export Button Integration
  - [ ] 6.1 Write integration tests for export button placement
  - [ ] 6.2 Add "Export Contacts" button to Contacts page toolbar
  - [ ] 6.3 Add "Export Contacts" button to Settings page
  - [ ] 6.4 Connect buttons to ExportDialog component
  - [ ] 6.5 Pass current filters to dialog (for FILTERED scope)
  - [ ] 6.6 Pass selected contact IDs to dialog (for SELECTED scope)
  - [ ] 6.7 Add button icons (Download icon from Lucide)
  - [ ] 6.8 Verify button behavior on both pages

- [ ] 7. Frontend - Export History View
  - [ ] 7.1 Write component tests for ExportHistory
  - [ ] 7.2 Create ExportHistory component for Settings page
  - [ ] 7.3 Create useExportHistory hook with GraphQL query
  - [ ] 7.4 Implement table with columns: Date/Time, Format, Scope, Contact Count, Filename
  - [ ] 7.5 Add sorting by createdAt DESC
  - [ ] 7.6 Add pagination (load more button or infinite scroll)
  - [ ] 7.7 Format dates with relative time (e.g., "2 hours ago")
  - [ ] 7.8 Add empty state for no export history
  - [ ] 7.9 Verify all component tests pass

- [ ] 8. End-to-End Testing
  - [ ] 8.1 Write E2E test for exporting all contacts to CSV
  - [ ] 8.2 Write E2E test for exporting filtered contacts to Excel
  - [ ] 8.3 Write E2E test for exporting selected contacts to CSV
  - [ ] 8.4 Write E2E test for custom filename input
  - [ ] 8.5 Write E2E test for export from Settings page
  - [ ] 8.6 Write E2E test for viewing export history
  - [ ] 8.7 Write E2E test for unauthorized export attempt
  - [ ] 8.8 Write E2E performance test (1000 contacts)
  - [ ] 8.9 Verify all E2E tests pass with Playwright

- [ ] 9. Security & Performance
  - [ ] 9.1 Run Semgrep security scan on export service
  - [ ] 9.2 Review authorization checks (user can only export own contacts)
  - [ ] 9.3 Review input validation and sanitization
  - [ ] 9.4 Test file generation performance with 100, 500, 1000 contacts
  - [ ] 9.5 Verify memory usage during concurrent exports
  - [ ] 9.6 Address any security findings from Semgrep
  - [ ] 9.7 Verify performance meets <5s target for 1000 contacts

- [ ] 10. Documentation & Finalization
  - [ ] 10.1 Update API documentation with export endpoints
  - [ ] 10.2 Add JSDoc comments to service methods
  - [ ] 10.3 Update GraphQL schema documentation
  - [ ] 10.4 Create user guide for export feature (optional)
  - [ ] 10.5 Update CHANGELOG.md with new feature
  - [ ] 10.6 Run full test suite (unit + integration + E2E)
  - [ ] 10.7 Verify test coverage ≥ 85%
  - [ ] 10.8 Create pull request with comprehensive description
  - [ ] 10.9 Request code review
  - [ ] 10.10 Address review feedback and merge

## Implementation Notes

### Task Dependencies

**Sequential Dependencies:**
- Task 1 must complete before Task 2 (database schema required for service)
- Task 2 must complete before Tasks 3 & 4 (service layer required for APIs)
- Tasks 3 & 4 can run in parallel (independent API implementations)
- Tasks 5, 6, 7 can start after Task 3 completes (frontend needs GraphQL)
- Task 8 must wait for all previous tasks (E2E tests need full system)
- Task 9 can run in parallel with Task 8
- Task 10 is final cleanup and documentation

### Estimated Time per Task

1. Database Schema & Migration: **4 hours**
2. Backend Service Layer: **8 hours**
3. GraphQL API: **4 hours**
4. REST API: **3 hours**
5. Frontend Export Dialog: **6 hours**
6. Frontend Export Button Integration: **2 hours**
7. Frontend Export History: **4 hours**
8. End-to-End Testing: **6 hours**
9. Security & Performance: **3 hours**
10. Documentation & Finalization: **2 hours**

**Total Estimated Time:** 42 hours (~5 working days)

### Testing Strategy

**Test-Driven Development (TDD) Approach:**
- Write tests FIRST for each major component (steps 1.1, 2.1, 3.1, 4.1, 5.1, 7.1, 8.1-8.8)
- Implement functionality to make tests pass
- Refactor code while keeping tests green
- Verify all tests pass at the end of each major task

**Test Coverage Goals:**
- Unit tests: Service methods, utility functions
- Integration tests: GraphQL resolvers, REST controllers
- Component tests: React components with React Testing Library
- E2E tests: Full user workflows with Playwright
- Target: 85%+ overall coverage

### Development Environment

**Prerequisites:**
- PostgreSQL database running (Docker Compose)
- Redis running (for caching, if needed)
- All npm dependencies installed
- Prisma CLI available

**Development Commands:**
```bash
# Run database migration
pnpm prisma migrate dev

# Start development servers
pnpm dev

# Run tests
pnpm test               # All tests
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests only
pnpm test:e2e          # E2E tests only
pnpm test:cov          # Coverage report

# Run Semgrep scan
semgrep --config auto apps/api/src/contacts/contact-export.*
```

### Common Pitfalls to Avoid

1. **CSV Escaping:** Don't forget to escape commas, quotes, and newlines in CSV fields
2. **Excel Date Formatting:** Use proper Excel date type, not string representation
3. **Filename Sanitization:** Always sanitize user-provided filenames to prevent path traversal
4. **Memory Management:** Stream large files instead of loading entire file into memory
5. **Authorization:** Always verify userId from JWT matches contact ownership
6. **File Download:** Ensure proper Content-Disposition header for browser download
7. **Error Handling:** Provide user-friendly error messages for all failure scenarios
8. **Test Flakiness:** Use fixed dates/times in tests, avoid randomness

### Success Criteria

**Feature is complete when:**
- ✅ All 10 tasks completed and checked off
- ✅ All tests passing (unit + integration + E2E)
- ✅ Test coverage ≥ 85%
- ✅ Semgrep security scan passes with 0 critical findings
- ✅ Performance target met (<5s for 1000 contacts)
- ✅ User can successfully export contacts in both CSV and Excel formats
- ✅ User can view export history in Settings
- ✅ Code reviewed and approved
- ✅ Merged to phase-3 branch

### Next Steps After Completion

1. Manual QA testing in development environment
2. Deploy to staging environment for testing
3. User acceptance testing (UAT)
4. Deploy to production
5. Monitor for errors and performance issues
6. Gather user feedback for improvements

---

**Ready to begin implementation!** 🚀

Start with Task 1 (Database Schema & Migration) following TDD approach.
