'use client';

import { useState, useEffect, useCallback } from 'react';

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
    setInputValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md
                   leading-5 bg-white placeholder-gray-500 text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   sm:text-sm"
        aria-label="Search contacts"
      />

      {/* Loading Indicator or Clear Button */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          inputValue && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none
                         focus:text-gray-600 transition-colors duration-150"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )
        )}
      </div>
    </div>
  );
}
