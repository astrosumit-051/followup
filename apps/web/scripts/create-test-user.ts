/**
 * Script to create a test user in Supabase for E2E testing
 *
 * This script:
 * 1. Creates a test user account in Supabase
 * 2. Verifies the user was created successfully
 * 3. Outputs the credentials to use in E2E tests
 *
 * Usage:
 * TEST_USER_EMAIL=test@cordiq.com TEST_USER_PASSWORD=TestPassword123! npx tsx scripts/create-test-user.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testEmail = process.env.TEST_USER_EMAIL || "test@cordiq.com";
const testPassword = process.env.TEST_USER_PASSWORD || "TestPassword123!";

if (!supabaseUrl) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  console.error("This key is required to create users programmatically");
  process.exit(1);
}

async function createTestUser() {
  // Create Supabase admin client (can bypass RLS and create users)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("🔧 Creating test user for E2E testing...");
  console.log(`📧 Email: ${testEmail}`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u) => u.email === testEmail);

  if (existingUser) {
    console.log("✅ Test user already exists");
    console.log(`User ID: ${existingUser.id}`);
    console.log(`Email: ${existingUser.email}`);
    console.log(`Created at: ${existingUser.created_at}`);
    console.log("\n📝 Use these credentials in E2E tests:");
    console.log(`   TEST_USER_EMAIL=${testEmail}`);
    console.log(`   TEST_USER_PASSWORD=${testPassword}`);
    return;
  }

  // Create the test user
  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true, // Auto-confirm email for test user
  });

  if (error) {
    console.error("❌ Error creating test user:", error.message);
    process.exit(1);
  }

  if (!data.user) {
    console.error("❌ User creation failed - no user data returned");
    process.exit(1);
  }

  console.log("✅ Test user created successfully!");
  console.log(`User ID: ${data.user.id}`);
  console.log(`Email: ${data.user.email}`);
  console.log(
    `Email confirmed: ${data.user.email_confirmed_at ? "Yes" : "No"}`,
  );
  console.log("\n📝 Use these credentials in E2E tests:");
  console.log(`   TEST_USER_EMAIL=${testEmail}`);
  console.log(`   TEST_USER_PASSWORD=${testPassword}`);
  console.log("\n💡 Add these to your .env.test.local file:");
  console.log(`TEST_USER_EMAIL=${testEmail}`);
  console.log(`TEST_USER_PASSWORD=${testPassword}`);
}

createTestUser().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
