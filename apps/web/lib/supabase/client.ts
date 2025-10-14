import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Create a Supabase client for use in the browser
 * This creates a singleton instance to avoid creating multiple clients
 * @returns Supabase browser client
 * @throws Error if environment variables are missing
 */
export function createBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  // Return existing client if already created (singleton pattern)
  if (client) {
    return client;
  }

  // Create new client and cache it
  client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);

  return client;
}
