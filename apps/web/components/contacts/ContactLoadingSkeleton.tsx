/**
 * Contact Loading Skeleton Component
 *
 * Displays an animated loading skeleton while contact data is being fetched.
 * Provides visual feedback to users during data loading states.
 *
 * Features:
 * - Accessible loading state with screen reader support
 * - Animated pulse effect
 * - Responsive layout matching contact pages
 *
 * @example
 * if (isLoading) return <ContactLoadingSkeleton />;
 */
export const ContactLoadingSkeleton = () => {
  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4
                 sm:px-6
                 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="bg-white shadow-sm rounded-lg p-6
                     sm:p-8"
        >
          <div className="animate-pulse" role="status" aria-live="polite">
            <span className="sr-only">Loading contact information...</span>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
