/**
 * Contact Formatting Utilities
 *
 * Centralized formatting functions for contact data display.
 * These utilities ensure consistent formatting across all contact views.
 */

/**
 * Format a date string to human-readable format
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string (e.g., "January 15, 2024") or "Not set"
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a datetime string to human-readable format with time
 * @param dateString - ISO datetime string or null/undefined
 * @returns Formatted datetime string (e.g., "Jan 15, 2024, 3:30 PM") or "Never"
 */
export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Format priority enum to display string
 * @param priority - Priority enum value (HIGH, MEDIUM, LOW) or null/undefined
 * @returns Formatted priority string (e.g., "High", "Medium", "Low") or "Not set"
 */
export const formatPriority = (priority?: string | null): string => {
  if (!priority) return 'Not set';
  return priority.charAt(0) + priority.slice(1).toLowerCase();
};

/**
 * Format gender enum to display string
 * @param gender - Gender enum value or null/undefined
 * @returns Formatted gender string or "Not specified"
 */
export const formatGender = (gender?: string | null): string => {
  if (!gender) return 'Not specified';
  if (gender === 'PREFER_NOT_TO_SAY') return 'Prefer not to say';
  return gender.charAt(0) + gender.slice(1).toLowerCase();
};

/**
 * Get Tailwind CSS classes for priority badge background and text color
 * @param priority - Priority enum value (HIGH, MEDIUM, LOW) or null/undefined
 * @returns Tailwind CSS class string for background and text colors
 */
export const getPriorityColor = (priority?: string | null): string => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
