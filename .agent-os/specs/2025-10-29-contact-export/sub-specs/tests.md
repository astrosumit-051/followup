# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-10-29-contact-export/spec.md

> Created: 2025-10-29
> Version: 1.0.0

## Test Coverage Goals

- **Overall Coverage:** 85%+ across all code
- **Critical Paths:** 100% coverage (file generation, authorization)
- **Unit Tests:** Service methods, utility functions
- **Integration Tests:** API endpoints, database operations
- **E2E Tests:** Complete user workflows from UI to download

## Unit Tests

### ContactExportService

**File:** `apps/api/src/contacts/contact-export.service.spec.ts`

**Tests:**

1. **exportContacts() - All Contacts, CSV Format**
   - Should fetch all user's contacts
   - Should generate CSV file with correct headers
   - Should return export result with filename and contact count
   - Should record export history in database

2. **exportContacts() - Filtered Contacts, Excel Format**
   - Should apply filter criteria to contact query
   - Should generate Excel file with correct formatting
   - Should return only filtered contacts count

3. **exportContacts() - Selected Contacts, CSV Format**
   - Should fetch only specified contact IDs
   - Should validate all IDs belong to user
   - Should throw ForbiddenException if invalid ID found

4. **exportContacts() - Empty Result Handling**
   - Should handle zero contacts gracefully
   - Should still create export record with count 0
   - Should return empty file (headers only)

5. **generateCSV() - Standard Data**
   - Should format contact fields correctly
   - Should escape commas, quotes, and newlines
   - Should include UTF-8 BOM for Excel compatibility
   - Should format dates as ISO 8601

6. **generateCSV() - Special Characters**
   - Should handle contacts with commas in names
   - Should handle contacts with quotes in notes
   - Should handle contacts with newlines in notes
   - Should handle null/undefined values

7. **generateExcel() - Standard Data**
   - Should create workbook with "Contacts" sheet
   - Should freeze header row
   - Should auto-size columns
   - Should format dates as Excel date type

8. **generateExcel() - Styling**
   - Should apply bold formatting to headers
   - Should enable text wrap for notes column
   - Should set appropriate column widths

9. **sanitizeFilename() - Valid Input**
   - Should preserve alphanumeric characters
   - Should preserve hyphens and underscores
   - Should convert to lowercase

10. **sanitizeFilename() - Invalid Characters**
    - Should remove special characters (/, \\, :, *, ?, ", <, >, |)
    - Should replace spaces with hyphens
    - Should truncate to max 100 characters
    - Should remove leading/trailing hyphens

11. **recordExportHistory() - Success**
    - Should create ContactExport record in database
    - Should set correct userId, format, scope
    - Should record contactCount and fileSize

12. **getExportHistory() - Pagination**
    - Should return most recent exports first
    - Should limit to specified count (default 20)
    - Should filter by userId only

### Utility Functions

**File:** `apps/api/src/contacts/export-utils.spec.ts`

1. **formatContactForExport() - Complete Contact**
   - Should map all contact fields correctly
   - Should format priority as readable string
   - Should format gender as readable string
   - Should join tags with commas

2. **formatContactForExport() - Minimal Contact**
   - Should handle missing optional fields
   - Should use empty strings for null values

3. **determineExportStrategy() - Sync Threshold**
   - Should return 'SYNC' for <= 1000 contacts
   - Should return 'ASYNC' for > 1000 contacts

4. **generateTimestamp() - Filename Format**
   - Should return format YYYY-MM-DD-HHmmss
   - Should use current time

## Integration Tests

### ContactExportController (REST API)

**File:** `apps/api/src/contacts/contact-export.controller.spec.ts`

**Tests:**

1. **POST /api/contacts/export - All Contacts, CSV**
   - Should return 200 OK with file stream
   - Should include Content-Disposition header
   - Should include X-Export-Id header
   - Should record export history

2. **POST /api/contacts/export - Filtered Contacts, Excel**
   - Should apply filters to query
   - Should return Excel file stream
   - Should return correct contact count in header

3. **POST /api/contacts/export - Selected Contacts**
   - Should validate contactIds array
   - Should return only selected contacts

4. **POST /api/contacts/export - Unauthorized**
   - Should return 401 without JWT token
   - Should return 401 with invalid JWT token

5. **POST /api/contacts/export - Forbidden**
   - Should return 403 if contactIds belong to another user

6. **POST /api/contacts/export - Bad Request**
   - Should return 400 for invalid format enum
   - Should return 400 for invalid scope enum
   - Should return 400 for missing filterCriteria (FILTERED scope)
   - Should return 400 for missing contactIds (SELECTED scope)

7. **POST /api/contacts/export - File Generation Error**
   - Should return 500 if CSV generation fails
   - Should return 500 if Excel generation fails
   - Should log error details

8. **GET /api/contacts/export-history**
   - Should return user's export history
   - Should order by createdAt DESC
   - Should limit to query parameter (default 20)

### ContactExportResolver (GraphQL)

**File:** `apps/api/src/contacts/contact-export.resolver.spec.ts`

**Tests:**

1. **exportContacts mutation - All Contacts, CSV**
   - Should return ExportContactsPayload
   - Should include exportId, contactCount, filename, downloadUrl

2. **exportContacts mutation - Filtered Contacts, Excel**
   - Should apply filterCriteria to query
   - Should return correct payload

3. **exportContacts mutation - Selected Contacts**
   - Should validate contactIds
   - Should reject invalid IDs with GraphQL error

4. **exportContacts mutation - Validation Errors**
   - Should return GraphQL error for invalid format
   - Should return GraphQL error for invalid scope
   - Should return GraphQL error for missing required fields

5. **exportContacts mutation - Unauthorized**
   - Should return GraphQL error without authentication
   - Should check JWT token from context

6. **exportHistory query - Standard Request**
   - Should return ExportHistoryConnection
   - Should include edges with ExportHistoryRecord nodes
   - Should include pageInfo with pagination details

7. **exportHistory query - Empty History**
   - Should return empty edges array
   - Should set totalCount to 0

### Database Integration

**File:** `apps/api/src/contacts/contact-export.integration.spec.ts`

1. **ContactExport Model - Create**
   - Should insert record into database
   - Should auto-generate id (CUID)
   - Should set createdAt to current timestamp

2. **ContactExport Model - Foreign Key Constraint**
   - Should reject invalid userId
   - Should enforce referential integrity

3. **ContactExport Model - Cascade Delete**
   - Should delete all exports when user is deleted

4. **ContactExport Model - Query by User**
   - Should fetch only user's exports
   - Should order by createdAt DESC
   - Should use composite index efficiently

## E2E Tests

### Contact List Page - Export All Contacts

**File:** `apps/web/e2e/contacts/export-all-contacts.spec.ts`

**Scenario:** User exports all contacts to CSV from Contacts page

**Steps:**
1. Navigate to /contacts page
2. Wait for contacts to load
3. Click "Export Contacts" button in toolbar
4. Verify export dialog appears
5. Select "CSV" format
6. Select "All Contacts" scope
7. View contact count preview (e.g., "247 contacts")
8. Enter custom filename "my-backup"
9. Click "Confirm" button
10. Wait for download to initiate
11. Verify file downloaded: `my-backup-2025-10-29-*.csv`
12. Verify file size > 0 bytes
13. Parse CSV file and verify:
    - Header row present with all column names
    - Row count matches contact count (247 + 1 header)
    - All contact data intact

**Expected Result:** CSV file downloaded successfully with all contacts

---

### Contact List Page - Export Filtered Contacts

**File:** `apps/web/e2e/contacts/export-filtered-contacts.spec.ts`

**Scenario:** User exports filtered contacts to Excel

**Steps:**
1. Navigate to /contacts page
2. Apply filter: Priority = "High"
3. Apply filter: Industry = "Technology"
4. Verify filtered results displayed (e.g., 42 contacts)
5. Click "Export Contacts" button
6. Verify export dialog shows "Export Filtered Contacts (42)"
7. Select "Excel" format
8. Keep "Filtered Contacts" scope selected (default)
9. Enter filename "high-priority-tech"
10. Click "Confirm"
11. Wait for download
12. Verify file: `high-priority-tech-2025-10-29-*.xlsx`
13. Open Excel file and verify:
    - 42 data rows + 1 header
    - All contacts have Priority = "High"
    - All contacts have Industry = "Technology"

**Expected Result:** Excel file contains only filtered contacts

---

### Contact List Page - Export Selected Contacts

**File:** `apps/web/e2e/contacts/export-selected-contacts.spec.ts`

**Scenario:** User selects specific contacts and exports to CSV

**Steps:**
1. Navigate to /contacts page
2. Enable checkbox selection mode
3. Select 5 contacts using checkboxes
4. Click "Export Selected (5)" button
5. Verify export dialog shows "Export Selected Contacts (5)"
6. Select "CSV" format
7. Scope pre-selected to "Selected Contacts"
8. Use default filename
9. Click "Confirm"
10. Wait for download
11. Verify file: `cordiq-contacts-2025-10-29-*.csv`
12. Parse CSV and verify exactly 5 data rows

**Expected Result:** CSV file contains only 5 selected contacts

---

### Settings Page - Export from Settings

**File:** `apps/web/e2e/settings/export-from-settings.spec.ts`

**Scenario:** User exports contacts from Settings page

**Steps:**
1. Navigate to /settings page
2. Locate "Export Contacts" section
3. Click "Export Contacts" button
4. Verify export dialog appears (same as Contacts page)
5. Select format, scope, filename
6. Click "Confirm"
7. Verify download initiates

**Expected Result:** Export works identically from Settings page

---

### Settings Page - View Export History

**File:** `apps/web/e2e/settings/export-history.spec.ts`

**Scenario:** User views their export history

**Steps:**
1. Perform 3 exports (CSV All, Excel Filtered, CSV Selected)
2. Navigate to /settings page
3. Locate "Export History" section
4. Verify table displays 3 exports
5. Verify columns: Date/Time, Format, Scope, Contact Count, Filename
6. Verify most recent export listed first
7. Verify formats displayed as "CSV" or "Excel"
8. Verify scopes displayed as "All", "Filtered", or "Selected"
9. Verify contact counts match actual exports

**Expected Result:** Export history table displays all past exports correctly

---

### Error Handling - Unauthorized Export

**File:** `apps/web/e2e/contacts/export-unauthorized.spec.ts`

**Scenario:** Unauthenticated user attempts export

**Steps:**
1. Clear browser cookies (logout)
2. Navigate to /contacts page
3. User is redirected to /login (Next.js middleware)

**Alternative:** If user somehow accesses export button:
4. Click "Export Contacts"
5. API returns 401 Unauthorized
6. Error toast displayed: "Please log in to export contacts"

**Expected Result:** Export blocked for unauthenticated users

---

### Error Handling - Invalid Contact IDs

**File:** `apps/web/e2e/contacts/export-invalid-ids.spec.ts`

**Scenario:** User tries to export contacts that don't belong to them (edge case)

**Note:** This is difficult to trigger via UI (would require API manipulation)

**Steps:**
1. Intercept GraphQL request
2. Modify contactIds to include ID from another user
3. Send request
4. API returns 403 Forbidden
5. Error message displayed in UI

**Expected Result:** Export rejected with error message

---

### Performance - Large Export (1000 Contacts)

**File:** `apps/web/e2e/contacts/export-performance.spec.ts`

**Scenario:** User exports 1000 contacts (performance test)

**Setup:**
- Seed database with 1000 contacts for test user

**Steps:**
1. Navigate to /contacts page
2. Click "Export Contacts"
3. Select CSV, All Contacts
4. Click "Confirm"
5. Start timer
6. Wait for download to complete
7. Stop timer
8. Verify download time < 5 seconds
9. Verify file size reasonable (~500KB)
10. Verify file contains 1000 contacts

**Expected Result:** Export completes in < 5 seconds

## Mocking Requirements

### External Services

**PrismaService (Unit Tests):**
- Mock `contactExport.create()` for history recording
- Mock `contactExport.findMany()` for history queries
- Mock `contact.findMany()` for contact fetching
- Mock `contact.count()` for contact counting

**File System (Unit Tests):**
- Mock `csv-writer` library for CSV generation
- Mock `exceljs` library for Excel generation
- Use in-memory buffers instead of file system writes

### Authentication (Integration Tests)

**JWT Token:**
- Mock authentication guard to bypass JWT validation
- Provide test user context with userId
- Use `@nestjs/testing` utilities for guard mocking

### Time-Based Tests

**Date/Time:**
- Mock `new Date()` for consistent timestamp testing
- Use fixed date (e.g., 2025-10-29T14:30:22Z) in tests
- Verify filename timestamps match mocked date

### File Downloads (E2E Tests)

**Playwright:**
- Use `page.waitForEvent('download')` to capture downloads
- Verify download path and filename
- Read downloaded file content for validation
- Use `page.setDownloadBehavior` if needed

## Test Data

### Test Contacts

**Minimal Contact:**
```typescript
{
  id: 'contact_123',
  userId: 'user_abc',
  name: 'John Doe',
  email: 'john@example.com',
  phone: null,
  linkedinUrl: null,
  company: null,
  industry: null,
  role: null,
  priority: 'MEDIUM',
  birthday: null,
  gender: null,
  notes: null,
  tags: [],
  createdAt: new Date('2025-01-15'),
  lastContactDate: null,
}
```

**Full Contact:**
```typescript
{
  id: 'contact_456',
  userId: 'user_abc',
  name: 'Jane Smith',
  email: 'jane@techcorp.com',
  phone: '+1-555-123-4567',
  linkedinUrl: 'https://linkedin.com/in/janesmith',
  company: 'TechCorp',
  industry: 'Technology',
  role: 'VP of Engineering',
  priority: 'HIGH',
  birthday: new Date('1985-06-15'),
  gender: 'FEMALE',
  notes: 'Met at TechCrunch Disrupt 2025. Interested in AI partnerships.',
  tags: ['ai', 'partnership', 'conference'],
  createdAt: new Date('2025-10-01'),
  lastContactDate: new Date('2025-10-25'),
}
```

**Special Characters Contact:**
```typescript
{
  id: 'contact_789',
  userId: 'user_abc',
  name: 'Robert "Bob" O\'Connor, Jr.',
  email: 'bob@example.com',
  notes: 'Mentioned: "AI is the future,"\nVery enthusiastic.\nFollow up in Q1.',
  company: 'Smith & Johnson, LLC',
  // ... other fields
}
```

## Test Execution

### Run All Tests

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# All tests with coverage
pnpm test:cov
```

### Coverage Report

```bash
# Generate coverage report
pnpm test:cov

# View coverage in browser
open coverage/lcov-report/index.html
```

### Target Coverage

- **Statements:** 85%+
- **Branches:** 80%+
- **Functions:** 85%+
- **Lines:** 85%+

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Contact Export Tests

on:
  pull_request:
    paths:
      - 'apps/api/src/contacts/contact-export.*'
      - 'apps/web/components/contacts/ExportDialog.*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:e2e
      - run: pnpm test:cov
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```bash
# Run tests before commit
husky install
npx husky add .husky/pre-commit "pnpm test:unit"
```

## Test Maintenance

### Updating Tests

- Update tests when adding new export formats
- Update tests when changing field mappings
- Update tests when modifying file generation logic
- Keep test data in sync with Prisma schema

### Flaky Test Prevention

- Use fixed dates/times in tests (mock Date)
- Use deterministic test data (no randomness)
- Wait for async operations properly (Playwright)
- Clean up database between test runs
