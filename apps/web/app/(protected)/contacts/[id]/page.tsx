"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useContact, useDeleteContact } from "@/lib/hooks/useContacts";
import { ContactDeleteDialog } from "@/components/contacts/ContactDeleteDialog";
import { ContactLoadingSkeleton } from "@/components/contacts/ContactLoadingSkeleton";
import { ContactErrorState } from "@/components/contacts/ContactErrorState";
import {
  formatDate,
  formatDateTime,
  formatPriority,
  formatGender,
  getPriorityColor,
} from "@/lib/utils/contact-formatters";

/**
 * Contact Detail Page
 *
 * Displays comprehensive view of a single contact with all fields.
 * Features:
 * - Full contact information display
 * - Edit button to navigate to edit page
 * - Delete button with confirmation dialog
 * - Loading and error states
 * - Success toast on deletion
 * - Automatic redirect after deletion
 * - Formatted display for dates, priorities, gender
 * - Responsive layout
 *
 * @example
 * Navigate to /contacts/[id] to view contact details
 */
export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: contact, isLoading, error } = useContact(id);
  const deleteContactMutation = useDeleteContact();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Update document title when contact loads
  useEffect(() => {
    if (contact) {
      document.title = "Contact Details - RelationHub";
    }
  }, [contact]);

  const handleDelete = async () => {
    try {
      await deleteContactMutation.mutateAsync(id);

      // Show success toast
      toast.success("Contact deleted successfully!", {
        description: `${contact?.name || "Contact"} has been removed from your contacts.`,
      });

      // Redirect to contacts list
      router.push("/contacts");
    } catch (error) {
      // Show error toast
      toast.error("Failed to delete contact", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });

      // Close dialog even on error
      setIsDeleteDialogOpen(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <ContactLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <ContactErrorState error={error} />;
  }

  // Not found state
  if (!contact) {
    return (
      <div
        className="min-h-screen bg-gray-50 py-8 px-4
                      sm:px-6
                      lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-white shadow-sm rounded-lg p-6
                          sm:p-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Contact Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                The contact you&apos;re looking for doesn&apos;t exist or has
                been deleted.
              </p>
              <button
                onClick={() => router.push("/contacts")}
                aria-label="Return to contacts list"
                className="px-6 py-3 bg-blue-600 text-white rounded-md
                           hover:bg-blue-700 focus:outline-none
                           focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                           sm:px-4 sm:py-2"
              >
                Back to Contacts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4
                    sm:px-6
                    lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          className="mb-6 flex flex-col space-y-4
                        sm:flex-row sm:justify-between sm:items-start sm:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
            <p className="mt-1 text-sm text-gray-500">Contact Details</p>
          </div>

          <div className="flex space-x-3">
            {/* Edit Button */}
            <button
              onClick={() => router.push(`/contacts/${id}/edit`)}
              aria-label={`Edit ${contact.name}&apos;s contact information`}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium
                         text-gray-700 bg-white hover:bg-gray-50 focus:outline-none
                         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                         sm:flex-none sm:py-2"
              data-testid="contact-detail-edit-button"
            >
              Edit
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label={`Delete ${contact.name} from contacts`}
              className="flex-1 px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium
                         text-white bg-red-600 hover:bg-red-700 focus:outline-none
                         focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                         sm:flex-none sm:py-2"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div
            className="px-6 py-8
                          sm:px-8"
          >
            {/* Priority Badge */}
            {contact.priority && (
              <div className="mb-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(contact.priority)}`}
                >
                  {formatPriority(contact.priority)} Priority
                </span>
              </div>
            )}

            {/* Contact Details Grid */}
            <dl
              className="grid grid-cols-1 gap-x-6 gap-y-6
                           sm:grid-cols-2"
            >
              {/* Email */}
              {contact.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </dd>
                </div>
              )}

              {/* Phone */}
              {contact.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </dd>
                </div>
              )}

              {/* LinkedIn */}
              {contact.linkedInUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    LinkedIn Profile
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a
                      href={contact.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      View Profile →
                    </a>
                  </dd>
                </div>
              )}

              {/* Company */}
              {contact.company && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contact.company}
                  </dd>
                </div>
              )}

              {/* Industry */}
              {contact.industry && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Industry
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contact.industry}
                  </dd>
                </div>
              )}

              {/* Role */}
              {contact.role && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">{contact.role}</dd>
                </div>
              )}

              {/* Gender */}
              {contact.gender && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatGender(contact.gender)}
                  </dd>
                </div>
              )}

              {/* Birthday */}
              {contact.birthday && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Birthday
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(contact.birthday)}
                  </dd>
                </div>
              )}

              {/* Last Contacted */}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Last Contacted
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDateTime(contact.lastContactedAt)}
                </dd>
              </div>

              {/* Created At */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Added</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDateTime(contact.createdAt)}
                </dd>
              </div>

              {/* Updated At */}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDateTime(contact.updatedAt)}
                </dd>
              </div>
            </dl>

            {/* Notes Section (Full Width) */}
            {contact.notes && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-500 mb-2">
                  Notes
                </dt>
                <dd className="text-sm text-gray-900 whitespace-pre-wrap">
                  {contact.notes}
                </dd>
              </div>
            )}

            {/* Profile Picture (if available) */}
            {contact.profilePicture && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-500 mb-2">
                  Profile Picture
                </dt>
                <dd className="mt-1">
                  <img
                    src={contact.profilePicture}
                    alt={`${contact.name}&apos;s profile`}
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                  />
                </dd>
              </div>
            )}
          </div>
        </div>

        {/* Back to Contacts Button */}
        <div className="mt-6">
          <button
            onClick={() => router.push("/contacts")}
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            ← Back to Contacts
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ContactDeleteDialog
        isOpen={isDeleteDialogOpen}
        contactName={contact.name}
        isDeleting={deleteContactMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
