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

// Log that environment is loaded (helpful for debugging)
console.log('Environment variables loaded for tests');
console.log(`DATABASE_URL: Using local PostgreSQL (localhost:5432/relationhub_dev)`);
console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
console.log(`OPENAI_API_KEY present: ${!!process.env.OPENAI_API_KEY}`);
console.log(`ANTHROPIC_API_KEY present: ${!!process.env.ANTHROPIC_API_KEY}`);
