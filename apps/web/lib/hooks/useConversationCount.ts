import { useQuery } from "@tanstack/react-query";
import { getConversationCount } from "@/lib/graphql/conversation-history";

/**
 * Hook to get conversation count for a contact
 *
 * Returns the number of conversation entries for a contact.
 * Used to determine if contact has conversation history (Follow Up)
 * or no history (Cold Email).
 *
 * @param contactId - Contact ID to get conversation count for
 * @returns Query result with conversation count
 *
 * @example
 * ```typescript
 * const { data: count, isLoading } = useConversationCount("contact-123");
 * if (count > 0) {
 *   // Show "Follow Up" button
 * } else {
 *   // Show "Cold Email" button
 * }
 * ```
 */
export function useConversationCount(contactId: string) {
  return useQuery<number>({
    queryKey: ["conversation-count", contactId],
    queryFn: async () => {
      console.log('[useConversationCount] Fetching conversation count for contact:', contactId);
      try {
        const count = await getConversationCount(contactId);
        console.log('[useConversationCount] Successfully fetched count:', count);
        return count;
      } catch (error) {
        console.error('[useConversationCount] Error fetching conversation count:', error);
        throw error;
      }
    },
    enabled: !!contactId, // Only run query if contactId is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}
