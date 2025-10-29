# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-29-contact-export/spec.md

> Created: 2025-10-29
> Version: 1.0.0

## Overview

The Contact Export feature requires a new database table to track export history for audit purposes and to display past exports to users in the Settings page.

## Schema Changes

### New Table: `contact_exports`

**Purpose:** Store metadata about each contact export operation performed by users.

**Prisma Schema Definition:**

```prisma
model ContactExport {
  id           String       @id @default(cuid())
  userId       String       @map("user_id")
  format       ExportFormat
  scope        ExportScope
  contactCount Int          @map("contact_count")
  filename     String
  fileSize     Int          @map("file_size") // Size in bytes
  createdAt    DateTime     @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt(sort: Desc)])
  @@map("contact_exports")
}

enum ExportFormat {
  CSV
  EXCEL
}

enum ExportScope {
  ALL
  FILTERED
  SELECTED
}
```

**Field Descriptions:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (CUID) | Primary Key | Unique identifier for the export record |
| `userId` | String (UUID) | Foreign Key, NOT NULL | ID of the user who performed the export |
| `format` | Enum | NOT NULL | Export file format (CSV or EXCEL) |
| `scope` | Enum | NOT NULL | Export scope (ALL, FILTERED, or SELECTED) |
| `contactCount` | Integer | NOT NULL, > 0 | Number of contacts included in the export |
| `filename` | String | NOT NULL | Generated filename including timestamp |
| `fileSize` | Integer | NOT NULL, > 0 | File size in bytes for reference |
| `createdAt` | DateTime | NOT NULL, Default: now() | Timestamp when export was created |

### Enums

**ExportFormat:**
- `CSV`: Comma-separated values file (.csv)
- `EXCEL`: Excel workbook file (.xlsx)

**ExportScope:**
- `ALL`: All user's contacts exported
- `FILTERED`: Contacts matching current filters exported
- `SELECTED`: Specific contacts selected by user exported

### Indexes

**Composite Index:** `(userId, createdAt DESC)`
- **Purpose:** Optimize queries for user's export history ordered by most recent first
- **Usage:** Powers export history queries in Settings page
- **Cardinality:** High (unique combination of userId + timestamp)

### Relationships

**User ← ContactExport (One-to-Many)**
- One user can have many export records
- Cascade delete: When user is deleted, all their export records are deleted
- Foreign key constraint ensures referential integrity

## Migration

### Migration File: `20251029_add_contact_exports_table.sql`

```sql
-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('CSV', 'EXCEL');
CREATE TYPE "ExportScope" AS ENUM ('ALL', 'FILTERED', 'SELECTED');

-- CreateTable
CREATE TABLE "contact_exports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "scope" "ExportScope" NOT NULL,
    "contact_count" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_exports_user_id_created_at_idx" ON "contact_exports"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "contact_exports" ADD CONSTRAINT "contact_exports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Rollback Migration: `down.sql`

```sql
-- DropForeignKey
ALTER TABLE "contact_exports" DROP CONSTRAINT "contact_exports_user_id_fkey";

-- DropTable
DROP TABLE "contact_exports";

-- DropEnum
DROP TYPE "ExportScope";
DROP TYPE "ExportFormat";
```

## Update: User Model

**Add relation to User model:**

```prisma
model User {
  // ... existing fields ...

  // Relations
  contacts       Contact[]
  emailDrafts    EmailDraft[]
  contactExports ContactExport[] // NEW

  // ... rest of model ...
}
```

## Query Examples

### Insert Export Record

```typescript
await prisma.contactExport.create({
  data: {
    userId: 'user_abc123',
    format: 'CSV',
    scope: 'ALL',
    contactCount: 247,
    filename: 'my-contacts-backup-2025-10-29-143022.csv',
    fileSize: 45632,
  },
});
```

### Fetch User's Export History

```typescript
const exports = await prisma.contactExport.findMany({
  where: {
    userId: 'user_abc123',
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 20,
});
```

### Count User's Total Exports

```typescript
const count = await prisma.contactExport.count({
  where: {
    userId: 'user_abc123',
  },
});
```

### Delete Old Export Records (Optional Cleanup Job)

```typescript
// Delete exports older than 90 days
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

await prisma.contactExport.deleteMany({
  where: {
    createdAt: {
      lt: ninetyDaysAgo,
    },
  },
});
```

## Data Integrity Rules

### Constraints

1. **User Ownership:** Every export must belong to an existing user (enforced by foreign key)
2. **Positive Values:** `contactCount` and `fileSize` must be > 0
3. **Valid Enums:** `format` and `scope` must match enum values
4. **Required Fields:** All fields except id are required (NOT NULL)

### Validation Rules

**Application Layer (Before Insert):**
- Validate `userId` exists in users table
- Validate `contactCount` > 0
- Validate `fileSize` > 0
- Validate `format` is 'CSV' or 'EXCEL'
- Validate `scope` is 'ALL', 'FILTERED', or 'SELECTED'
- Validate `filename` is not empty and < 255 characters

## Performance Considerations

### Index Strategy

**Primary Index:** `contact_exports_pkey` on `id`
- Used for direct lookups by export ID
- Automatically created as primary key

**Composite Index:** `contact_exports_user_id_created_at_idx` on `(userId, createdAt DESC)`
- Optimizes export history queries (most common query pattern)
- Supports filtering by user and ordering by date
- DESC order avoids additional sort step

**Index Size Estimation:**
- Assume average 100 exports per user
- 10,000 users = 1,000,000 exports
- Index size: ~50MB (CUID + UUID + Timestamp)

### Table Growth

**Growth Rate Estimate:**
- Average user: 2-3 exports per month
- 10,000 active users: 20,000-30,000 new rows per month
- Annual growth: 240,000-360,000 rows

**Storage Requirements:**
- Row size: ~120 bytes (fixed fields + overhead)
- 1M rows ≈ 120 MB
- Index size ≈ 50 MB
- Total: ~170 MB per million exports

**Cleanup Strategy (Future Optimization):**
- Optional: Archive exports older than 90 days
- Optional: Delete exports older than 1 year
- No cleanup required for MVP (negligible storage cost)

## Security Considerations

### Row-Level Security (Conceptual)

While Prisma doesn't support RLS natively, application-level enforcement:

```typescript
// Always filter by userId from JWT token
const exports = await prisma.contactExport.findMany({
  where: {
    userId: req.user.id, // From JWT
  },
});

// Never allow cross-user access
if (export.userId !== req.user.id) {
  throw new ForbiddenException();
}
```

### Audit Trail

This table itself serves as an audit trail:
- Who exported data (userId)
- When they exported (createdAt)
- What they exported (scope, contactCount)
- How they exported (format)

**Retention:** Indefinite (no automatic deletion)

## Testing Considerations

### Unit Tests
- Test Prisma model creates with valid data
- Test validation of enum values
- Test foreign key constraint (cascade delete)

### Integration Tests
- Test inserting export record after successful export
- Test querying export history with pagination
- Test filtering by userId

### Data Migration Tests
- Test migration up (creates table and enums)
- Test migration down (drops table and enums)
- Test existing data integrity after migration
