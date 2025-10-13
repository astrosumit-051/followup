"use client";

import { useRouter } from "next/navigation";

/**
 * Contact Error State Component
 *
 * Displays a user-friendly error message when contact data fails to load.
 * Provides a recovery option to navigate back to the contacts list.
 *
 * Features:
 * - Clear error message display
 * - Fallback for unknown errors
 * - Navigation back to safety (contacts list)
 * - Accessible error state
 *
 * @param error - Error object or unknown error
 *
 * @example
 * if (error) return <ContactErrorState error={error} />;
 */
export const ContactErrorState = ({ error }: { error: Error | unknown }) => {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4
                 sm:px-6
                 lg:px-8"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="bg-white shadow-sm rounded-lg p-6
                     sm:p-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Contact
            </h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
            <button
              onClick={() => router.push("/contacts")}
              aria-label="Return to contacts list"
              className="px-4 py-2 bg-blue-600 text-white rounded-md
                         hover:bg-blue-700 focus:outline-none
                         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
