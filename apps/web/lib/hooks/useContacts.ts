import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getContact,
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type ContactConnection,
  type GetContactsVariables,
  type CreateContactInput,
  type UpdateContactInput,
  type ContactFilterInput,
  type ContactSortField,
  type SortOrder,
} from '@/lib/graphql/contacts';

/**
 * TanStack Query Hooks for Contact CRUD Operations
 *
 * This module provides React hooks for interacting with the Contact API
 * using TanStack Query (React Query) for data fetching, caching, and state management.
 *
 * Query Hooks:
 * - useContact: Fetch single contact by ID
 * - useContacts: Fetch paginated list of contacts
 *
 * Mutation Hooks:
 * - useCreateContact: Create new contact
 * - useUpdateContact: Update existing contact
 * - useDeleteContact: Delete contact
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
 * Query key factory for contacts
 * Ensures consistent cache keys across the application
 */
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters?: GetContactsVariables) =>
    [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch a single contact by ID
 *
 * @param id - Contact ID
 * @param options - TanStack Query options
 * @returns Query result with contact data, loading state, and error
 *
 * @example
 * ```tsx
 * function ContactDetail({ id }: { id: string }) {
 *   const { data: contact, isLoading, error } = useContact(id);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!contact) return <div>Contact not found</div>;
 *
 *   return <div>{contact.name}</div>;
 * }
 * ```
 */
export function useContact(
  id: string,
  options?: Omit<
    UseQueryOptions<Contact | null, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Contact | null, Error>({
    queryKey: contactKeys.detail(id),
    queryFn: () => getContact(id),
    enabled: !!id, // Only run query if ID is provided
    ...options,
  });
}

/**
 * Variables for useContacts infinite query hook
 * This interface matches what the contacts page passes
 */
export interface UseContactsVariables {
  search?: string;
  filter?: ContactFilterInput;
  sortBy?: ContactSortField;
  sortOrder?: SortOrder;
  first?: number;
}

/**
 * Hook to fetch paginated list of contacts with filtering and sorting
 * Uses infinite query for cursor-based pagination
 *
 * @param variables - Query variables for filtering, pagination, and sorting
 * @param options - TanStack Query infinite query options
 * @returns Infinite query result with contact pages, loading state, and pagination functions
 *
 * @example
 * ```tsx
 * function ContactList() {
 *   const {
 *     data,
 *     isLoading,
 *     error,
 *     hasNextPage,
 *     fetchNextPage,
 *   } = useContacts({
 *     search: 'john',
 *     filter: { priority: 'HIGH' },
 *     sortBy: 'NAME',
 *     first: 12,
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   const contacts = data?.pages.flatMap(page => page.edges.map(edge => edge.node)) ?? [];
 *
 *   return (
 *     <div>
 *       {contacts.map(contact => (
 *         <ContactCard key={contact.id} contact={contact} />
 *       ))}
 *       {hasNextPage && (
 *         <button onClick={() => fetchNextPage()}>Load More</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useContacts(
  variables?: UseContactsVariables,
  options?: Omit<
    UseInfiniteQueryOptions<ContactConnection, Error>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) {
  return useInfiniteQuery<ContactConnection, Error>({
    queryKey: contactKeys.list(variables),
    queryFn: ({ pageParam }) => {
      // Transform the variables to match GraphQL schema
      const graphqlVariables: GetContactsVariables = {
        filters: variables?.filter,
        pagination: {
          limit: variables?.first || 12,
          cursor: pageParam as string | undefined,
        },
        sortBy: variables?.sortBy,
        sortOrder: variables?.sortOrder || 'asc', // Use provided sortOrder or default to 'asc'
      };

      // Add search to filters if provided
      if (variables?.search) {
        graphqlVariables.filters = {
          ...graphqlVariables.filters,
          search: variables.search,
        };
      }

      return getContacts(graphqlVariables);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // Return the endCursor if there's a next page, undefined otherwise
      return lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined;
    },
    ...options,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new contact
 *
 * Features:
 * - Optimistic update to contact list
 * - Automatic cache invalidation on success
 * - Error handling with rollback
 *
 * @param options - TanStack Query mutation options
 * @returns Mutation result with mutate function, loading state, and error
 *
 * @example
 * ```tsx
 * function CreateContactForm() {
 *   const createContact = useCreateContact();
 *
 *   const handleSubmit = async (data: CreateContactInput) => {
 *     try {
 *       const newContact = await createContact.mutateAsync(data);
 *       console.log('Created:', newContact);
 *     } catch (error) {
 *       console.error('Failed to create contact:', error);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       // form fields here
 *       <button disabled={createContact.isPending}>Create</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateContact(
  options?: UseMutationOptions<Contact, Error, CreateContactInput>
) {
  const queryClient = useQueryClient();

  return useMutation<Contact, Error, CreateContactInput>({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: (newContact) => {
      // Invalidate and refetch contact lists to include new contact
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });

      // Add new contact to cache for detail view
      queryClient.setQueryData(contactKeys.detail(newContact.id), newContact);
    },
    ...options,
  });
}

/**
 * Hook to update an existing contact
 *
 * Features:
 * - Optimistic update to contact detail and list
 * - Automatic cache invalidation on success
 * - Error handling with rollback
 *
 * @param options - TanStack Query mutation options
 * @returns Mutation result with mutate function, loading state, and error
 *
 * @example
 * ```tsx
 * function EditContactForm({ contactId }: { contactId: string }) {
 *   const updateContact = useUpdateContact();
 *
 *   const handleSubmit = async (data: UpdateContactInput) => {
 *     try {
 *       const updated = await updateContact.mutateAsync({
 *         id: contactId,
 *         input: data
 *       });
 *       console.log('Updated:', updated);
 *     } catch (error) {
 *       console.error('Failed to update:', error);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       // form fields here
 *       <button disabled={updateContact.isPending}>Save</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateContact(
  options?: UseMutationOptions<
    Contact,
    Error,
    { id: string; input: UpdateContactInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Contact, Error, { id: string; input: UpdateContactInput }>({
    mutationFn: ({ id, input }) => updateContact(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: contactKeys.detail(id) });

      // Snapshot previous value for rollback
      const previousContact = queryClient.getQueryData<Contact>(
        contactKeys.detail(id)
      );

      // Optimistically update contact detail
      if (previousContact) {
        queryClient.setQueryData<Contact>(contactKeys.detail(id), {
          ...previousContact,
          ...input,
        });
      }

      // Return context with snapshot for rollback
      return { previousContact };
    },
    onError: (error, { id }, context) => {
      // Rollback to previous value on error
      if (context?.previousContact) {
        queryClient.setQueryData(contactKeys.detail(id), context.previousContact);
      }
    },
    onSuccess: (updatedContact, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(contactKeys.detail(id), updatedContact);

      // Invalidate lists to reflect updated contact
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a contact
 *
 * Features:
 * - Optimistic removal from contact list
 * - Automatic cache invalidation on success
 * - Error handling with rollback
 *
 * @param options - TanStack Query mutation options
 * @returns Mutation result with mutate function, loading state, and error
 *
 * @example
 * ```tsx
 * function DeleteContactButton({ contactId }: { contactId: string }) {
 *   const deleteContact = useDeleteContact();
 *
 *   const handleDelete = async () => {
 *     if (!confirm('Delete this contact?')) return;
 *
 *     try {
 *       await deleteContact.mutateAsync(contactId);
 *       console.log('Contact deleted');
 *     } catch (error) {
 *       console.error('Failed to delete:', error);
 *     }
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleDelete}
 *       disabled={deleteContact.isPending}
 *     >
 *       Delete
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteContact(
  options?: UseMutationOptions<boolean, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: (_, deletedId) => {
      // Remove contact from detail cache
      queryClient.removeQueries({ queryKey: contactKeys.detail(deletedId) });

      // Invalidate and refetch contact lists to remove deleted contact
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
    ...options,
  });
}
