/**
 * Jest Setup File
 *
 * Loads environment variables from .env file before running tests
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from the apps/api directory
config({ path: resolve(__dirname, '../.env') });

// Override DATABASE_URL to use local PostgreSQL for tests
// This prevents tests from trying to connect to remote Supabase database
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/relationhub_dev';

// Workaround: Set OPENAI_API_KEY to OPENROUTER_API_KEY for test environment
// The underlying OpenAI SDK checks OPENAI_API_KEY even when using OpenRouter
if (process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.OPENROUTER_API_KEY;
  console.log('✅ Set OPENAI_API_KEY from OPENROUTER_API_KEY for test compatibility');
}

// Log that environment is loaded (helpful for debugging)
console.log('Environment variables loaded for tests');
console.log(`DATABASE_URL: Using local PostgreSQL (localhost:5432/relationhub_dev)`);
console.log(`OPENROUTER_API_KEY present: ${!!process.env.OPENROUTER_API_KEY}`);
console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
console.log(`OPENAI_API_KEY present: ${!!process.env.OPENAI_API_KEY}`);
console.log(`ANTHROPIC_API_KEY present: ${!!process.env.ANTHROPIC_API_KEY}`);
