import { useEffect, useRef, useState, useCallback } from "react";
import debounce from "lodash.debounce";
import { autoSaveDraft, type AutoSaveDraftInput } from "@/lib/graphql/email-drafts";

/**
 * Auto-Save Hook for Email Drafts
 *
 * Provides hybrid auto-save functionality with:
 * - localStorage save every 2 seconds (instant, resilient)
 * - Database sync every 10 seconds (persistent, shareable)
 * - Save status tracking for UI feedback
 * - Error handling with graceful degradation
 *
 * @param content - Email draft content (subject, bodyHtml, etc.)
 * @param userId - Current user ID for localStorage key
 * @param contactId - Contact ID for draft association
 * @returns Save status, lastSavedAt timestamp, and error message
 *
 * @example
 * ```typescript
 * const { saveStatus, lastSavedAt, error } = useAutoSave(
 *   { subject: 'Hello', bodyHtml: '<p>World</p>' },
 *   'user-123',
 *   'contact-456'
 * );
 * ```
 */

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "syncing"
  | "synced"
  | "error";

export interface DraftContent {
  subject?: string;
  bodyHtml?: string;
  bodyJson?: Record<string, any>;
  attachments?: Array<Record<string, any>>;
  signatureId?: string;
}

export interface AutoSaveResult {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  error: string | null;
}

export function useAutoSave(
  content: DraftContent,
  userId: string,
  contactId: string
): AutoSaveResult {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for debounced functions to enable cleanup
  const localSaveRef = useRef<ReturnType<typeof debounce>>();
  const dbSyncRef = useRef<ReturnType<typeof debounce>>();

  /**
   * Save to localStorage (2-second debounce)
   * Provides instant save for crash recovery
   */
  const saveToLocalStorage = useCallback(() => {
    try {
      const localStorageKey = `email-draft-${userId}-${contactId}`;
      const draftData = {
        ...content,
        timestamp: Date.now(),
      };

      localStorage.setItem(localStorageKey, JSON.stringify(draftData));
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      setError(null);
    } catch (err) {
      console.error("localStorage save failed:", err);
      // Don't set error status for localStorage failures
      // (they're usually quota issues and not critical)
    }
  }, [content, userId, contactId]);

  /**
   * Sync to database (10-second debounce)
   * Provides persistent storage across devices
   */
  const syncToDatabase = useCallback(async () => {
    try {
      setSaveStatus("syncing");

      const input: AutoSaveDraftInput = {
        contactId,
        subject: content.subject,
        bodyHtml: content.bodyHtml,
        bodyJson: content.bodyJson,
        attachments: content.attachments,
        signatureId: content.signatureId,
        lastSyncedAt: new Date(),
      };

      await autoSaveDraft(input);

      setSaveStatus("synced");
      setLastSavedAt(new Date());
      setError(null);
    } catch (err) {
      console.error("Database sync failed:", err);
      setSaveStatus("error");
      setError(err instanceof Error ? err.message : "Failed to sync to server");
    }
  }, [content, contactId]);

  /**
   * Set up debounced save functions
   */
  useEffect(() => {
    // Create debounced localStorage save (2 seconds)
    localSaveRef.current = debounce(() => {
      setSaveStatus("saving");
      saveToLocalStorage();
    }, 2000);

    // Create debounced DB sync (10 seconds)
    dbSyncRef.current = debounce(async () => {
      await syncToDatabase();
    }, 10000);

    // Cleanup: cancel pending debounced calls on unmount
    return () => {
      if (localSaveRef.current) {
        localSaveRef.current.cancel();
      }
      if (dbSyncRef.current) {
        dbSyncRef.current.cancel();
      }
    };
  }, [saveToLocalStorage, syncToDatabase]);

  /**
   * Trigger auto-save when content changes
   */
  useEffect(() => {
    // Skip if content is empty (initial mount)
    if (!content.subject && !content.bodyHtml && !content.bodyJson) {
      return;
    }

    // Trigger debounced saves
    if (localSaveRef.current) {
      localSaveRef.current();
    }
    if (dbSyncRef.current) {
      dbSyncRef.current();
    }
  }, [content]);

  return {
    saveStatus,
    lastSavedAt,
    error,
  };
}
