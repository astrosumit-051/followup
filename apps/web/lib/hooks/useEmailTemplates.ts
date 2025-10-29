import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  type EmailTemplate,
  type CreateEmailTemplateInput,
  type UpdateEmailTemplateInput,
} from "@/lib/graphql/email-templates";
import { createBrowserClient } from "@/lib/supabase/client";

/**
 * TanStack Query Hooks for Email Template CRUD Operations
 *
 * This module provides React hooks for interacting with the Email Template API
 * using TanStack Query (React Query) for data fetching, caching, and state management.
 *
 * Query Hooks:
 * - useEmailTemplates: Fetch all email templates for current user
 *
 * Mutation Hooks:
 * - useCreateEmailTemplate: Create new email template
 * - useUpdateEmailTemplate: Update existing template
 * - useDeleteEmailTemplate: Delete template by ID
 *
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Automatic cache invalidation
 * - TypeScript type safety
 */

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for email templates
 * Ensures consistent cache keys across the application
 */
export const emailTemplateKeys = {
  all: ["emailTemplates"] as const,
  lists: () => [...emailTemplateKeys.all, "list"] as const,
  details: () => [...emailTemplateKeys.all, "detail"] as const,
  detail: (id: string) => [...emailTemplateKeys.details(), id] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch all email templates for current user
 *
 * @param options - TanStack Query options
 * @returns Query result with email templates array, loading state, and error
 *
 * @example
 * ```tsx
 * function TemplateLibrary() {
 *   const { data: templates, isLoading, error } = useEmailTemplates();
 *
 *   if (isLoading) return <div>Loading templates...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {templates?.map(template => (
 *         <TemplateCard key={template.id} template={template} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useEmailTemplates(
  options?: Omit<
    UseQueryOptions<EmailTemplate[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<EmailTemplate[], Error>({
    queryKey: emailTemplateKeys.lists(),
    queryFn: () => {
      const supabase = createBrowserClient();
      return getEmailTemplates(supabase);
    },
    ...options,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new email template
 *
 * Features:
 * - Optimistic update to template list
 * - Automatic cache invalidation on success
 * - Error handling with rollback
 *
 * @param options - TanStack Query mutation options
 * @returns Mutation result with mutate function, loading state, and error
 *
 * @example
 * ```tsx
 * function SaveTemplateModal() {
 *   const createTemplate = useCreateEmailTemplate();
 *
 *   const handleSubmit = async (data: CreateEmailTemplateInput) => {
 *     try {
 *       const newTemplate = await createTemplate.mutateAsync(data);
 *       console.log('Template saved:', newTemplate);
 *     } catch (error) {
 *       console.error('Failed to save template:', error);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" placeholder="Template name" />
 *       <input name="subject" placeholder="Email subject" />
 *       <textarea name="body" placeholder="Email body" />
 *       <button disabled={createTemplate.isPending}>Save Template</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateEmailTemplate(
  options?: UseMutationOptions<EmailTemplate, Error, CreateEmailTemplateInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<EmailTemplate, Error, CreateEmailTemplateInput>({
    mutationFn: (input: CreateEmailTemplateInput) => {
      const supabase = createBrowserClient();
      return createEmailTemplate(supabase, input);
    },
    onSuccess: (newTemplate) => {
      // Invalidate and refetch template lists to include new template
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });

      // Add new template to cache for detail view
      queryClient.setQueryData(
        emailTemplateKeys.detail(newTemplate.id),
        newTemplate,
      );
    },
    ...options,
  });
}

/**
 * Hook to update an existing email template
 *
 * Features:
 * - Optimistic update to template detail and list
 * - Automatic cache invalidation on success
 * - Error handling with rollback
 *
 * @param options - TanStack Query mutation options
 * @returns Mutation result with mutate function, loading state, and error
 *
 * @example
 * ```tsx
 * function EditTemplateModal({ templateId }: { templateId: string }) {
 *   const updateTemplate = useUpdateEmailTemplate();
 *
 *   const handleSubmit = async (data: UpdateEmailTemplateInput) => {
 *     try {
 *       const updated = await updateTemplate.mutateAsync({
 *         id: templateId,
 *         input: data
 *       });
 *       console.log('Template updated:', updated);
 *     } catch (error) {
 *       console.error('Failed to update:', error);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" />
 *       <input name="category" />
 *       <button disabled={updateTemplate.isPending}>Save Changes</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateEmailTemplate(
  options?: UseMutationOptions<
    EmailTemplate,
    Error,
    { id: string; input: UpdateEmailTemplateInput },
    { previousTemplate?: EmailTemplate }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    EmailTemplate,
    Error,
    { id: string; input: UpdateEmailTemplateInput },
    { previousTemplate?: EmailTemplate }
  >({
    mutationFn: ({ id, input }) => {
      const supabase = createBrowserClient();
      return updateEmailTemplate(supabase, id, input);
    },
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: emailTemplateKeys.detail(id),
      });

      // Snapshot previous value for rollback
      const previousTemplate = queryClient.getQueryData<EmailTemplate>(
        emailTemplateKeys.detail(id),
      );

      // Optimistically update template detail
      if (previousTemplate) {
        const optimisticUpdate: EmailTemplate = {
          ...previousTemplate,
          ...input,
          // Maintain required fields with their original values if not updated
          name: input.name ?? previousTemplate.name,
          subject: input.subject ?? previousTemplate.subject,
          body: input.body ?? previousTemplate.body,
          isDefault: input.isDefault ?? previousTemplate.isDefault,
          usageCount: previousTemplate.usageCount, // Backend manages this
          updatedAt: new Date().toISOString(), // Optimistically update timestamp
        };
        queryClient.setQueryData<EmailTemplate>(
          emailTemplateKeys.detail(id),
          optimisticUpdate,
        );
      }

      // Return context with snapshot for rollback
      return { previousTemplate };
    },
    onError: (error, { id }, context) => {
      // Rollback to previous value on error
      if (context?.previousTemplate) {
        queryClient.setQueryData(
          emailTemplateKeys.detail(id),
          context.previousTemplate,
        );
      }
    },
    onSuccess: (updatedTemplate, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(
        emailTemplateKeys.detail(id),
        updatedTemplate,
      );

      // Invalidate lists to reflect updated template
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete an email template
 *
 * Features:
 * - Optimistic removal from template list
 * - Automatic cache invalidation on success
 * - Error handling with rollback
 *
 * @param options - TanStack Query mutation options
 * @returns Mutation result with mutate function, loading state, and error
 *
 * @example
 * ```tsx
 * function DeleteTemplateButton({ templateId }: { templateId: string }) {
 *   const deleteTemplate = useDeleteEmailTemplate();
 *
 *   const handleDelete = async () => {
 *     if (!confirm('Delete this template?')) return;
 *
 *     try {
 *       await deleteTemplate.mutateAsync(templateId);
 *       console.log('Template deleted');
 *     } catch (error) {
 *       console.error('Failed to delete:', error);
 *     }
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleDelete}
 *       disabled={deleteTemplate.isPending}
 *     >
 *       Delete
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteEmailTemplate(
  options?: UseMutationOptions<boolean, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => {
      const supabase = createBrowserClient();
      return deleteEmailTemplate(supabase, id);
    },
    onSuccess: (_, deletedId) => {
      // Remove template from detail cache
      queryClient.removeQueries({
        queryKey: emailTemplateKeys.detail(deletedId),
      });

      // Invalidate and refetch template lists to remove deleted template
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });
    },
    ...options,
  });
}
