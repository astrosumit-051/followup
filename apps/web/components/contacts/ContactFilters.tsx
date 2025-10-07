'use client';

import { useState } from 'react';

interface ContactFiltersProps {
  /**
   * Current filter values
   */
  filters: {
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    company?: string;
    industry?: string;
  };

  /**
   * Filter change handler
   */
  onFiltersChange: (filters: {
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    company?: string;
    industry?: string;
  }) => void;

  /**
   * Available companies for filtering (unique list)
   */
  companies?: string[];

  /**
   * Available industries for filtering (unique list)
   */
  industries?: string[];
}

/**
 * ContactFilters Component
 *
 * Provides filtering controls for the contact list.
 * Filters by priority, company, and industry.
 *
 * Features:
 * - Priority dropdown (HIGH/MEDIUM/LOW)
 * - Company dropdown (dynamic from contact list)
 * - Industry dropdown (dynamic from contact list)
 * - Clear all filters button
 * - Active filter indicators
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <ContactFilters
 *   filters={currentFilters}
 *   onFiltersChange={(newFilters) => setFilters(newFilters)}
 *   companies={['Acme Corp', 'TechStart', 'InnovateCo']}
 *   industries={['Technology', 'Finance', 'Healthcare']}
 * />
 * ```
 */
export function ContactFilters({
  filters,
  onFiltersChange,
  companies = [],
  industries = [],
}: ContactFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' | '';
    onFiltersChange({
      ...filters,
      priority: value || undefined,
    });
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      company: value || undefined,
    });
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      industry: value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
    setIsExpanded(false);
  };

  const hasActiveFilters = !!(filters.priority || filters.company || filters.industry);
  const activeFilterCount = [filters.priority, filters.company, filters.industry].filter(
    Boolean
  ).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium
                       focus:outline-none focus:underline"
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Hide' : 'Show'} filters
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      {isExpanded && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Priority Filter */}
          <div>
            <label
              htmlFor="filter-priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="filter-priority"
              value={filters.priority || ''}
              onChange={handlePriorityChange}
              className="block w-full rounded-md border-gray-300 shadow-sm
                         focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label
              htmlFor="filter-company"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company
            </label>
            <select
              id="filter-company"
              value={filters.company || ''}
              onChange={handleCompanyChange}
              className="block w-full rounded-md border-gray-300 shadow-sm
                         focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label
              htmlFor="filter-industry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Industry
            </label>
            <select
              id="filter-industry"
              value={filters.industry || ''}
              onChange={handleIndustryChange}
              className="block w-full rounded-md border-gray-300 shadow-sm
                         focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.priority && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Priority: {filters.priority}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, priority: undefined })
                }
                className="ml-1 text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label="Remove priority filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.company && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Company: {filters.company}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, company: undefined })
                }
                className="ml-1 text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label="Remove company filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.industry && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Industry: {filters.industry}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, industry: undefined })
                }
                className="ml-1 text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label="Remove industry filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
