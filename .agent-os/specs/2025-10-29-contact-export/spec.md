# Spec Requirements Document

> Spec: Contact Export
> Created: 2025-10-29
> Status: Planning

## Overview

Implement a comprehensive contact export system that allows users to download their contact database in CSV or Excel format with flexible export options (all contacts, filtered contacts, or selected contacts). This feature enables users to back up their data, integrate with external systems, and maintain data portability, while establishing the foundation for future contact import functionality.

## User Stories

### Data Backup and Portability

As a business professional managing 200+ contacts in Cordiq, I want to export my entire contact database to CSV or Excel format, so that I can create backups, migrate data to other systems, or analyze contacts offline using spreadsheet tools.

**Workflow:**
1. User navigates to Contacts page or Settings
2. User clicks "Export Contacts" button
3. User selects export format (CSV or Excel)
4. User chooses export scope (All Contacts, Filtered Contacts, or Selected Contacts)
5. User customizes filename (optional)
6. User confirms export
7. System generates file and initiates download
8. User receives downloadable file with all contact data

**Problem Solved:** Users gain full control over their data, enabling backup strategies, compliance with data portability requirements, and integration with external CRM or analysis tools.

### Selective Contact Sharing

As a sales professional, I want to export only high-priority contacts from a specific company, so that I can share a targeted list with my team or import it into our company CRM without exposing my entire network.

**Workflow:**
1. User applies filters (e.g., Priority: High, Company: "Acme Corp")
2. User clicks "Export Contacts" button in toolbar
3. User selects "Export Filtered Contacts (15 contacts)"
4. User chooses Excel format for better compatibility
5. User customizes filename to "acme-high-priority-contacts"
6. System exports only filtered contacts
7. User shares file with team

**Problem Solved:** Enables targeted data sharing and selective exports without exposing entire contact database, maintaining privacy and relevance.

### Bulk Contact Analysis

As an entrepreneur tracking networking ROI, I want to export selected contacts from recent conferences, so that I can analyze follow-up rates and relationship conversion metrics in spreadsheet software.

**Workflow:**
1. User selects contacts using checkboxes (e.g., all from "TechCrunch Disrupt 2025")
2. User clicks "Export Selected (25 contacts)" button
3. User chooses CSV format for data analysis
4. User keeps default filename with timestamp
5. System exports only selected contacts
6. User imports into analysis tool to calculate metrics

**Problem Solved:** Provides flexibility for custom analysis workflows and integration with external analytics tools.

## Spec Scope

1. **Dual Format Export** - Support both CSV and Excel (.xlsx) file formats with format selector in export dialog.

2. **Three Export Modes** - Implement export options for all contacts, currently filtered contacts, and checkbox-selected contacts with clear UI indicators showing count.

3. **Customizable Filename** - Allow users to specify custom filename with automatic timestamp suffix and format extension (e.g., "my-contacts-2025-10-29.csv").

4. **Export History Tracking** - Store export records in database with timestamp, format, contact count, and filename for audit trail and user reference.

5. **Dual UI Entry Points** - Place "Export Contacts" button in both Contacts page toolbar and Settings page with consistent behavior.

6. **Confirmation Dialog** - Display export preview modal showing format, scope, contact count, and filename before initiating download.

7. **All Field Export** - Export all contact fields (name, email, phone, LinkedIn, company, industry, role, priority, birthday, gender, notes, tags, created date, last contact date) in every export without field selection UI.

8. **GraphQL and REST API** - Implement export endpoints accessible via both GraphQL mutation and REST API for programmatic access and future integrations.

## Out of Scope

- **Field Selection UI** - Users cannot choose which fields to export; all fields are always included (deferred to future iteration).
- **Export Scheduling** - No automatic/scheduled exports; all exports are manual user-initiated actions.
- **Export Limits** - No per-export or daily export limits; users can export unlimited contacts.
- **Import Functionality** - Contact import is a separate Phase 3 feature and not included in this spec.
- **Export to Other Formats** - No support for JSON, XML, VCF, or other formats beyond CSV and Excel.
- **Bulk Edit via Re-Import** - No workflow for editing exported file and re-importing changes.
- **Email Delivery** - No option to email export file; download only.
- **Cloud Storage Integration** - No direct upload to Google Drive, Dropbox, etc.; local download only.

## Expected Deliverable

1. **Functional Export System** - Users can successfully export contacts in CSV or Excel format from both Contacts page and Settings page, with downloads completing in under 5 seconds for 1000 contacts.

2. **Export Dialog UI** - A modal dialog appears on button click displaying format selector (CSV/Excel), scope selector (All/Filtered/Selected), contact count preview, filename input, and Confirm/Cancel buttons, fully responsive on mobile and desktop.

3. **Export History View** - Settings page displays a "Export History" section listing past 20 exports with columns: Date/Time, Format, Contact Count, Filename, and a "Download Again" action (if file still cached for 24 hours).

4. **Browser Download Trigger** - On confirmation, browser initiates file download with user's custom filename or auto-generated name (e.g., "cordiq-contacts-2025-10-29.csv"), and file opens successfully in Excel/Google Sheets with all data intact.

5. **Comprehensive Test Coverage** - All export functionality covered by unit tests (service layer), integration tests (GraphQL/REST endpoints), and E2E tests (Playwright testing full user flow from button click to file download verification), achieving 85%+ code coverage.

## Spec Documentation

- **Tasks:** @.agent-os/specs/2025-10-29-contact-export/tasks.md
- **Technical Specification:** @.agent-os/specs/2025-10-29-contact-export/sub-specs/technical-spec.md
- **API Specification:** @.agent-os/specs/2025-10-29-contact-export/sub-specs/api-spec.md
- **Database Schema:** @.agent-os/specs/2025-10-29-contact-export/sub-specs/database-schema.md
- **Tests Specification:** @.agent-os/specs/2025-10-29-contact-export/sub-specs/tests.md
