import { graphqlMutation } from "./client";

/**
 * GraphQL operations for Email Draft Auto-Save
 *
 * This module provides GraphQL mutations for auto-saving email drafts
 * with optimistic locking and conflict detection.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EmailDraft {
  id: string;
  userId: string;
  contactId: string;
  subject?: string;
  bodyJson?: Record<string, unknown>;
  bodyHtml?: string;
  attachments?: Array<Record<string, unknown>>;
  signatureId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
}

export interface AutoSaveDraftInput {
  contactId: string;
  subject?: string;
  bodyJson?: Record<string, unknown>;
  bodyHtml?: string;
  attachments?: Array<Record<string, unknown>>;
  signatureId?: string;
  lastSyncedAt?: Date;
  version?: number;
}

// ============================================================================
// GRAPHQL MUTATIONS
// ============================================================================

const AUTO_SAVE_DRAFT_MUTATION = `
  mutation AutoSaveDraft($input: UpdateDraftInput!, $contactId: String!) {
    autoSaveDraft(input: $input, contactId: $contactId) {
      id
      userId
      contactId
      subject
      bodyJson
      bodyHtml
      attachments
      signatureId
      version
      createdAt
      updatedAt
      lastSyncedAt
    }
  }
`;

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Auto-save email draft to database
 *
 * @param input - Draft data to save
 * @returns Promise resolving to the saved draft
 * @throws Error if mutation fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const draft = await autoSaveDraft({
 *   contactId: 'contact-123',
 *   subject: 'Follow up email',
 *   bodyHtml: '<p>Hello!</p>',
 * });
 * ```
 */
export async function autoSaveDraft(
  input: AutoSaveDraftInput
): Promise<EmailDraft> {
  const { contactId, ...draftInput } = input;

  const data = await graphqlMutation<{ autoSaveDraft: EmailDraft }>(
    AUTO_SAVE_DRAFT_MUTATION,
    {
      contactId,
      input: draftInput,
    }
  );

  return data.autoSaveDraft;
}

// ============================================================================
// DRAFT RETRIEVAL
// ============================================================================

const GET_DRAFT_BY_CONTACT_QUERY = `
  query GetDraftByContact($contactId: String!) {
    emailDraft(contactId: $contactId) {
      id
      userId
      contactId
      subject
      bodyJson
      bodyHtml
      attachments
      signatureId
      version
      createdAt
      updatedAt
      lastSyncedAt
    }
  }
`;

/**
 * Get email draft for a specific contact
 *
 * @param contactId - Contact ID to fetch draft for
 * @returns Promise resolving to the email draft or null if not found
 * @throws Error if query fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const draft = await getDraftByContact('contact-123');
 * if (draft) {
 *   console.log('Found draft:', draft.subject);
 * }
 * ```
 */
export async function getDraftByContact(
  contactId: string
): Promise<EmailDraft | null> {
  try {
    const data = await graphqlMutation<{ emailDraft: EmailDraft | null }>(
      GET_DRAFT_BY_CONTACT_QUERY,
      { contactId }
    );

    return data.emailDraft;
  } catch (error) {
    // If draft not found, return null instead of throwing
    if (error instanceof Error && error.message.includes("not found")) {
      return null;
    }
    throw error;
  }
}
