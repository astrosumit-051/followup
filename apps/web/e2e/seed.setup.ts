/**
 * Playwright Setup: Seed Test Database
 *
 * This setup file seeds the database with test contacts before running E2E tests.
 * It runs once per test session as part of the 'seed' project dependency.
 */
import { test as setup } from "@playwright/test";
import { seedContacts } from "./helpers/seed-contacts";

// Test user Supabase ID (from auth.setup.ts)
const TEST_USER_SUPABASE_ID = "abeebed7-1ce1-4add-89a7-87b3cc249d38";

setup("seed test database with contacts", async () => {
  console.log("\n🌱 Starting database seeding for E2E tests...\n");

  try {
    const contactIds = await seedContacts(TEST_USER_SUPABASE_ID);

    console.log("\n📊 Seeded contact IDs:");
    contactIds.forEach((id, index) => {
      console.log(`   ${index + 1}. ${id}`);
    });

    console.log("\n✅ Database seeding completed successfully\n");
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    throw error;
  }
});
