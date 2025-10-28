import { graphqlRequest } from "./client";

/**
 * GraphQL operations for Conversation History
 *
 * This module provides GraphQL queries for retrieving conversation history
 * to determine if a contact has prior conversations (Follow Up) or is new (Cold Email).
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationEntry {
  id: string;
  contactId: string;
  content: string;
  direction: "SENT" | "RECEIVED";
  timestamp: string;
}

interface ConversationHistoryResponse {
  conversationHistory: ConversationEntry[];
}

// ============================================================================
// GRAPHQL QUERIES
// ============================================================================

const CONVERSATION_HISTORY_QUERY = `
  query ConversationHistory($contactId: ID!, $limit: Float!) {
    conversationHistory(contactId: $contactId, limit: $limit) {
      id
      contactId
      content
      direction
      timestamp
    }
  }
`;

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get conversation count for a contact
 *
 * Returns the number of conversation entries for a contact.
 * Used to determine if contact has conversation history (Follow Up)
 * or no history (Cold Email).
 *
 * @param contactId - Contact ID to get conversation count for
 * @returns Promise resolving to conversation count
 * @throws Error if query fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const count = await getConversationCount("contact-123");
 * if (count > 0) {
 *   // Show "Follow Up" button
 * } else {
 *   // Show "Cold Email" button
 * }
 * ```
 */
export async function getConversationCount(
  contactId: string
): Promise<number> {
  // Query with limit=1 since we only need to know if count > 0
  const response = await graphqlRequest<ConversationHistoryResponse>(
    CONVERSATION_HISTORY_QUERY,
    {
      contactId,
      limit: 1, // Optimize: only fetch 1 entry to check existence
    }
  );

  // Return the count of conversation entries
  return response.conversationHistory.length;
}
