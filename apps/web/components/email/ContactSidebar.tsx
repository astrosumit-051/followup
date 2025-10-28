"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { useContacts } from "@/lib/hooks/useContacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ContactSidebarProps {
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function ContactSidebar({ onSelectionChange }: ContactSidebarProps) {
  const searchParams = useSearchParams();
  const contactIdFromUrl = searchParams.get("contactId");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set()
  );
  const [maxContactsError, setMaxContactsError] = useState(false);

  const selectedContactRef = useRef<HTMLDivElement>(null);

  // Debounce search input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build filter object for GraphQL query
  const filters = useMemo(() => {
    const filter: Record<string, string> = {};

    if (priorityFilter) {
      filter.priority = priorityFilter;
    }

    if (companyFilter) {
      filter.company = companyFilter;
    }

    if (industryFilter) {
      filter.industry = industryFilter;
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  }, [priorityFilter, companyFilter, industryFilter]);

  // Fetch contacts with search and filters
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useContacts({
    search: debouncedSearch || undefined,
    filter: filters,
    first: 50,
  });

  // Flatten contacts from pages
  const contacts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.nodes);
  }, [data]);

  // Filter contacts client-side (for search across name, email, company)
  const filteredContacts = useMemo(() => {
    if (!debouncedSearch) return contacts;

    const query = debouncedSearch.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query)
    );
  }, [contacts, debouncedSearch]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priorityFilter) count++;
    if (companyFilter) count++;
    if (industryFilter) count++;
    return count;
  }, [priorityFilter, companyFilter, industryFilter]);

  // Scroll to pre-selected contact from URL
  useEffect(() => {
    if (contactIdFromUrl && selectedContactRef.current) {
      selectedContactRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [contactIdFromUrl, contacts]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedContacts));
    }
  }, [selectedContacts, onSelectionChange]);

  // Handle contact selection toggle
  const handleContactToggle = (contactId: string) => {
    setSelectedContacts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
        setMaxContactsError(false);
      } else {
        if (newSet.size >= 100) {
          setMaxContactsError(true);
          return prev;
        }
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedContacts(new Set());
    setMaxContactsError(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setPriorityFilter("");
    setCompanyFilter("");
    setIndustryFilter("");
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Get priority display text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "High";
      case "MEDIUM":
        return "Medium";
      case "LOW":
        return "Low";
      default:
        return priority;
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-card border border-border rounded-lg">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-card border border-border rounded-lg p-4">
        <div className="text-center">
          <p className="text-sm text-destructive">Failed to load contacts</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card border border-border rounded-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Select Contact</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            aria-label="Search contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background
                     focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* Filters */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              <Filter className="inline h-3 w-3 mr-1" />
              Filters
            </span>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                  applied
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-8 text-xs" aria-haspopup="listbox">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Company Filter */}
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="h-8 text-xs" aria-haspopup="listbox">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Acme Corp">Acme Corp</SelectItem>
                <SelectItem value="TechCo">TechCo</SelectItem>
                <SelectItem value="FinanceInc">FinanceInc</SelectItem>
              </SelectContent>
            </Select>

            {/* Industry Filter */}
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="h-8 text-xs" aria-haspopup="listbox">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selection Counter */}
        {selectedContacts.size > 0 && (
          <div className="mt-3 flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedContacts.size} contact{selectedContacts.size > 1 ? "s" : ""}{" "}
              selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Max Contacts Error */}
        {maxContactsError && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs text-destructive">
              Campaign limit is 100 contacts
            </p>
          </div>
        )}
      </div>

      {/* Contact List */}
      <div
        className="flex-1 overflow-y-auto p-2 space-y-1"
        data-testid="contact-list"
      >
        {filteredContacts.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">
              {debouncedSearch
                ? `No contacts found matching "${debouncedSearch}"`
                : "No contacts available"}
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isSelected = selectedContacts.has(contact.id);
            const isPreSelected = contactIdFromUrl === contact.id;

            return (
              <div
                key={contact.id}
                ref={isPreSelected ? selectedContactRef : null}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  "hover:bg-accent cursor-pointer",
                  isPreSelected && "bg-blue-50 dark:bg-blue-950 border-blue-200",
                  isSelected && !isPreSelected && "bg-accent",
                  !isSelected && !isPreSelected && "border-transparent"
                )}
                onClick={() => handleContactToggle(contact.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleContactToggle(contact.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${contact.name}`}
                />

                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={contact.profilePicture || undefined}
                    alt={contact.name}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  {contact.company && (
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.company}
                    </p>
                  )}
                </div>

                <Badge
                  variant="secondary"
                  className={cn("text-xs", getPriorityColor(contact.priority))}
                >
                  {getPriorityText(contact.priority)}
                </Badge>
              </div>
            );
          })
        )}

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs"
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
