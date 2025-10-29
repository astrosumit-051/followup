'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Gmail OAuth Callback Page
 *
 * Handles the OAuth callback from Google after user grants/denies permissions.
 * Displays status to user and sends postMessage to parent window to trigger
 * connection status update in the Settings page.
 *
 * This page is opened as a popup window during the OAuth flow.
 *
 * Flow:
 * 1. Backend redirects here after handling OAuth callback
 * 2. Parse URL params to check success/error
 * 3. Send postMessage to opener window
 * 4. Display status and auto-close after 2 seconds
 *
 * Route: /settings/gmail-callback
 *
 * @returns Callback status page
 */
export default function GmailCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const processCallback = async () => {
      // Check for error parameter
      const error = searchParams.get('error');
      const success = searchParams.get('success');

      if (error) {
        // OAuth error (user denied or error occurred)
        setStatus('error');
        setMessage(decodeURIComponent(error));

        // Notify parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'gmail-oauth-error',
              error: decodeURIComponent(error),
            },
            window.location.origin
          );
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      if (success === 'true') {
        // Success case - backend has already handled the callback
        // and exchanged the code for tokens
        setStatus('success');
        setMessage('Gmail connected successfully!');

        // Notify parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'gmail-oauth-success',
            },
            window.location.origin
          );
        }

        // Auto-close after 2 seconds
        setTimeout(() => {
          window.close();
        }, 2000);
        return;
      }

      // If neither error nor success, show error
      setStatus('error');
      setMessage('Invalid callback state');

      setTimeout(() => {
        window.close();
      }, 3000);
    };

    processCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Loading State */}
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold">Connecting Gmail</h2>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {/* Success State */}
            {status === 'success' && (
              <>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-green-900 dark:text-green-100">
                  Success!
                </h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">This window will close automatically...</p>
              </>
            )}

            {/* Error State */}
            {status === 'error' && (
              <>
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-semibold text-red-900 dark:text-red-100">
                  Connection Failed
                </h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">This window will close automatically...</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
