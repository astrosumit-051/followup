# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-04-project-setup-database-schema/spec.md

> Created: 2025-10-04
> Version: 1.0.0

## Prisma Schema Definition

The complete Prisma schema will be located at `packages/database/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
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

enum EmailProvider {
  GMAIL
  OUTLOOK
  SMTP
}

enum ActivityType {
  EMAIL_SENT
  EMAIL_RECEIVED
  CALL
  MEETING
  NOTE
}

model User {
  id             String    @id @default(uuid())
  email          String    @unique
  name           String?
  profilePicture String?
  settings       Json?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  contacts  Contact[]
  emails    Email[]
  activities Activity[]
  reminders Reminder[]
  tags      Tag[]

  @@map("users")
}

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
  notes           String?   @db.Text
  metadata        Json?
  lastContactedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  emails     Email[]
  activities Activity[]
  reminders  Reminder[]
  tags       ContactTag[]

  @@index([userId, priority])
  @@index([userId, lastContactedAt])
  @@map("contacts")
}

model Tag {
  id        String   @id @default(uuid())
  userId    String
  name      String
  color     String   // Hex color code
  createdAt DateTime @default(now())

  user     User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  contacts ContactTag[]

  @@unique([userId, name])
  @@index([userId])
  @@map("tags")
}

model ContactTag {
  contactId String
  tagId     String
  createdAt DateTime @default(now())

  contact Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)
  tag     Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([contactId, tagId])
  @@map("contact_tags")
}

model Email {
  id         String        @id @default(uuid())
  userId     String
  contactId  String
  subject    String
  body       String        @db.Text
  sentAt     DateTime      @default(now())
  openedAt   DateTime?
  clickedAt  DateTime?
  provider   EmailProvider
  metadata   Json?

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  contact Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@index([userId, sentAt])
  @@map("emails")
}

model Activity {
  id          String       @id @default(uuid())
  userId      String
  contactId   String
  type        ActivityType
  description String       @db.Text
  occurredAt  DateTime     @default(now())
  metadata    Json?

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  contact Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@index([userId, occurredAt])
  @@map("activities")
}

model Reminder {
  id          String    @id @default(uuid())
  userId      String
  contactId   String
  title       String
  dueDate     DateTime
  completed   Boolean   @default(false)
  completedAt DateTime?
  createdAt   DateTime  @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  contact Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@index([userId, dueDate, completed])
  @@map("reminders")
}
```

## Migration Strategy

### Initial Migration

The first migration will create all tables, indexes, and constraints defined above.

**Migration Command:**
```bash
pnpm --filter database prisma migrate dev --name init
```

This will:
1. Create all tables with proper columns and types
2. Set up foreign key relationships
3. Create indexes for query performance
4. Apply enum types to PostgreSQL

### Future Migration Guidelines

- Always use descriptive migration names: `prisma migrate dev --name add_contact_tags`
- Never edit existing migrations; create new ones for changes
- Test migrations on staging before production
- Keep migrations small and atomic
- Document breaking changes in migration comments

## Seed Data

A seed script will be created at `packages/database/prisma/seed.ts` to populate development data.

**Seed Data Includes:**
- 2 test users with different email addresses
- 10 contacts per user with varied priorities and fields
- 5 tags per user
- 20 activities distributed across contacts
- 5 reminders (some completed, some pending)
- 10 sample emails with open/click timestamps

**Seed Command:**
```bash
pnpm --filter database prisma db seed
```

## Database Connection

**Development Connection String:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/relationhub_dev?schema=public"
```

**Docker PostgreSQL Configuration:**
- Host: localhost (mapped from container)
- Port: 5432
- Database: relationhub_dev
- Username: postgres
- Password: postgres (development only)

## Performance Considerations

### Indexes

All indexes are defined in the Prisma schema for optimal query performance:

1. **Contact queries by priority:** `@@index([userId, priority])`
2. **Follow-up queries:** `@@index([userId, lastContactedAt])`
3. **Email history:** `@@index([userId, sentAt])`
4. **Activity timeline:** `@@index([userId, occurredAt])`
5. **User tags:** `@@index([userId])`
6. **Reminder queries:** `@@index([userId, dueDate, completed])`

### Data Integrity

- **Foreign key constraints** ensure referential integrity
- **Cascade deletions** automatically clean up related records
- **Unique constraints** prevent duplicate tags per user
- **Default values** ensure data consistency

## Rationale

**UUID Primary Keys:** UUIDs provide globally unique identifiers without coordination, ideal for distributed systems and preventing ID enumeration attacks.

**JSONB Fields (metadata, settings):** Flexibility for storing unstructured data without schema changes. PostgreSQL's JSONB supports efficient querying and indexing.

**Cascade Deletes:** Simplifies cleanup logic—when a user is deleted, all their data is automatically removed, maintaining consistency.

**Separate Activity Model:** Provides a unified timeline of all contact interactions, enabling rich history views and analytics.

**ContactTag Join Table:** Enables many-to-many relationships between contacts and tags with timestamps for when tags were added.
