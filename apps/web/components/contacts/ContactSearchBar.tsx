"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSearchBarProps {
  /**
   * Current search query
   */
  value: string;

  /**
   * Search query change handler
   */
  onChange: (query: string) => void;

  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;

  /**
   * Placeholder text
   * @default "Search contacts..."
   */
  placeholder?: string;

  /**
   * Loading state (when search is being performed)
   */
  isLoading?: boolean;
}

/**
 * ContactSearchBar Component
 *
 * Search input with debouncing to prevent excessive API calls.
 * Searches across contact names, emails, companies, and other fields.
 *
 * Features:
 * - Debounced input (default 300ms)
 * - Search icon indicator
 * - Clear button when text is entered
 * - Loading indicator
 * - Accessible keyboard navigation
 * - Responsive design
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 *
 * <ContactSearchBar
 *   value={searchQuery}
 *   onChange={(query) => setSearchQuery(query)}
 *   debounceMs={300}
 *   isLoading={isSearching}
 * />
 * ```
 */
export function ContactSearchBar({
  value,
  onChange,
  debounceMs = 300,
  placeholder = "Search contacts...",
  isLoading = false,
}: ContactSearchBarProps) {
  const [inputValue, setInputValue] = useState(value);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, onChange, value]);

  // Sync input value when parent value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange("");
  }, [onChange]);

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* Search Input */}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-label="Search contacts"
        data-testid="contact-search-input"
      />

      {/* Loading Indicator or Clear Button */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {isLoading ? (
          <Loader2
            className="h-4 w-4 text-muted-foreground animate-spin"
            aria-label="Loading"
          />
        ) : (
          inputValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-transparent"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )
        )}
      </div>
    </div>
  );
}
