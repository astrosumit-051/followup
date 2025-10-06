'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

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
 * <LogoutButton className="btn-primary">Logout</LogoutButton>
 * ```
 */
export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient();

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Sign out from Supabase (client-side)
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error.message);
      }

      // Always redirect to login, even if logout had an error
      // This ensures user is logged out from the UI
      router.push('/login');
      router.refresh(); // Force router refresh to clear any cached auth state
    } catch (error) {
      console.error('Unexpected logout error:', error);

      // Still redirect to login for safety
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
      aria-label="Sign out"
    >
      {isLoading ? 'Signing out...' : children || 'Sign Out'}
    </button>
  );
}
