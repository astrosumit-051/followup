"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { useContacts } from "@/lib/hooks/useContacts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ContactCard } from "@/components/contacts/ContactCard";
import { ContactListSkeleton } from "@/components/contacts/ContactCardSkeleton";
import { ContactListEmpty } from "@/components/contacts/ContactListEmpty";
import { ContactSearchBar } from "@/components/contacts/ContactSearchBar";
import { ContactFilters } from "@/components/contacts/ContactFilters";
import { ContactSortDropdown } from "@/components/contacts/ContactSortDropdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import type {
  ContactFilterInput,
  ContactSortField,
  SortOrder,
  ContactConnection,
} from "@/lib/graphql/contacts";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ContactFilterInput>({});
  const [sortBy, setSortBy] = useState<ContactSortField>("NAME");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [pageSize, setPageSize] = useState(12);

  // Client-side auth check (in addition to middleware)
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
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
    sortOrder,
    first: pageSize,
  });

  // Flatten paginated results
  const contacts =
    data?.pages.flatMap((page) => page.nodes) ?? [];

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: ContactFilterInput) => {
    setFilters(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (field: ContactSortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Loading skeleton state
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background py-8 px-4
                      sm:px-6
                      lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div
              className="flex flex-col space-y-4
                            sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
            >
              <div className="space-y-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="mb-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
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
        <div className="text-center bg-destructive/10 p-6 rounded-lg border border-destructive/20">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Contacts
          </h2>
          <p className="text-destructive/90">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background py-8 px-4
                    sm:px-6
                    lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div
            className="flex flex-col space-y-4
                          sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your professional network ({contacts.length} contact
                {contacts.length !== 1 ? "s" : ""})
              </p>
            </div>
            <Button asChild>
              <Link href="/contacts/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Contact
              </Link>
            </Button>
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
          <div
            className="flex flex-col space-y-4
                          sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4"
          >
            <ContactFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
            <div className="flex space-x-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="pageSize" className="text-sm font-medium">
                  Show:
                </Label>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger id="pageSize" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                    <SelectItem value="96">96</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ContactSortDropdown
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {contacts.length === 0 && !isLoading && (
          <ContactListEmpty
            message={
              !!searchQuery || Object.keys(filters).length > 0
                ? "No contacts match your search or filters"
                : "No contacts found"
            }
            actionText={
              !!searchQuery || Object.keys(filters).length > 0
                ? "Clear Filters"
                : "Create Contact"
            }
            onAction={() => {
              if (!!searchQuery || Object.keys(filters).length > 0) {
                setSearchQuery("");
                setFilters({});
              } else {
                router.push("/contacts/new");
              }
            }}
          />
        )}

        {/* Contact Grid */}
        {contacts.length > 0 && (
          <>
            <div
              data-testid="contact-grid"
              className="grid grid-cols-1 gap-6
                            sm:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-4"
            >
              {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
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
