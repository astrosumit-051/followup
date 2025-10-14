import { test as setup } from "@playwright/test";

/**
 * Backend Readiness Setup
 *
 * This setup project ensures the backend API is fully started and ready
 * before running E2E tests. Playwright's webServer only waits for the
 * frontend (port 3000) to be ready, but the backend (port 3001) takes
 * longer to start since it needs to:
 * - Compile TypeScript with NestJS
 * - Initialize database connections
 * - Start GraphQL server
 *
 * Without this check, tests would fail with:
 * net::ERR_CONNECTION_REFUSED when trying to call GraphQL at localhost:3001
 */

setup("wait for backend API", async ({}) => {
  const maxAttempts = 60; // 60 seconds max wait
  const delayMs = 1000; // Check every 1 second

  console.log("⏳ Waiting for backend API at http://localhost:3001/health...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch("http://localhost:3001/health");

      if (response.ok) {
        const data = await response.json();
        console.log(
          `✅ Backend API is ready! (attempt ${attempt}/${maxAttempts})`,
        );
        console.log(`   Status: ${data.status}`);
        console.log(`   Timestamp: ${data.timestamp}`);
        return; // Backend is ready, exit setup
      }
    } catch (error) {
      // Backend not ready yet, continue waiting
      if (attempt === maxAttempts) {
        throw new Error(
          `Backend API failed to start after ${maxAttempts} seconds`,
        );
      }
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Log progress every 5 seconds
    if (attempt % 5 === 0) {
      console.log(`   Still waiting... (${attempt}s elapsed)`);
    }
  }
});
