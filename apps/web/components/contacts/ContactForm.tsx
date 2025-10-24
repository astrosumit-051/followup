"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Contact } from "@/lib/graphql/contacts";
import {
  createContactSchema,
  updateContactSchema,
  type CreateContactInput,
  type UpdateContactInput,
} from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactFormProps {
  /**
   * Mode: 'create' for new contact, 'edit' for existing contact
   */
  mode: "create" | "edit";

  /**
   * Default values for edit mode
   */
  defaultValues?: Partial<Contact>;

  /**
   * Submit handler
   */
  onSubmit: (
    data: CreateContactInput | UpdateContactInput,
  ) => void | Promise<void>;

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
 * Uses react-hook-form with Zod validation and shadcn/ui components.
 *
 * Features:
 * - Full field validation with Zod schemas
 * - shadcn/ui form components for consistent styling
 * - Dark mode support via design tokens
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
  const schema = mode === "create" ? createContactSchema : updateContactSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      linkedInUrl: defaultValues?.linkedInUrl ?? "",
      company: defaultValues?.company ?? "",
      industry: defaultValues?.industry ?? "",
      role: defaultValues?.role ?? "",
      priority: defaultValues?.priority ?? "HIGH",
      gender: defaultValues?.gender ?? undefined,
      birthday: defaultValues?.birthday ? new Date(defaultValues.birthday) : undefined,
      profilePicture: defaultValues?.profilePicture ?? "",
      notes: defaultValues?.notes ?? "",
      lastContactedAt: defaultValues?.lastContactedAt ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name - Required */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                  value={field.value || ""}
                  data-testid="contact-form-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                  value={field.value || ""}
                  data-testid="contact-form-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="+1-234-567-8900"
                  disabled={isSubmitting}
                  value={field.value || ""}
                  data-testid="contact-form-phone"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LinkedIn URL */}
        <FormField
          control={form.control}
          name="linkedInUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://linkedin.com/in/johndoe"
                  disabled={isSubmitting}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Acme Corp"
                  disabled={isSubmitting}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Industry */}
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Technology"
                  disabled={isSubmitting}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Software Engineer"
                  disabled={isSubmitting}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Priority <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger data-testid="contact-form-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Not specified" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Birthday */}
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birthday</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  disabled={isSubmitting}
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().split("T")[0]
                      : field.value || ""
                  }
                  onChange={(e) => {
                    const dateStr = e.target.value;
                    field.onChange(dateStr ? new Date(dateStr) : undefined);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Profile Picture URL */}
        <FormField
          control={form.control}
          name="profilePicture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  disabled={isSubmitting}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Add any notes about this contact..."
                  disabled={isSubmitting}
                  value={field.value || ""}
                  data-testid="contact-form-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Contacted Date */}
        <FormField
          control={form.control}
          name="lastContactedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Contacted</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="datetime-local"
                  disabled={isSubmitting}
                  value={
                    field.value
                      ? new Date(field.value).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const dateStr = e.target.value;
                    // Convert datetime-local format to ISO 8601
                    field.onChange(dateStr ? new Date(dateStr).toISOString() : "");
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div
          className="flex flex-col-reverse space-y-3 space-y-reverse pt-4 border-t
                        sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3"
        >
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
            data-testid="contact-form-submit"
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create Contact"
                : "Update Contact"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
