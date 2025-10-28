import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";

// Mock the email-drafts module
const mockAutoSaveDraft = jest.fn<typeof import("@/lib/graphql/email-drafts").autoSaveDraft>();

jest.mock("@/lib/graphql/email-drafts", () => ({
  autoSaveDraft: (...args: any[]) => mockAutoSaveDraft(...args),
}));

// Import after mocking
import { useAutoSave } from "./useAutoSave";

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

describe("useAutoSave", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAutoSaveDraft.mockClear();
    localStorageMock.clear();
    jest.useFakeTimers();

    // Default successful response for DB sync
    mockAutoSaveDraft.mockResolvedValue({
      id: "draft-1",
      userId: "user-1",
      contactId: "contact-1",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("localStorage save", () => {
    it("saves to localStorage after 2 seconds of inactivity", async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { rerender } = renderHook(
        ({ content }) => useAutoSave(content, userId, contactId),
        { initialProps: { content } }
      );

      // Content change should not save immediately
      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      // Fast-forward 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should save to localStorage after debounce
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          `email-draft-${userId}-${contactId}`,
          expect.stringContaining('"subject":"Test"')
        );
      });
    });

    it("debounces localStorage saves (only saves once after 2s inactivity)", async () => {
      const userId = "user-1";
      const contactId = "contact-1";
      const content1 = { subject: "Test 1", bodyHtml: "<p>Hello 1</p>" };
      const content2 = { subject: "Test 2", bodyHtml: "<p>Hello 2</p>" };
      const content3 = { subject: "Test 3", bodyHtml: "<p>Hello 3</p>" };

      const { rerender } = renderHook(
        ({ content }) => useAutoSave(content, userId, contactId),
        { initialProps: { content: content1 } }
      );

      // Change content rapidly (typing simulation)
      rerender({ content: content2 });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      rerender({ content: content3 });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Still no save yet (only 1s passed)
      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      // Wait for full debounce (2s from last change)
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Should have saved only once with final content
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          `email-draft-${userId}-${contactId}`,
          expect.stringContaining('"subject":"Test 3"')
        );
      });
    });

    it("includes timestamp in localStorage data", async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      renderHook(() => useAutoSave(content, userId, contactId));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });

      const savedData = JSON.parse(
        (localStorageMock.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedData).toHaveProperty("timestamp");
      expect(typeof savedData.timestamp).toBe("number");
    });
  });

  describe("DB sync", () => {
    it("syncs to database after 10 seconds of inactivity", async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      renderHook(() => useAutoSave(content, userId, contactId));

      // Should not sync immediately
      expect(mockAutoSaveDraft).not.toHaveBeenCalled();

      // Fast-forward 10 seconds and flush all promises
      await act(async () => {
        jest.advanceTimersByTime(10000);
        
        
      });

      // Should sync to DB
      await waitFor(() => {
        expect(mockAutoSaveDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            contactId,
            subject: "Test",
            bodyHtml: "<p>Hello</p>",
          })
        );
      });
    });

    it("debounces DB syncs (only syncs once after 10s inactivity)", async () => {
      const userId = "user-1";
      const contactId = "contact-1";
      const content1 = { subject: "Test 1", bodyHtml: "<p>Hello 1</p>" };
      const content2 = { subject: "Test 2", bodyHtml: "<p>Hello 2</p>" };
      const content3 = { subject: "Test 3", bodyHtml: "<p>Hello 3</p>" };

      const { rerender } = renderHook(
        ({ content }) => useAutoSave(content, userId, contactId),
        { initialProps: { content: content1 } }
      );

      // Rapid changes
      rerender({ content: content2 });
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      rerender({ content: content3 });
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Still no DB sync (only 5s from last change)
      expect(mockAutoSaveDraft).not.toHaveBeenCalled();

      // Wait for full debounce
      await act(async () => {
        jest.advanceTimersByTime(5000);
        
        
      });

      // Should sync only once with final content
      await waitFor(() => {
        expect(mockAutoSaveDraft).toHaveBeenCalledTimes(1);
        expect(mockAutoSaveDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: "Test 3",
          })
        );
      });
    });
  });

  describe("save status", () => {
    it('returns "idle" status initially', () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      expect(result.current.saveStatus).toBe("idle");
    });

    it('updates to "saving" during localStorage save', async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      act(() => {
        jest.advanceTimersByTime(1900);
      });

      // Should show "saving" before save completes
      expect(result.current.saveStatus).toBe("saving");
    });

    it('updates to "saved" after successful localStorage save', async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe("saved");
      });
    });

    it('updates to "syncing" during DB sync', async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      // Mock with a delay
      mockAutoSaveDraft.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: "draft-1",
                  userId: "user-1",
                  contactId,
                  version: 1,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      await act(async () => {
        jest.advanceTimersByTime(10000);
        
        
      });

      // Should show "syncing" during DB sync
      await waitFor(() => {
        expect(result.current.saveStatus).toBe("syncing");
      });
    });

    it('updates to "synced" after successful DB sync', async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      await act(async () => {
        jest.advanceTimersByTime(10000);
        
        
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe("synced");
      });
    });

    it("provides lastSavedAt timestamp after save", async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      expect(result.current.lastSavedAt).toBeNull();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.lastSavedAt).not.toBeNull();
        expect(result.current.lastSavedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe("error handling", () => {
    it('updates to "error" status when DB sync fails', async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      mockAutoSaveDraft.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      await act(async () => {
        jest.advanceTimersByTime(10000);
        
        
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe("error");
      });
    });

    it("continues localStorage saves even when DB sync fails", async () => {
      const content1 = { subject: "Test 1", bodyHtml: "<p>Hello 1</p>" };
      const content2 = { subject: "Test 2", bodyHtml: "<p>Hello 2</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      mockAutoSaveDraft.mockRejectedValue(new Error("Network error"));

      const { rerender } = renderHook(
        ({ content }) => useAutoSave(content, userId, contactId),
        { initialProps: { content: content1 } }
      );

      // First save (localStorage should work, DB fails)
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      });

      // Change content again
      rerender({ content: content2 });

      // Second localStorage save should still work
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
        expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
          `email-draft-${userId}-${contactId}`,
          expect.stringContaining('"subject":"Test 2"')
        );
      });
    });

    it("provides error message when DB sync fails", async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const errorMessage = "Network error";
      mockAutoSaveDraft.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      await act(async () => {
        jest.advanceTimersByTime(10000);
        
        
      });

      await waitFor(() => {
        expect(result.current.error).toContain(errorMessage);
      });
    });
  });

  describe("cleanup on unmount", () => {
    it("cancels pending localStorage save on unmount", () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { unmount } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      // Start debounce timer but don't let it complete
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Unmount before save completes
      unmount();

      // Advance time past debounce period
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Save should not have happened
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("cancels pending DB sync on unmount", async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { unmount } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      // Start debounce timer but don't let it complete
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Unmount before sync completes
      unmount();

      // Advance time past debounce period
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // DB sync should not have happened
      expect(mockAutoSaveDraft).not.toHaveBeenCalled();
    });
  });

  describe("integration", () => {
    it("handles complete flow: localStorage save → DB sync → status updates", async () => {
      const content = { subject: "Test", bodyHtml: "<p>Hello</p>" };
      const userId = "user-1";
      const contactId = "contact-1";

      const { result } = renderHook(() =>
        useAutoSave(content, userId, contactId)
      );

      // Initial state
      expect(result.current.saveStatus).toBe("idle");
      expect(result.current.lastSavedAt).toBeNull();

      // After 2s: localStorage save
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
        expect(result.current.saveStatus).toBe("saved");
        expect(result.current.lastSavedAt).not.toBeNull();
      });

      // After 10s: DB sync
      await act(async () => {
        jest.advanceTimersByTime(8000);
        
        
      });

      await waitFor(() => {
        expect(mockAutoSaveDraft).toHaveBeenCalled();
        expect(result.current.saveStatus).toBe("synced");
      });
    });
  });
});
