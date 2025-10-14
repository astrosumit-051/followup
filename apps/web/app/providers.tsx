"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Providers Component
 *
 * Wraps the application with necessary providers:
 * - ThemeProvider: next-themes for dark mode support
 * - QueryClientProvider: TanStack Query for data fetching and caching
 * - ReactQueryDevtools: Development tools for debugging queries (dev only)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance
  // useState ensures client is created once per request (server-side rendering safe)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time: 60 seconds
            staleTime: 60 * 1000,
            // Cache time: 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Show React Query Devtools in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
