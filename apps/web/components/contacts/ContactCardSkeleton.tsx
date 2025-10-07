/**
 * ContactCardSkeleton Component
 *
 * Loading skeleton for contact cards during data fetching.
 * Provides visual feedback while contacts are being loaded.
 *
 * Features:
 * - Matches ContactCard layout dimensions
 * - Animated shimmer effect
 * - Responsive grid-compatible sizing
 *
 * @example
 * ```tsx
 * {isLoading && (
 *   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
 *     {Array.from({ length: 12 }).map((_, i) => (
 *       <ContactCardSkeleton key={i} />
 *     ))}
 *   </div>
 * )}
 * ```
 */
export function ContactCardSkeleton() {
  return (
    <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        {/* Profile Picture Skeleton */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-300"></div>

          {/* Name and Company Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-300 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Priority Badge Skeleton */}
        <div className="px-2.5 py-0.5 rounded-full h-5 w-16 bg-gray-200"></div>
      </div>

      {/* Role Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>

      {/* Contact Information Skeleton */}
      <div className="space-y-1 mb-3">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </div>

      {/* Industry and Last Contacted Skeleton */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

/**
 * ContactListSkeleton Component
 *
 * Full page skeleton for the contact list grid.
 * Displays multiple ContactCardSkeleton components in a grid layout.
 *
 * @param count - Number of skeleton cards to display (default: 12)
 *
 * @example
 * ```tsx
 * {isLoading && <ContactListSkeleton count={12} />}
 * ```
 */
interface ContactListSkeletonProps {
  count?: number;
}

export function ContactListSkeleton({ count = 12 }: ContactListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ContactCardSkeleton key={i} />
      ))}
    </div>
  );
}
