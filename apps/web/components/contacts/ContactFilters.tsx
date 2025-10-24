"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface ContactFiltersProps {
  /**
   * Current filter values
   */
  filters: {
    priority?: "HIGH" | "MEDIUM" | "LOW";
    company?: string;
    industry?: string;
  };

  /**
   * Filter change handler
   */
  onFiltersChange: (filters: {
    priority?: "HIGH" | "MEDIUM" | "LOW";
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

  const handleClearFilters = () => {
    onFiltersChange({});
    setIsExpanded(false);
  };

  const hasActiveFilters = !!(
    filters.priority ||
    filters.company ||
    filters.industry
  );
  const activeFilterCount = [
    filters.priority,
    filters.company,
    filters.industry,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium">Filters</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs"
              aria-expanded={isExpanded}
            >
              {isExpanded ? "Hide" : "Show"} filters
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Filter Controls */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Priority Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-priority">Priority</Label>
              <Select
                value={filters.priority || ""}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    priority: value
                      ? (value as "HIGH" | "MEDIUM" | "LOW")
                      : undefined,
                  })
                }
              >
                <SelectTrigger id="filter-priority" data-testid="contact-filter-priority">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-company">Company</Label>
              <Select
                value={filters.company || ""}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    company: value || undefined,
                  })
                }
              >
                <SelectTrigger id="filter-company">
                  <SelectValue placeholder="All companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-industry">Industry</Label>
              <Select
                value={filters.industry || ""}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    industry: value || undefined,
                  })
                }
              >
                <SelectTrigger id="filter-industry">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <CardContent className="pt-0 pb-4">
          <div className="flex flex-wrap gap-2">
            {filters.priority && (
              <Badge variant="secondary" className="gap-1">
                Priority: {filters.priority}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onFiltersChange({ ...filters, priority: undefined })
                  }
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  aria-label="Remove priority filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.company && (
              <Badge variant="secondary" className="gap-1">
                Company: {filters.company}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onFiltersChange({ ...filters, company: undefined })
                  }
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  aria-label="Remove company filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.industry && (
              <Badge variant="secondary" className="gap-1">
                Industry: {filters.industry}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onFiltersChange({ ...filters, industry: undefined })
                  }
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  aria-label="Remove industry filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
