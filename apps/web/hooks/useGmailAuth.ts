'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Gmail connection status returned by the hook
 */
export interface GmailConnectionStatus {
  connected: boolean;
  emailAddress: string | null;
  expiresAt: Date | null;
}

/**
 * Return type for useGmailAuth hook
 */
export interface UseGmailAuthReturn {
  connectionStatus: GmailConnectionStatus | null;
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom React hook for managing Gmail OAuth authentication
 *
 * Features:
 * - Fetches and caches Gmail connection status
 * - Opens OAuth popup for authorization
 * - Listens for OAuth callback via postMessage
 * - Polls connection status after callback
 * - Handles disconnection with confirmation
 * - Comprehensive error handling
 *
 * @returns Gmail auth state and control functions
 *
 * @example
 * ```tsx
 * const { connectionStatus, isConnecting, connect, disconnect } = useGmailAuth();
 *
 * return (
 *   <div>
 *     {connectionStatus?.connected ? (
 *       <button onClick={disconnect}>Disconnect</button>
 *     ) : (
 *       <button onClick={connect}>Connect Gmail</button>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useGmailAuth(): UseGmailAuthReturn {
  const [connectionStatus, setConnectionStatus] = useState<GmailConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch Gmail connection status from backend
   */
  const fetchConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/gmail/status', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Gmail status: ${response.statusText}`);
      }

      const data: GmailConnectionStatus = await response.json();
      setConnectionStatus(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching Gmail connection status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch connection status');
      setConnectionStatus({ connected: false, emailAddress: null, expiresAt: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch connection status on mount
   */
  useEffect(() => {
    fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  /**
   * Initiate Gmail OAuth flow by opening popup window
   */
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Open OAuth popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        '/api/auth/gmail/authorize',
        'gmail-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        throw new Error('Failed to open OAuth popup. Please disable popup blockers and try again.');
      }

      // Use a ref to track if OAuth is complete to avoid stale closures
      let oauthComplete = false;
      let checkPopupClosed: NodeJS.Timeout;
      let timeoutId: NodeJS.Timeout;

      // Listen for postMessage from popup (callback completion)
      const handleMessage = async (event: MessageEvent) => {
        // Verify message origin (should be same origin)
        if (event.origin !== window.location.origin) {
          return;
        }

        // Check for OAuth success message
        if (event.data?.type === 'gmail-oauth-success') {
          oauthComplete = true;
          clearInterval(checkPopupClosed);
          clearTimeout(timeoutId);
          popup.close();
          window.removeEventListener('message', handleMessage);

          // Poll for connection status update
          try {
            await pollConnectionStatus();
            setIsConnecting(false);
          } catch (pollError) {
            setError(pollError instanceof Error ? pollError.message : 'Failed to verify connection');
            setIsConnecting(false);
          }
        } else if (event.data?.type === 'gmail-oauth-error') {
          oauthComplete = true;
          clearInterval(checkPopupClosed);
          clearTimeout(timeoutId);
          popup.close();
          window.removeEventListener('message', handleMessage);
          setError(event.data.error || 'OAuth authorization failed');
          setIsConnecting(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // Monitor popup closure (user cancelled)
      checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', handleMessage);

          // Only set error if OAuth wasn't completed
          if (!oauthComplete) {
            setError('OAuth authorization cancelled by user');
            setIsConnecting(false);
          }
        }
      }, 500);

      // Cleanup timeout after 5 minutes
      timeoutId = setTimeout(() => {
        clearInterval(checkPopupClosed);
        window.removeEventListener('message', handleMessage);
        if (!popup.closed) {
          popup.close();
        }
        if (!oauthComplete) {
          setError('OAuth authorization timed out');
          setIsConnecting(false);
        }
      }, 5 * 60 * 1000);
    } catch (err) {
      console.error('Error connecting Gmail:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect Gmail');
      setIsConnecting(false);
    }
  }, [isConnecting]);

  /**
   * Poll connection status after OAuth callback until connected
   */
  const pollConnectionStatus = useCallback(
    async (maxAttempts = 10, interval = 1000): Promise<void> => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, interval));

        try {
          const response = await fetch('/api/auth/gmail/status', {
            credentials: 'include',
          });

          if (!response.ok) {
            continue;
          }

          const data: GmailConnectionStatus = await response.json();

          if (data.connected) {
            setConnectionStatus(data);
            setError(null);
            return;
          }
        } catch (err) {
          console.warn(`Polling attempt ${attempt + 1} failed:`, err);
        }
      }

      throw new Error('Failed to verify Gmail connection after OAuth');
    },
    []
  );

  /**
   * Disconnect Gmail account
   */
  const disconnect = useCallback(async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail account?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/gmail/disconnect', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect Gmail: ${response.statusText}`);
      }

      setConnectionStatus({ connected: false, emailAddress: null, expiresAt: null });
    } catch (err) {
      console.error('Error disconnecting Gmail:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect Gmail');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Manually refresh connection status
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  return {
    connectionStatus,
    isLoading,
    isConnecting,
    error,
    connect,
    disconnect,
    refresh,
  };
}
