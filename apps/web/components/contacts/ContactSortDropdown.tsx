'use client';

import type { ContactSortField, SortOrder } from '@/lib/graphql/contacts';

interface ContactSortDropdownProps {
  /**
   * Current sort field
   */
  sortBy: ContactSortField;

  /**
   * Current sort order
   */
  sortOrder: SortOrder;

  /**
   * Sort change handler
   */
  onSortChange: (sortBy: ContactSortField, sortOrder: SortOrder) => void;
}

/**
 * ContactSortDropdown Component
 *
 * Dropdown menu for selecting contact list sort options.
 * Combines sort field and order in a single dropdown.
 *
 * Features:
 * - Sort by: Name, Created Date, Last Contacted, Priority, Company, Industry
 * - Sort order: Ascending or Descending
 * - Visual indicator for current selection
 * - Accessible keyboard navigation
 * - Responsive design
 *
 * @example
 * ```tsx
 * const [sortBy, setSortBy] = useState<ContactSortField>('NAME');
 * const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
 *
 * <ContactSortDropdown
 *   sortBy={sortBy}
 *   sortOrder={sortOrder}
 *   onSortChange={(field, order) => {
 *     setSortBy(field);
 *     setSortOrder(order);
 *   }}
 * />
 * ```
 */
export function ContactSortDropdown({
  sortBy,
  sortOrder,
  onSortChange,
}: ContactSortDropdownProps) {
  // Combine sort field and order into single value for select
  const sortValue = `${sortBy}:${sortOrder}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split(':') as [ContactSortField, SortOrder];
    onSortChange(field, order);
  };

  // Sort options with human-readable labels
  const sortOptions = [
    { value: 'NAME:asc', label: 'Name (A-Z)' },
    { value: 'NAME:desc', label: 'Name (Z-A)' },
    { value: 'CREATED_AT:desc', label: 'Recently Added' },
    { value: 'CREATED_AT:asc', label: 'Oldest First' },
    { value: 'LAST_CONTACTED_AT:desc', label: 'Recently Contacted' },
    { value: 'LAST_CONTACTED_AT:asc', label: 'Least Recently Contacted' },
    { value: 'PRIORITY:desc', label: 'Priority (High to Low)' },
    { value: 'PRIORITY:asc', label: 'Priority (Low to High)' },
    { value: 'COMPANY:asc', label: 'Company (A-Z)' },
    { value: 'COMPANY:desc', label: 'Company (Z-A)' },
    { value: 'INDUSTRY:asc', label: 'Industry (A-Z)' },
    { value: 'INDUSTRY:desc', label: 'Industry (Z-A)' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="contact-sort"
        className="text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        Sort by:
      </label>
      <select
        id="contact-sort"
        value={sortValue}
        onChange={handleSortChange}
        className="block w-full rounded-md border-gray-300 shadow-sm
                   focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                   py-1.5 pl-3 pr-10"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
