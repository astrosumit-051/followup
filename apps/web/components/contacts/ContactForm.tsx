'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Contact } from '@/lib/graphql/contacts';
import {
  createContactSchema,
  updateContactSchema,
  type CreateContactInput,
  type UpdateContactInput,
} from '@/lib/validations/contact';

interface ContactFormProps {
  /**
   * Mode: 'create' for new contact, 'edit' for existing contact
   */
  mode: 'create' | 'edit';

  /**
   * Default values for edit mode
   */
  defaultValues?: Partial<Contact>;

  /**
   * Submit handler
   */
  onSubmit: (data: CreateContactInput | UpdateContactInput) => void | Promise<void>;

  /**
   * Cancel handler
   */
  onCancel?: () => void;

  /**
   * Loading state (during submission)
   */
  isSubmitting?: boolean;
}

/**
 * ContactForm Component
 *
 * Comprehensive form for creating and editing contacts.
 * Uses react-hook-form with Zod validation.
 *
 * Features:
 * - Full field validation with Zod schemas
 * - Client-side validation with error messages
 * - Loading/disabled state during submission
 * - Cancel button for edit mode
 * - All contact fields including optional ones
 * - Priority and gender dropdowns
 * - Date picker for birthday
 *
 * @example
 * ```tsx
 * // Create mode
 * <ContactForm
 *   mode="create"
 *   onSubmit={handleCreate}
 * />
 *
 * // Edit mode
 * <ContactForm
 *   mode="edit"
 *   defaultValues={existingContact}
 *   onSubmit={handleUpdate}
 *   onCancel={() => router.back()}
 * />
 * ```
 */
export function ContactForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ContactFormProps) {
  const schema = mode === 'create' ? createContactSchema : updateContactSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { priority: 'HIGH' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name - Required */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="John Doe"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="john@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="+1-234-567-8900"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* LinkedIn URL */}
      <div>
        <label htmlFor="linkedInUrl" className="block text-sm font-medium text-gray-700">
          LinkedIn Profile
        </label>
        <input
          {...register('linkedInUrl')}
          type="url"
          id="linkedInUrl"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="https://linkedin.com/in/johndoe"
          disabled={isSubmitting}
        />
        {errors.linkedInUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.linkedInUrl.message}</p>
        )}
      </div>

      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <input
          {...register('company')}
          type="text"
          id="company"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Acme Corp"
          disabled={isSubmitting}
        />
        {errors.company && (
          <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
        )}
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
          Industry
        </label>
        <input
          {...register('industry')}
          type="text"
          id="industry"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Technology"
          disabled={isSubmitting}
        />
        {errors.industry && (
          <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <input
          {...register('role')}
          type="text"
          id="role"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Software Engineer"
          disabled={isSubmitting}
        />
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority <span className="text-red-500">*</span>
        </label>
        <select
          {...register('priority')}
          id="priority"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        {errors.priority && (
          <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          {...register('gender')}
          id="gender"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          <option value="">Not specified</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
        )}
      </div>

      {/* Birthday */}
      <div>
        <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
          Birthday
        </label>
        <input
          {...register('birthday')}
          type="date"
          id="birthday"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        />
        {errors.birthday && (
          <p className="mt-1 text-sm text-red-600">{errors.birthday.message}</p>
        )}
      </div>

      {/* Profile Picture URL */}
      <div>
        <label
          htmlFor="profilePicture"
          className="block text-sm font-medium text-gray-700"
        >
          Profile Picture URL
        </label>
        <input
          {...register('profilePicture')}
          type="url"
          id="profilePicture"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="https://example.com/photo.jpg"
          disabled={isSubmitting}
        />
        {errors.profilePicture && (
          <p className="mt-1 text-sm text-red-600">{errors.profilePicture.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Add any notes about this contact..."
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Last Contacted Date */}
      <div>
        <label
          htmlFor="lastContactedAt"
          className="block text-sm font-medium text-gray-700"
        >
          Last Contacted
        </label>
        <input
          {...register('lastContactedAt')}
          type="datetime-local"
          id="lastContactedAt"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        />
        {errors.lastContactedAt && (
          <p className="mt-1 text-sm text-red-600">{errors.lastContactedAt.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse space-y-3 space-y-reverse pt-4 border-t border-gray-200
                      sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium
                       text-gray-700 bg-white hover:bg-gray-50 focus:outline-none
                       focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       sm:w-auto sm:py-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium
                     text-white bg-blue-600 hover:bg-blue-700 focus:outline-none
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     sm:w-auto sm:py-2"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Contact' : 'Update Contact'}
        </button>
      </div>
    </form>
  );
}
