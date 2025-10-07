interface ContactListEmptyProps {
  /**
   * Optional custom message to display
   */
  message?: string;

  /**
   * Optional action button text
   */
  actionText?: string;

  /**
   * Optional action button click handler
   */
  onAction?: () => void;
}

/**
 * ContactListEmpty Component
 *
 * Empty state component displayed when no contacts are found.
 * Shows a helpful message and optional action button.
 *
 * Features:
 * - Empty state icon (user group illustration)
 * - Customizable message
 * - Optional action button (e.g., "Create Contact")
 * - Responsive design
 * - Helpful context for new users
 *
 * @example
 * ```tsx
 * // Default empty state
 * <ContactListEmpty />
 *
 * // With custom message and action
 * <ContactListEmpty
 *   message="No contacts match your search"
 *   actionText="Clear Filters"
 *   onAction={() => clearFilters()}
 * />
 *
 * // New user onboarding
 * <ContactListEmpty
 *   message="Welcome! Start building your professional network"
 *   actionText="Add Your First Contact"
 *   onAction={() => router.push('/contacts/new')}
 * />
 * ```
 */
export function ContactListEmpty({
  message = "No contacts found",
  actionText,
  onAction,
}: ContactListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Empty State Icon */}
      <div className="mb-4">
        <svg
          className="w-24 h-24 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>

      {/* Message */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message}
      </h3>

      {/* Helpful Context */}
      <p className="text-sm text-gray-600 max-w-sm mb-6">
        {actionText
          ? "Get started by adding your first contact to build your professional network."
          : "Try adjusting your search or filter criteria to find contacts."}
      </p>

      {/* Action Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:ring-offset-2 transition-colors duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
