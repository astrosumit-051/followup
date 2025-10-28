"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useCreateContact } from "@/lib/hooks/useContacts";
import type {
  CreateContactInput,
  UpdateContactInput,
} from "@/lib/validations/contact";

/**
 * Create Contact Page
 *
 * Provides a form interface for creating new contacts.
 * Features:
 * - Full contact form with all fields
 * - Client-side validation with Zod
 * - Optimistic UI updates
 * - Success toast notification
 * - Automatic redirect to contact detail page
 * - Error handling with field-level error display
 * - Loading state with disabled submit button
 *
 * @example
 * Navigate to /contacts/new to create a new contact
 */
export default function CreateContactPage() {
  const router = useRouter();
  const createContact = useCreateContact();

  const handleSubmit = async (
    data: CreateContactInput | UpdateContactInput,
  ) => {
    try {
      // Create the contact (type assertion safe since we're in create mode)
      const result = await createContact.mutateAsync(data as CreateContactInput);

      // Show success toast
      toast.success("Contact created successfully!", {
        description: `${data.name} has been added to your contacts.`,
        duration: 5000, // 5 seconds for better UX and E2E test reliability
      });

      // Redirect to contact detail page
      router.push(`/contacts/${result.id}`);
    } catch (error) {
      // Show error toast
      toast.error("Failed to create contact", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        duration: 5000, // 5 seconds for better UX and E2E test reliability
      });
    }
  };

  const handleCancel = () => {
    router.push("/contacts");
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4
                    sm:px-6
                    lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Contact</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new contact to your professional network
          </p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white shadow-sm rounded-lg p-6
                        sm:p-8"
        >
          <ContactForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createContact.isPending}
            aria-label="Create new contact form"
          />
        </div>
      </div>
    </div>
  );
}
