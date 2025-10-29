import { renderHook, act, waitFor } from '@testing-library/react';
import { useGmailAuth } from './useGmailAuth';

// Mock global fetch
global.fetch = jest.fn();

// Mock window.open
const mockWindowOpen = jest.fn();
global.window.open = mockWindowOpen;

// Mock confirm dialog
global.confirm = jest.fn();

describe('useGmailAuth', () => {
  let mockPopup: {
    closed: boolean;
    close: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create mock popup window
    mockPopup = {
      closed: false,
      close: jest.fn(() => {
        mockPopup.closed = true;
      }),
    };

    mockWindowOpen.mockReturnValue(mockPopup);

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial connection status fetch', () => {
    it('should fetch connection status on mount', async () => {
      const mockStatus = {
        connected: true,
        emailAddress: 'test@gmail.com',
        expiresAt: new Date('2025-12-31'),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const { result } = renderHook(() => useGmailAuth());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.connectionStatus).toBeNull();

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.connectionStatus).toEqual(mockStatus);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/gmail/status', {
        credentials: 'include',
      });
    });

    it('should handle fetch error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.connectionStatus).toEqual({
        connected: false,
        emailAddress: null,
        expiresAt: null,
      });
    });

    it('should handle API error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('Failed to fetch Gmail status');
      expect(result.current.connectionStatus).toEqual({
        connected: false,
        emailAddress: null,
        expiresAt: null,
      });
    });
  });

  describe('OAuth connection flow', () => {
    beforeEach(() => {
      // Mock initial status as disconnected
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connected: false, emailAddress: null, expiresAt: null }),
      });
    });

    it('should open OAuth popup with correct parameters', async () => {
      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.connect();
      });

      expect(mockWindowOpen).toHaveBeenCalledWith(
        '/api/auth/gmail/authorize',
        'gmail-oauth',
        expect.stringContaining('width=600')
      );
      expect(result.current.isConnecting).toBe(true);
    });

    it('should handle successful OAuth callback via postMessage', async () => {
      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start connection
      act(() => {
        result.current.connect();
      });

      // Mock successful polling response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          connected: true,
          emailAddress: 'newuser@gmail.com',
          expiresAt: new Date('2025-12-31'),
        }),
      });

      // Simulate postMessage from popup
      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { type: 'gmail-oauth-success' },
            origin: window.location.origin,
          })
        );
      });

      // Advance timers for polling
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus?.connected).toBe(true);
      });

      expect(result.current.connectionStatus?.emailAddress).toBe('newuser@gmail.com');
      expect(result.current.isConnecting).toBe(false);
      expect(mockPopup.close).toHaveBeenCalled();
    });

    it('should handle OAuth error via postMessage', async () => {
      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.connect();
      });

      // Simulate error postMessage from popup
      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'gmail-oauth-error',
              error: 'User denied access',
            },
            origin: window.location.origin,
          })
        );
      });

      await waitFor(() => {
        expect(result.current.error).toBe('User denied access');
      });

      expect(result.current.isConnecting).toBe(false);
      expect(mockPopup.close).toHaveBeenCalled();
    });

    it('should ignore postMessage from different origin', async () => {
      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.connect();
      });

      // Simulate postMessage from different origin (should be ignored)
      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { type: 'gmail-oauth-success' },
            origin: 'https://malicious-site.com',
          })
        );
      });

      // Wait a bit to ensure nothing changes
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.isConnecting).toBe(true);
      expect(mockPopup.close).not.toHaveBeenCalled();
    });

    it('should handle user cancelling (popup closed)', async () => {
      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.connect();
      });

      // Simulate user closing popup
      mockPopup.closed = true;

      // Advance timer to check popup status
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('OAuth authorization cancelled by user');
      });

      expect(result.current.isConnecting).toBe(false);
    });

    it('should handle OAuth timeout after 5 minutes', async () => {
      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.connect();
      });

      // Advance timers by 5 minutes
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('OAuth authorization timed out');
      });

      expect(result.current.isConnecting).toBe(false);
      expect(mockPopup.close).toHaveBeenCalled();
    });

    it('should handle popup blocker (window.open returns null)', async () => {
      mockWindowOpen.mockReturnValueOnce(null);

      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.connect();
      });

      expect(result.current.error).toContain('Failed to open OAuth popup');
      expect(result.current.isConnecting).toBe(false);
    });
  });

  describe('Connection status polling', () => {
    it('should poll status until connected', async () => {
      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.connect();
      });

      // First 3 polls return not connected
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connected: false, emailAddress: null, expiresAt: null }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connected: false, emailAddress: null, expiresAt: null }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connected: false, emailAddress: null, expiresAt: null }),
        })
        // 4th poll returns connected
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            connected: true,
            emailAddress: 'connected@gmail.com',
            expiresAt: new Date('2025-12-31'),
          }),
        });

      // Simulate OAuth success
      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { type: 'gmail-oauth-success' },
            origin: window.location.origin,
          })
        );
      });

      // Advance timers for polling (4 attempts × 1 second)
      for (let i = 0; i < 4; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        });
      }

      await waitFor(() => {
        expect(result.current.connectionStatus?.connected).toBe(true);
      });

      expect(result.current.connectionStatus?.emailAddress).toBe('connected@gmail.com');
    });

    it('should fail polling after max attempts', async () => {
      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.connect();
      });

      // All polls return not connected
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ connected: false, emailAddress: null, expiresAt: null }),
      });

      // Simulate OAuth success
      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { type: 'gmail-oauth-success' },
            origin: window.location.origin,
          })
        );
      });

      // Advance timers for max polling attempts (10 attempts × 1 second)
      for (let i = 0; i < 11; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        });
      }

      // Should eventually show error
      await waitFor(() => {
        expect(result.current.error).toContain('Failed to verify Gmail connection');
      });
    });
  });

  describe('Disconnect functionality', () => {
    it('should disconnect with user confirmation', async () => {
      // Mock initial connected status
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connected: true,
          emailAddress: 'test@gmail.com',
          expiresAt: new Date('2025-12-31'),
        }),
      });

      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.connectionStatus?.connected).toBe(true);
      });

      // Mock confirm dialog (user confirms)
      (global.confirm as jest.Mock).mockReturnValueOnce(true);

      // Mock disconnect API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await act(async () => {
        await result.current.disconnect();
      });

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to disconnect your Gmail account?'
      );
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/gmail/disconnect', {
        method: 'DELETE',
        credentials: 'include',
      });
      expect(result.current.connectionStatus).toEqual({
        connected: false,
        emailAddress: null,
        expiresAt: null,
      });
    });

    it('should not disconnect if user cancels confirmation', async () => {
      const { result } = renderHook(() => useGmailAuth());

      // Mock confirm dialog (user cancels)
      (global.confirm as jest.Mock).mockReturnValueOnce(false);

      await act(async () => {
        await result.current.disconnect();
      });

      expect(global.confirm).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalledWith('/api/auth/gmail/disconnect', expect.anything());
    });

    it('should handle disconnect API error', async () => {
      // Mock connected status
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connected: true,
          emailAddress: 'test@gmail.com',
          expiresAt: new Date('2025-12-31'),
        }),
      });

      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.connectionStatus?.connected).toBe(true);
      });

      (global.confirm as jest.Mock).mockReturnValueOnce(true);

      // Mock disconnect API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await act(async () => {
        await result.current.disconnect();
      });

      expect(result.current.error).toContain('Failed to disconnect Gmail');
    });
  });

  describe('Refresh functionality', () => {
    it('should manually refresh connection status', async () => {
      // Initial status
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connected: false, emailAddress: null, expiresAt: null }),
      });

      const { result } = renderHook(() => useGmailAuth());

      await waitFor(() => {
        expect(result.current.connectionStatus?.connected).toBe(false);
      });

      // Mock refreshed status
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connected: true,
          emailAddress: 'refreshed@gmail.com',
          expiresAt: new Date('2025-12-31'),
        }),
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.connectionStatus?.connected).toBe(true);
      expect(result.current.connectionStatus?.emailAddress).toBe('refreshed@gmail.com');
    });
  });
});
