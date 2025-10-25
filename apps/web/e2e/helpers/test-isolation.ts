import { PrismaClient, Priority, Gender } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Re-export types for use in test files
export { Priority, Gender };

/**
 * Test Isolation Helper for E2E Tests
 *
 * This module provides utilities for creating isolated test data per test,
 * eliminating race conditions in parallel test execution.
 *
 * Usage:
 * ```typescript
 * let contactId: string;
 *
 * test.beforeEach(async () => {
 *   const contact = await createUniqueContact({
 *     name: "Test User",
 *     email: "test@example.com",
 *   });
 *   contactId = contact.id;
 * });
 *
 * test.afterEach(async () => {
 *   await cleanupContact(contactId);
 * });
 * ```
 */

export interface UniqueContactData {
  name: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  company?: string;
  industry?: string;
  role?: string;
  priority?: Priority;
  gender?: Gender;
  birthday?: Date;
  profilePicture?: string;
  notes?: string;
  lastContactedAt?: Date;
}

/**
 * Create a unique contact for test isolation
 *
 * Generates a unique ID using UUID to prevent collisions in parallel execution
 *
 * @param data - Contact data (name and email required, rest optional)
 * @returns Created contact with unique ID
 */
export async function createUniqueContact(
  data: UniqueContactData
): Promise<{ id: string; name: string; email: string }> {
  const testEmail = process.env.TEST_USER_EMAIL || "test@relationhub.com";

  // Find test user
  const user = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (!user) {
    throw new Error(
      `Test user not found with email ${testEmail}. Ensure auth.setup.ts has run.`
    );
  }

  // Generate unique ID using UUID
  const uniqueId = `test-contact-${randomUUID()}`;

  // Create contact with unique ID
  const contact = await prisma.contact.create({
    data: {
      id: uniqueId,
      userId: user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedInUrl: data.linkedInUrl,
      company: data.company,
      industry: data.industry,
      role: data.role,
      priority: data.priority || Priority.MEDIUM,
      gender: data.gender,
      birthday: data.birthday,
      profilePicture: data.profilePicture,
      notes: data.notes,
      lastContactedAt: data.lastContactedAt,
    },
  });

  console.log(`✅ Created unique contact: ${contact.name} (ID: ${contact.id})`);

  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
  };
}

/**
 * Clean up a specific contact after test
 *
 * @param contactId - ID of contact to delete
 */
export async function cleanupContact(contactId: string): Promise<void> {
  try {
    await prisma.contact.delete({
      where: { id: contactId },
    });
    console.log(`🗑️  Cleaned up contact: ${contactId}`);
  } catch (error) {
    // Contact may have been deleted by test (e.g., delete tests)
    // This is not an error - just log and continue
    console.log(`ℹ️  Contact ${contactId} already deleted or not found`);
  }
}

/**
 * Create multiple unique contacts for tests that need bulk data
 *
 * @param contacts - Array of contact data
 * @returns Array of created contact IDs
 */
export async function createMultipleContacts(
  contacts: UniqueContactData[]
): Promise<string[]> {
  const createdIds: string[] = [];

  for (const contactData of contacts) {
    const contact = await createUniqueContact(contactData);
    createdIds.push(contact.id);
  }

  return createdIds;
}

/**
 * Clean up multiple contacts
 *
 * @param contactIds - Array of contact IDs to delete
 */
export async function cleanupMultipleContacts(
  contactIds: string[]
): Promise<void> {
  for (const contactId of contactIds) {
    await cleanupContact(contactId);
  }
}

/**
 * Create test fixture with beforeEach and afterEach hooks
 *
 * Returns setup and teardown functions for isolated test data
 *
 * @param contactData - Contact data to create
 * @returns Object with contactId variable and setup/teardown functions
 *
 * @example
 * ```typescript
 * const fixture = createTestFixture({
 *   name: "Jane Smith",
 *   email: "jane@example.com",
 * });
 *
 * test.beforeEach(async () => {
 *   await fixture.setup();
 * });
 *
 * test.afterEach(async () => {
 *   await fixture.teardown();
 * });
 *
 * test("should display contact", async ({ page }) => {
 *   await page.goto(`/contacts/${fixture.contactId}`);
 *   // test logic...
 * });
 * ```
 */
export function createTestFixture(contactData: UniqueContactData) {
  let contactId: string;

  return {
    get contactId() {
      return contactId;
    },
    async setup() {
      const contact = await createUniqueContact(contactData);
      contactId = contact.id;
      return contactId;
    },
    async teardown() {
      if (contactId) {
        await cleanupContact(contactId);
      }
    },
  };
}

/**
 * Create fixture for multiple contacts
 *
 * @param contactsData - Array of contact data
 * @returns Fixture with setup/teardown for multiple contacts
 */
export function createMultipleContactsFixture(
  contactsData: UniqueContactData[]
) {
  let contactIds: string[] = [];

  return {
    get contactIds() {
      return contactIds;
    },
    async setup() {
      contactIds = await createMultipleContacts(contactsData);
      return contactIds;
    },
    async teardown() {
      if (contactIds.length > 0) {
        await cleanupMultipleContacts(contactIds);
      }
    },
  };
}

// Export prisma client for direct database operations in tests if needed
export { prisma };
