import { useEffect, useState } from "react";
import { getDraftByContact, type EmailDraft } from "@/lib/graphql/email-drafts";

/**
 * Draft Recovery Hook for Email Composition
 *
 * Detects unsaved changes in localStorage and prompts user to recover them.
 * Compares localStorage timestamp with database updatedAt to determine if
 * recovery is needed.
 *
 * @param userId - Current user ID for localStorage key
 * @param contactId - Contact ID for draft association
 * @returns Recovery prompt, actions, and recovered draft content
 *
 * @example
 * ```typescript
 * const { recoveryPrompt, recover, discard, recoveredDraft } = useDraftRecovery(
 *   'user-123',
 *   'contact-456'
 * );
 *
 * if (recoveryPrompt) {
 *   // Show modal with recoveryPrompt message
 *   // User can click "Recover" or "Discard"
 * }
 *
 * if (recoveredDraft) {
 *   // Load recovered content into editor
 * }
 * ```
 */

export interface LocalDraft {
  subject?: string;
  bodyHtml?: string;
  bodyJson?: Record<string, any>;
  attachments?: Array<Record<string, any>>;
  signatureId?: string;
  timestamp: number;
}

export interface RecoveredDraft {
  subject?: string;
  bodyHtml?: string;
  bodyJson?: Record<string, any>;
  attachments?: Array<Record<string, any>>;
  signatureId?: string;
}

export interface DraftRecoveryResult {
  recoveryPrompt: string | null;
  localDraft: LocalDraft | null;
  recover: () => void;
  discard: () => void;
  recoveredDraft: RecoveredDraft | null;
}

export function useDraftRecovery(
  userId: string,
  contactId: string
): DraftRecoveryResult {
  const [recoveryPrompt, setRecoveryPrompt] = useState<string | null>(null);
  const [localDraft, setLocalDraft] = useState<LocalDraft | null>(null);
  const [recoveredDraft, setRecoveredDraft] = useState<RecoveredDraft | null>(
    null
  );

  /**
   * Check for unsaved changes on mount
   */
  useEffect(() => {
    const checkForUnsavedChanges = async () => {
      try {
        // Step 1: Check localStorage
        const localStorageKey = `email-draft-${userId}-${contactId}`;
        const localStorageData = localStorage.getItem(localStorageKey);

        if (!localStorageData) {
          // No localStorage draft, nothing to recover
          return;
        }

        // Step 2: Parse localStorage draft
        let parsedLocalDraft: LocalDraft;
        try {
          parsedLocalDraft = JSON.parse(localStorageData);
        } catch (error) {
          console.error("Failed to parse localStorage draft:", error);
          // Invalid JSON, clear it and return
          localStorage.removeItem(localStorageKey);
          return;
        }

        // Step 3: Validate localStorage draft has timestamp
        if (!parsedLocalDraft.timestamp) {
          console.warn("localStorage draft missing timestamp");
          return;
        }

        setLocalDraft(parsedLocalDraft);

        // Step 4: Fetch DB draft
        let dbDraft: EmailDraft | null = null;
        try {
          dbDraft = await getDraftByContact(contactId);
        } catch (error) {
          console.error("Failed to fetch DB draft:", error);
          // On error, assume localStorage is newer (show recovery prompt)
          setRecoveryPrompt(
            "Unsaved changes detected. Would you like to restore your draft?"
          );
          return;
        }

        // Step 5: Compare timestamps
        if (!dbDraft) {
          // No DB draft exists, localStorage is newer
          setRecoveryPrompt(
            "Unsaved changes detected. Would you like to restore your draft?"
          );
          return;
        }

        const dbTimestamp = new Date(dbDraft.updatedAt).getTime();
        const localTimestamp = parsedLocalDraft.timestamp;

        if (localTimestamp > dbTimestamp) {
          // localStorage is newer, show recovery prompt
          setRecoveryPrompt(
            "Unsaved changes detected. Would you like to restore your draft?"
          );
        }
        // If DB is newer or equal, no recovery needed
      } catch (error) {
        console.error("Draft recovery check failed:", error);
      }
    };

    checkForUnsavedChanges();
  }, [userId, contactId]);

  /**
   * Recover localStorage draft
   */
  const recover = () => {
    if (!localDraft) {
      return;
    }

    // Extract draft content (without timestamp)
    const { timestamp, ...draftContent } = localDraft;

    setRecoveredDraft(draftContent);
    setRecoveryPrompt(null);
  };

  /**
   * Discard localStorage draft and load DB version
   */
  const discard = async () => {
    // Clear localStorage
    const localStorageKey = `email-draft-${userId}-${contactId}`;
    localStorage.removeItem(localStorageKey);

    // Load DB draft if it exists
    try {
      const dbDraft = await getDraftByContact(contactId);

      if (dbDraft) {
        setRecoveredDraft({
          subject: dbDraft.subject,
          bodyHtml: dbDraft.bodyHtml,
          bodyJson: dbDraft.bodyJson,
          attachments: dbDraft.attachments,
          signatureId: dbDraft.signatureId,
        });
      } else {
        setRecoveredDraft(null);
      }
    } catch (error) {
      console.error("Failed to fetch DB draft after discard:", error);
      setRecoveredDraft(null);
    }

    setRecoveryPrompt(null);
    setLocalDraft(null);
  };

  return {
    recoveryPrompt,
    localDraft,
    recover,
    discard,
    recoveredDraft,
  };
}
