'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useContacts } from '@/lib/hooks/useContacts';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactListSkeleton } from '@/components/contacts/ContactCardSkeleton';
import { ContactListEmpty } from '@/components/contacts/ContactListEmpty';
import { ContactSearchBar } from '@/components/contacts/ContactSearchBar';
import { ContactFilters } from '@/components/contacts/ContactFilters';
import { ContactSortDropdown } from '@/components/contacts/ContactSortDropdown';
import type { ContactFilterInput, ContactSortField } from '@/lib/graphql/contacts';

/**
 * Contact List Page
 *
 * Displays all user contacts with search, filtering, sorting, and pagination.
 * Features:
 * - Grid layout of contact cards
 * - Real-time search with debouncing
 * - Filter by priority, company, industry
 * - Sort by name, priority, last contacted date
 * - Cursor-based pagination with "Load More" button
 * - Empty state when no contacts exist
 * - Create new contact button
 * - Client-side authentication check
 * - Error boundary for graceful error handling
 * - Loading skeleton for better UX
 * - Adjustable page size
 */
function ContactsPageContent() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ContactFilterInput>({});
  const [sortBy, setSortBy] = useState<ContactSortField>('name');
  const [pageSize, setPageSize] = useState(12);

  // Client-side auth check (in addition to middleware)
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setIsAuthChecking(false);
    };

    checkAuth();
  }, [router]);

  // Fetch contacts with pagination
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useContacts({
    search: searchQuery,
    filter: filters,
    sortBy,
    first: pageSize,
  });

  // Flatten paginated results
  const contacts = data?.pages.flatMap((page) => page.edges.map((edge) => edge.node)) ?? [];

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: ContactFilterInput) => {
    setFilters(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (field: ContactSortField) => {
    setSortBy(field);
  };

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2
                          border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4
                      sm:px-6
                      lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col space-y-4
                            sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-2">
                <div className="h-9 bg-gray-300 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-40 animate-pulse"></div>
            </div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="mb-6 space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
          </div>

          {/* Contact Cards Skeleton */}
          <ContactListSkeleton count={pageSize} />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading Contacts
          </h2>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4
                    sm:px-6
                    lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4
                          sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your professional network ({contacts.length} contact{contacts.length !== 1 ? 's' : ''})
              </p>
            </div>
            <Link
              href="/contacts/new"
              className="inline-flex items-center justify-center px-4 py-2
                         bg-blue-600 text-white font-medium rounded-md shadow-sm
                         hover:bg-blue-700 focus:outline-none focus:ring-2
                         focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Contact
            </Link>
          </div>
        </div>

        {/* Search, Filter, and Sort Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <ContactSearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search contacts by name, email, or company..."
          />

          {/* Filters, Sort, and Page Size */}
          <div className="flex flex-col space-y-4
                          sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
            <ContactFilters filters={filters} onChange={handleFilterChange} />
            <div className="flex space-x-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">
                  Show:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-blue-500 text-sm"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </div>

              <ContactSortDropdown value={sortBy} onChange={handleSortChange} />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {contacts.length === 0 && !isLoading && (
          <ContactListEmpty
            hasFilters={!!searchQuery || Object.keys(filters).length > 0}
            onClearFilters={() => {
              setSearchQuery('');
              setFilters({});
            }}
          />
        )}

        {/* Contact Grid */}
        {contacts.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6
                            sm:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-4">
              {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-md
                             shadow-sm text-sm font-medium text-gray-700
                             hover:bg-gray-50 focus:outline-none focus:ring-2
                             focus:ring-offset-2 focus:ring-blue-500
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors"
                >
                  {isFetchingNextPage ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading more...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Wrap with error boundary for graceful error handling
export default function ContactsPage() {
  return (
    <ErrorBoundary>
      <ContactsPageContent />
    </ErrorBoundary>
  );
}
