# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-29-contact-export/spec.md

> Created: 2025-10-29
> Version: 1.0.0

## Technical Requirements

### File Format Generation

**CSV Generation:**
- Standard RFC 4180 compliant CSV format
- UTF-8 encoding with BOM for Excel compatibility
- Proper escaping of commas, quotes, and newlines in field values
- Header row with human-readable column names
- Date fields formatted as ISO 8601 (YYYY-MM-DD)
- Empty fields represented as empty strings (not null)

**Excel Generation:**
- XLSX format (Excel 2007+)
- Single worksheet named "Contacts"
- Frozen header row for easy scrolling
- Auto-sized columns for better readability
- Date cells formatted as proper Excel date type
- Text wrap enabled for notes column

### Data Transformation

**Field Mapping:**
- Contact database schema → Export columns
- Priority enum (HIGH/MEDIUM/LOW) → Human-readable strings
- Gender enum → Full text (Male/Female/Other/Prefer not to say)
- Timestamps → Formatted date strings
- Array fields (tags) → Comma-separated strings
- Notes with newlines → Properly escaped or preserved

**Field Order:**
1. Name, Email, Phone, LinkedIn URL
2. Company, Industry, Role
3. Priority, Gender, Birthday
4. Tags, Notes
5. Created Date, Last Contact Date

### Export Scope Implementation

**All Contacts Export:**
- Fetch all contacts for current user with pagination
- Process in batches of 500 to prevent memory overflow
- Stream results to file generation

**Filtered Contacts Export:**
- Apply current filters from frontend state
- Pass filter criteria to backend query
- Execute same Prisma query as contact list view

**Selected Contacts Export:**
- Accept array of contact IDs from frontend
- Validate IDs belong to current user
- Fetch contacts by ID list

### File Naming & Download

**Filename Pattern:**
- User custom name (sanitized, alphanumeric + hyphens/underscores)
- Timestamp suffix: `-YYYY-MM-DD-HHmmss`
- Format extension: `.csv` or `.xlsx`
- Example: `my-contacts-2025-10-29-143022.csv`

**Filename Sanitization:**
- Remove special characters except hyphens and underscores
- Replace spaces with hyphens
- Lowercase transformation
- Max 100 characters before timestamp

**Browser Download:**
- Backend generates file in memory or temp storage
- Returns file as streaming response with appropriate headers:
  - `Content-Type: text/csv; charset=utf-8` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition: attachment; filename="[sanitized-name].csv"`
  - `Content-Length: [file-size]`

### Export History Tracking

**Database Schema:**
- Table: `contact_exports`
- Fields:
  - `id` (UUID, primary key)
  - `userId` (UUID, foreign key to users)
  - `format` (enum: CSV, EXCEL)
  - `scope` (enum: ALL, FILTERED, SELECTED)
  - `contactCount` (integer)
  - `filename` (string)
  - `fileSize` (integer, bytes)
  - `createdAt` (timestamp)

**Export Record:**
- Create record before file generation
- Update with fileSize after generation
- Store for audit trail and history display
- No file storage (download-only approach)

### Performance Requirements

**Response Time:**
- < 2 seconds for 100 contacts
- < 5 seconds for 1000 contacts
- < 15 seconds for 5000 contacts

**Memory Management:**
- Streaming file generation for large exports
- Batch processing for database queries
- No full dataset load into memory

**Concurrent Exports:**
- Support multiple users exporting simultaneously
- No rate limiting (per requirements)
- Background job queue if >10,000 contacts (future optimization)

## Approach Options

### Option A: Synchronous Export with In-Memory Generation

**Description:**
Generate CSV/Excel file synchronously in the API request handler, hold file in memory, and stream directly to client.

**Pros:**
- Simpler implementation (no job queue needed)
- Immediate download experience
- No temporary file storage required
- Easier to debug and test

**Cons:**
- Limited scalability for very large exports (10,000+ contacts)
- Blocks API server during generation
- Risk of timeout for slow clients
- Memory usage spikes during concurrent exports

**Best For:** Phase 3 MVP with <5000 contacts per user

---

### Option B: Asynchronous Export with Job Queue (Selected)

**Description:**
Queue export job in BullMQ, generate file in background worker, store temporarily in S3, notify user when ready, provide download link.

**Pros:**
- Scales to unlimited contact counts
- Non-blocking API response
- Better server resource utilization
- Can add progress tracking and email notifications

**Cons:**
- More complex implementation (requires BullMQ setup)
- Delayed download experience
- Requires temporary file storage
- More moving parts to maintain

**Best For:** Production with >5000 contacts or future scalability

---

### Option C: Hybrid Approach ✅ **SELECTED**

**Description:**
Use synchronous generation for <1000 contacts, automatically fall back to asynchronous queue for larger exports.

**Pros:**
- Best of both worlds
- Fast experience for 95% of users (most have <1000 contacts)
- Graceful handling of edge cases
- Future-proof architecture

**Cons:**
- Requires implementing both approaches
- Decision logic adds complexity
- Still need BullMQ setup for async path

**Best For:** Production-ready with optimal UX

**Rationale:**
Based on Cordiq's target users (professionals with 200-500 contacts average), synchronous generation will serve 95% of use cases with instant downloads. The async fallback provides safety for power users and future growth. This approach delivers the best user experience while maintaining scalability.

## Implementation Details

### Hybrid Export Strategy

**Contact Count Thresholds:**
- `<= 1000 contacts`: Synchronous generation (2-5 seconds)
- `> 1000 contacts`: Async job queue (download link via email/notification)

**Synchronous Flow:**
1. User clicks "Export" → Modal confirmation
2. Frontend sends export request to GraphQL/REST API
3. Backend queries contacts based on scope
4. If count <= 1000:
   - Generate file in memory using streaming
   - Stream file directly to response
   - Record export history
   - Return file download
5. Response time < 5 seconds

**Asynchronous Flow (Future):**
1. User clicks "Export" → Modal shows "Your export is being prepared"
2. Frontend sends export request to API
3. Backend checks count > 1000:
   - Create export job in BullMQ
   - Return job ID immediately
   - Frontend polls for job status or subscribes to GraphQL subscription
4. Background worker:
   - Generates file
   - Uploads to S3 with 24-hour expiration
   - Updates export history with download URL
   - Sends notification to user
5. User downloads from provided link

### Service Layer Architecture

**ExportService (NestJS):**
- `exportContacts(userId, format, scope, options)`: Main export method
- `generateCSV(contacts)`: CSV generation logic
- `generateExcel(contacts)`: Excel generation logic
- `determineExportStrategy(contactCount)`: Sync vs async decision
- `recordExportHistory(...)`: Create history record

**ContactExportDto:**
```typescript
{
  format: 'CSV' | 'EXCEL';
  scope: 'ALL' | 'FILTERED' | 'SELECTED';
  filename?: string;
  filterCriteria?: ContactFilters; // For FILTERED scope
  contactIds?: string[]; // For SELECTED scope
}
```

## External Dependencies

### CSV Generation Library

**Library:** `csv-writer` (npm package)
- **Version:** `^1.6.0`
- **Purpose:** Robust CSV file generation with RFC 4180 compliance
- **Justification:** Handles complex CSV edge cases (quotes, newlines, commas) automatically, proven reliability, minimal dependencies, good TypeScript support
- **Alternative:** `papaparse` (heavier, designed for parsing more than generation)

### Excel Generation Library

**Library:** `exceljs`
- **Version:** `^4.4.0`
- **Purpose:** Create and manipulate Excel (.xlsx) files
- **Justification:** Most popular Excel library for Node.js (3M+ weekly downloads), supports styling, formulas, and advanced features, good streaming support for large files, actively maintained
- **Alternative:** `xlsx` (less feature-rich, limited styling)

### File Streaming Utility

**Library:** Node.js built-in `stream` module
- **Purpose:** Stream large files without loading entire content into memory
- **Justification:** Standard library, no additional dependencies, optimal performance

### Filename Sanitization

**Library:** `sanitize-filename`
- **Version:** `^1.6.3`
- **Purpose:** Remove dangerous characters from user-provided filenames
- **Justification:** Prevents path traversal attacks, handles edge cases across operating systems

## Security Considerations

**Authorization:**
- Verify user owns all contacts being exported
- Check user ID from JWT token matches contact userId
- Reject export if any contact ID doesn't belong to user

**Input Validation:**
- Validate format enum (CSV/EXCEL)
- Validate scope enum (ALL/FILTERED/SELECTED)
- Validate contactIds array (max 10,000 IDs)
- Sanitize custom filename input

**Rate Limiting:**
- No rate limiting per requirements
- Monitor for abuse and implement if needed in future

**Data Privacy:**
- Never log exported contact data
- Clear any temporary files immediately after download
- Ensure HTTPS for all export requests

## Testing Strategy

**Unit Tests:**
- CSV generation with various data types
- Excel generation with edge cases (special characters, long text)
- Filename sanitization logic
- Export scope determination (all/filtered/selected)

**Integration Tests:**
- GraphQL mutation returns file stream
- REST endpoint returns file stream
- Export history record creation
- Authorization checks

**E2E Tests:**
- Full export flow from button click to file download
- Verify downloaded CSV opens in Excel/Google Sheets
- Verify downloaded XLSX opens in Excel
- Verify export history displays correctly

**Performance Tests:**
- Benchmark export time for 100, 500, 1000 contacts
- Memory usage monitoring during concurrent exports
- File size validation
