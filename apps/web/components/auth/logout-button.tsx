'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Logout Button Component
 *
 * Handles user logout with the following flow:
 * 1. Calls Supabase signOut() on client side
 * 2. Clears session cookies via API route
 * 3. Redirects to login page
 *
 * Usage:
 * ```tsx
 * <LogoutButton>Sign Out</LogoutButton>
 * <LogoutButton className="w-full">Logout</LogoutButton>
 * ```
 */
export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Attempt logout with retries to handle transient failures
      let retries = 3;
      let signOutError = null;

      while (retries > 0) {
        const { error } = await supabase.auth.signOut();

        if (!error) {
          // Logout successful
          signOutError = null;
          break;
        }

        signOutError = error;
        retries--;

        if (retries > 0) {
          // Wait 1 second before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }

      // Only proceed if logout succeeded
      if (signOutError) {
        // Show error to user - DO NOT redirect
        console.error('Logout failed after retries:', signOutError.message);
        setError('Failed to log out. Please try again.');
        setIsLoading(false);
        return;
      }

      // Clear all Supabase-related items from local storage ONLY after successful logout
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Redirect only after successful logout
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Unexpected logout error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="destructive"
        className={className}
        aria-label="Sign out"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Signing out...' : children || 'Sign Out'}
      </Button>
    </div>
  );
}
