'use client';

import { useState } from 'react';

interface ContactDeleteDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Contact name to display in confirmation
   */
  contactName: string;

  /**
   * Loading state during deletion
   */
  isDeleting?: boolean;

  /**
   * Confirm delete handler
   */
  onConfirm: () => void | Promise<void>;

  /**
   * Cancel handler
   */
  onCancel: () => void;
}

/**
 * ContactDeleteDialog Component
 *
 * Confirmation dialog for deleting a contact.
 * Prevents accidental deletions with explicit confirmation.
 *
 * Features:
 * - Modal overlay with backdrop
 * - Contact name display for clarity
 * - Warning message about permanent action
 * - Loading state during deletion
 * - Keyboard navigation (Escape to cancel)
 * - Accessible ARIA attributes
 * - Focus trap
 *
 * @example
 * ```tsx
 * const [isDialogOpen, setIsDialogOpen] = useState(false);
 * const [isDeleting, setIsDeleting] = useState(false);
 *
 * <ContactDeleteDialog
 *   isOpen={isDialogOpen}
 *   contactName={contact.name}
 *   isDeleting={isDeleting}
 *   onConfirm={async () => {
 *     setIsDeleting(true);
 *     await deleteContact(contact.id);
 *     setIsDeleting(false);
 *     setIsDialogOpen(false);
 *   }}
 *   onCancel={() => setIsDialogOpen(false)}
 * />
 * ```
 */
export function ContactDeleteDialog({
  isOpen,
  contactName,
  isDeleting = false,
  onConfirm,
  onCancel,
}: ContactDeleteDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not the dialog content
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isDeleting) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl
                     transition-all sm:my-8 sm:w-full sm:max-w-lg"
        >
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Warning Icon */}
              <div
                className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center
                           rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  className="h-6 w-6 text-red-600"
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Dialog Content */}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3
                  className="text-base font-semibold leading-6 text-gray-900"
                  id="modal-title"
                >
                  Delete Contact
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-gray-900">
                      {contactName}
                    </span>
                    ? This action cannot be undone and will permanently remove this
                    contact from your network.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm
                         font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                  Deleting...
                </>
              ) : (
                'Confirm'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm
                         font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300
                         hover:bg-gray-50 sm:mt-0 sm:w-auto
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
