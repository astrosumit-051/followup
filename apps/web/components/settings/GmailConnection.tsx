'use client';

import { useGmailAuth } from '@/hooks/useGmailAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

/**
 * GmailConnection Component
 *
 * Displays Gmail OAuth connection status and provides connect/disconnect controls
 *
 * Features:
 * - Shows connection status with visual indicators
 * - "Connect Gmail" button when not connected
 * - "Disconnect" button with confirmation when connected
 * - Displays connected email address
 * - Loading states during operations
 * - Error messages with retry option
 *
 * @example
 * ```tsx
 * <GmailConnection />
 * ```
 */
export function GmailConnection() {
  const { connectionStatus, isLoading, isConnecting, error, connect, disconnect, refresh } = useGmailAuth();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Gmail Integration</CardTitle>
            <CardDescription>
              Connect your Gmail account to send emails directly from Cordiq
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={refresh}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading connection status...</span>
          </div>
        )}

        {/* Connected State */}
        {!isLoading && connectionStatus?.connected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">Gmail Connected</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {connectionStatus.emailAddress}
                </p>
                {connectionStatus.expiresAt && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Token expires: {new Date(connectionStatus.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={disconnect}
              className="w-full sm:w-auto"
              data-testid="disconnect-gmail-button"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Disconnect Gmail
            </Button>
          </div>
        )}

        {/* Disconnected State */}
        {!isLoading && !connectionStatus?.connected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">No Gmail Connected</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect your Gmail to send emails and track conversations
                </p>
              </div>
            </div>

            <Button
              onClick={connect}
              disabled={isConnecting}
              className="w-full sm:w-auto"
              data-testid="connect-gmail-button"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Connect Gmail
                </>
              )}
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">What permissions do we need?</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Send emails on your behalf</li>
                <li>Read sent emails for conversation tracking</li>
              </ul>
              <p className="text-xs mt-3">
                Your credentials are encrypted and stored securely. You can disconnect at any time.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
