import { createBrowserClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * GraphQL Client Configuration
 *
 * This module provides a configured GraphQL client for making authenticated
 * requests to the NestJS GraphQL API.
 *
 * Authentication:
 * - Uses Supabase session JWT token in Authorization header
 * - Token automatically included from Supabase auth session
 *
 * Base URL:
 * - Development: http://localhost:4000/graphql
 * - Production: Configured via NEXT_PUBLIC_API_URL environment variable
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

/**
 * GraphQL request function with automatic authentication
 *
 * @param query - GraphQL query or mutation string
 * @param variables - Variables for the GraphQL operation
 * @param supabaseClient - Optional Supabase client for dependency injection (testing)
 * @returns Promise resolving to the GraphQL response data
 * @throws Error if request fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const data = await graphqlRequest(GET_CONTACT_QUERY, { id: '123' });
 * ```
 */
export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>,
  supabaseClient?: SupabaseClient
): Promise<T> {
  const supabase = supabaseClient || createBrowserClient();

  // Get current session to extract JWT token
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('User not authenticated');
  }

  // Make GraphQL request with JWT token in Authorization header
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const json = await response.json();

  // Check for GraphQL errors
  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL request failed');
  }

  return json.data;
}

/**
 * GraphQL mutation function (alias for graphqlRequest for clarity)
 *
 * @param mutation - GraphQL mutation string
 * @param variables - Variables for the mutation
 * @param supabaseClient - Optional Supabase client for dependency injection (testing)
 * @returns Promise resolving to the mutation response data
 */
export async function graphqlMutation<T = any>(
  mutation: string,
  variables?: Record<string, any>,
  supabaseClient?: SupabaseClient
): Promise<T> {
  return graphqlRequest<T>(mutation, variables, supabaseClient);
}
