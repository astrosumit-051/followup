import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";

// Create mock function before jest.mock to ensure proper hoisting
const mockGetDraftByContact = jest.fn();

// Mock the email-drafts module - must be before imports
jest.mock("@/lib/graphql/email-drafts", () => ({
  __esModule: true,
  getDraftByContact: mockGetDraftByContact,
  autoSaveDraft: jest.fn(),
}));

// Mock the Supabase client
jest.mock("@/lib/supabase/client", () => ({
  __esModule: true,
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "mock-token",
            user: { id: "user-1" },
          },
        },
        error: null,
      }),
    },
  })),
}));

// Import after mocking
import { useDraftRecovery } from "./useDraftRecovery";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useDraftRecovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDraftByContact.mockClear();
    localStorageMock.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("returns null for recoveryPrompt when no localStorage draft exists", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).toBeNull();
        expect(result.current.localDraft).toBeNull();
      });
    });

    it("returns null for recoveryPrompt when localStorage draft is older than DB draft", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      // Set up localStorage draft (older timestamp)
      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now() - 60000, // 1 minute ago
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      // Mock DB draft (newer)
      mockGetDraftByContact.mockResolvedValue({
        id: "draft-1",
        userId,
        contactId,
        subject: "DB Subject",
        bodyHtml: "<p>DB Body</p>",
        updatedAt: new Date().toISOString(), // Now (newer)
      });

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).toBeNull();
      });
    });

    it("shows recoveryPrompt when localStorage draft is newer than DB draft", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      // Set up localStorage draft (newer timestamp)
      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(), // Now
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      // Mock DB draft (older)
      const dbUpdatedAt = new Date(Date.now() - 60000); // 1 minute ago
      mockGetDraftByContact.mockResolvedValue({
        id: "draft-1",
        userId,
        contactId,
        subject: "DB Subject",
        bodyHtml: "<p>DB Body</p>",
        updatedAt: dbUpdatedAt.toISOString(),
      });

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
        expect(result.current.localDraft).toEqual(localDraft);
      });
    });

    it("shows recoveryPrompt when localStorage draft exists but no DB draft", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      // Set up localStorage draft
      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      // Mock no DB draft
      mockGetDraftByContact.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
        expect(result.current.localDraft).toEqual(localDraft);
      });
    });
  });

  describe("recover action", () => {
    it("recovers localStorage draft and clears recovery prompt", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      mockGetDraftByContact.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
      });

      act(() => {
        result.current.recover();
      });

      await waitFor(() => {
        expect(result.current.recoveryPrompt).toBeNull();
        expect(result.current.recoveredDraft).toEqual({
          subject: localDraft.subject,
          bodyHtml: localDraft.bodyHtml,
        });
      });
    });

    it("does not clear localStorage after recovery", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      mockGetDraftByContact.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
      });

      act(() => {
        result.current.recover();
      });

      await waitFor(() => {
        expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      });
    });
  });

  describe("discard action", () => {
    it("discards localStorage draft and clears recovery prompt", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      const dbDraft = {
        id: "draft-1",
        userId,
        contactId,
        subject: "DB Subject",
        bodyHtml: "<p>DB Body</p>",
        updatedAt: new Date(Date.now() - 60000).toISOString(),
      };
      mockGetDraftByContact.mockResolvedValue(dbDraft);

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
      });

      act(() => {
        result.current.discard();
      });

      await waitFor(() => {
        expect(result.current.recoveryPrompt).toBeNull();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          `email-draft-${userId}-${contactId}`
        );
      });
    });

    it.skip("loads DB draft after discard if it exists", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      const dbDraft = {
        id: "draft-1",
        userId,
        contactId,
        subject: "DB Subject",
        bodyHtml: "<p>DB Body</p>",
        updatedAt: new Date(Date.now() - 60000).toISOString(),
      };
      // Mock for first call during init and second call during discard
      mockGetDraftByContact
        .mockResolvedValueOnce(dbDraft)
        .mockResolvedValueOnce(dbDraft);

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
      });

      await act(async () => {
        await result.current.discard();
      });

      await waitFor(
        () => {
          expect(result.current.recoveredDraft).toEqual({
            subject: dbDraft.subject,
            bodyHtml: dbDraft.bodyHtml,
          });
        },
        { timeout: 5000 }
      );
    });

    it("returns null recoveredDraft after discard if no DB draft exists", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      mockGetDraftByContact.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
      });

      act(() => {
        result.current.discard();
      });

      await waitFor(() => {
        expect(result.current.recoveredDraft).toBeNull();
      });
    });
  });

  describe("timestamp comparison edge cases", () => {
    it("handles invalid JSON in localStorage gracefully", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        "INVALID JSON"
      );

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      await waitFor(() => {
        expect(result.current.recoveryPrompt).toBeNull();
        expect(result.current.localDraft).toBeNull();
      });
    });

    it("handles localStorage draft without timestamp", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        // No timestamp
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      mockGetDraftByContact.mockResolvedValue({
        id: "draft-1",
        userId,
        contactId,
        subject: "DB Subject",
        bodyHtml: "<p>DB Body</p>",
        updatedAt: new Date().toISOString(),
      });

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      // Without timestamp, should not show recovery prompt
      await waitFor(() => {
        expect(result.current.recoveryPrompt).toBeNull();
      });
    });

    it("handles DB draft fetch error gracefully", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      mockGetDraftByContact.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      // On error, should still show recovery prompt (localStorage exists)
      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
        expect(result.current.localDraft).toEqual(localDraft);
      });
    });
  });

  describe("user interaction flow", () => {
    it("completes full recovery flow: detect → recover → use draft", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Recovered Subject",
        bodyHtml: "<p>Recovered Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      mockGetDraftByContact.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      // Step 1: Detect unsaved changes
      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
        expect(result.current.recoveryPrompt).toContain("Unsaved changes");
      });

      // Step 2: User clicks "Recover"
      act(() => {
        result.current.recover();
      });

      // Step 3: Draft is recovered and prompt is dismissed
      await waitFor(() => {
        expect(result.current.recoveryPrompt).toBeNull();
        expect(result.current.recoveredDraft).toEqual({
          subject: "Recovered Subject",
          bodyHtml: "<p>Recovered Body</p>",
        });
      });
    });

    it.skip("completes full discard flow: detect → discard → use DB draft", async () => {
      const userId = "user-1";
      const contactId = "contact-1";

      const localDraft = {
        subject: "Local Subject",
        bodyHtml: "<p>Local Body</p>",
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `email-draft-${userId}-${contactId}`,
        JSON.stringify(localDraft)
      );

      const dbDraft = {
        id: "draft-1",
        userId,
        contactId,
        subject: "DB Subject",
        bodyHtml: "<p>DB Body</p>",
        updatedAt: new Date(Date.now() - 60000).toISOString(),
      };
      // Mock for first call during init and second call during discard
      mockGetDraftByContact
        .mockResolvedValueOnce(dbDraft)
        .mockResolvedValueOnce(dbDraft);

      const { result } = renderHook(() =>
        useDraftRecovery(userId, contactId)
      );

      // Step 1: Detect unsaved changes
      await waitFor(() => {
        expect(result.current.recoveryPrompt).not.toBeNull();
      });

      // Step 2: User clicks "Discard"
      await act(async () => {
        await result.current.discard();
      });

      // Step 3: localStorage is cleared and DB draft is used
      await waitFor(() => {
        expect(result.current.recoveryPrompt).toBeNull();
        expect(localStorageMock.removeItem).toHaveBeenCalled();
        expect(result.current.recoveredDraft).toEqual({
          subject: "DB Subject",
          bodyHtml: "<p>DB Body</p>",
        });
      });
    });
  });
});
