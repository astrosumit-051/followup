'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ContactForm } from '@/components/contacts/ContactForm';
import { useContact, useUpdateContact } from '@/lib/hooks/useContacts';
import type { UpdateContactInput } from '@/lib/validations/contact';

/**
 * Edit Contact Page
 *
 * Provides a form interface for editing existing contacts.
 * Features:
 * - Pre-filled form with existing contact data
 * - Client-side validation with Zod
 * - Optimistic UI updates
 * - Success toast notification
 * - Automatic redirect to contact detail page
 * - Error handling with field-level error display
 * - Loading state with disabled submit button
 * - Cancel button to navigate back without saving
 *
 * @example
 * Navigate to /contacts/[id]/edit to edit an existing contact
 */
export default function EditContactPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: contact, isLoading, error } = useContact(id);
  const updateContact = useUpdateContact();

  const handleSubmit = async (data: UpdateContactInput) => {
    try {
      // Update the contact
      await updateContact.mutateAsync({
        id,
        data,
      });

      // Show success toast
      toast.success('Contact updated successfully!', {
        description: `${data.name || contact?.name} has been updated.`,
      });

      // Redirect to contact detail page
      router.push(`/contacts/${id}`);
    } catch (error) {
      // Show error toast
      toast.error('Failed to update contact', {
        description:
          error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const handleCancel = () => {
    router.push(`/contacts/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4
                      sm:px-6
                      lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-6
                          sm:p-8">
            <div className="animate-pulse">
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
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4
                      sm:px-6
                      lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-6
                          sm:p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error Loading Contact
              </h2>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => router.push('/contacts')}
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
  }

  // Not found state
  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4
                      sm:px-6
                      lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-6
                          sm:p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Contact Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                The contact you're trying to edit doesn't exist or has been deleted.
              </p>
              <button
                onClick={() => router.push('/contacts')}
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
  }

  // Transform contact data to match form expectations
  const defaultValues = {
    name: contact.name,
    email: contact.email || undefined,
    phone: contact.phone || undefined,
    linkedInUrl: contact.linkedInUrl || undefined,
    company: contact.company || undefined,
    industry: contact.industry || undefined,
    role: contact.role || undefined,
    priority: contact.priority || 'HIGH',
    gender: contact.gender || undefined,
    birthday: contact.birthday || undefined,
    profilePicture: contact.profilePicture || undefined,
    notes: contact.notes || undefined,
    lastContactedAt: contact.lastContactedAt || undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4
                    sm:px-6
                    lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Contact</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update information for {contact.name}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg p-6
                        sm:p-8">
          <ContactForm
            mode="edit"
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateContact.isPending}
          />
        </div>
      </div>
    </div>
  );
}
