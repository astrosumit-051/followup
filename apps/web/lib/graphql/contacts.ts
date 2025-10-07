import { graphqlRequest, graphqlMutation } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateContactInput,
  UpdateContactInput,
  ContactFilterInput,
  ContactPaginationInput,
} from '@/lib/validations/contact';

/**
 * Contact GraphQL Queries and Mutations
 *
 * This module provides GraphQL operations for Contact CRUD functionality.
 * All operations are strongly typed and authenticated via Supabase JWT.
 *
 * Query Operations:
 * - getContact: Fetch single contact by ID
 * - getContacts: Fetch paginated list of contacts with filtering and sorting
 *
 * Mutation Operations:
 * - createContact: Create new contact
 * - updateContact: Update existing contact
 * - deleteContact: Delete contact by ID
 */

/**
 * GraphQL fragment for Contact fields
 * Reused across all contact queries to ensure consistency
 */
const CONTACT_FIELDS = `
  id
  name
  email
  phone
  linkedInUrl
  company
  industry
  role
  priority
  gender
  birthday
  profilePicture
  notes
  lastContactedAt
  createdAt
  updatedAt
`;

/**
 * GraphQL fragment for PageInfo fields
 * Used in paginated contact queries
 */
const PAGE_INFO_FIELDS = `
  hasNextPage
  hasPreviousPage
  startCursor
  endCursor
`;

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Query to fetch a single contact by ID
 */
const GET_CONTACT_QUERY = `
  query GetContact($id: ID!) {
    contact(id: $id) {
      ${CONTACT_FIELDS}
    }
  }
`;

/**
 * Query to fetch paginated list of contacts with filtering and sorting
 */
const GET_CONTACTS_QUERY = `
  query GetContacts(
    $filters: ContactFilterInput
    $pagination: ContactPaginationInput
    $sortBy: ContactSortField
    $sortOrder: String
  ) {
    contacts(
      filters: $filters
      pagination: $pagination
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      nodes {
        ${CONTACT_FIELDS}
      }
      edges {
        cursor
        node {
          id
        }
      }
      pageInfo {
        ${PAGE_INFO_FIELDS}
      }
      totalCount
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mutation to create a new contact
 */
const CREATE_CONTACT_MUTATION = `
  mutation CreateContact($input: CreateContactDto!) {
    createContact(input: $input) {
      ${CONTACT_FIELDS}
    }
  }
`;

/**
 * Mutation to update an existing contact
 */
const UPDATE_CONTACT_MUTATION = `
  mutation UpdateContact($id: ID!, $input: UpdateContactDto!) {
    updateContact(id: $id, input: $input) {
      ${CONTACT_FIELDS}
    }
  }
`;

/**
 * Mutation to delete a contact
 */
const DELETE_CONTACT_MUTATION = `
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id)
  }
`;

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

/**
 * Contact entity type matching GraphQL schema
 */
export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  linkedInUrl?: string | null;
  company?: string | null;
  industry?: string | null;
  role?: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
  birthday?: string | null; // ISO 8601 date string
  profilePicture?: string | null;
  notes?: string | null;
  lastContactedAt?: string | null; // ISO 8601 datetime string
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

/**
 * Contact edge for pagination
 */
export interface ContactEdge {
  cursor: string;
  node: {
    id: string;
  };
}

/**
 * Page info for cursor-based pagination
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

/**
 * Contact connection for paginated results
 */
export interface ContactConnection {
  nodes: Contact[];
  edges: ContactEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

/**
 * Sort field options for contacts query
 */
export type ContactSortField =
  | 'NAME'
  | 'CREATED_AT'
  | 'LAST_CONTACTED_AT'
  | 'PRIORITY'
  | 'COMPANY'
  | 'INDUSTRY';

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Variables for getContact query
 */
export interface GetContactVariables {
  id: string;
}

/**
 * Response type for getContact query
 */
export interface GetContactResponse {
  contact: Contact | null;
}

/**
 * Variables for getContacts query
 */
export interface GetContactsVariables {
  filters?: ContactFilterInput;
  pagination?: ContactPaginationInput;
  sortBy?: ContactSortField;
  sortOrder?: SortOrder;
}

/**
 * Response type for getContacts query
 */
export interface GetContactsResponse {
  contacts: ContactConnection;
}

/**
 * Variables for createContact mutation
 */
export interface CreateContactVariables {
  input: CreateContactInput;
}

/**
 * Response type for createContact mutation
 */
export interface CreateContactResponse {
  createContact: Contact;
}

/**
 * Variables for updateContact mutation
 */
export interface UpdateContactVariables {
  id: string;
  input: UpdateContactInput;
}

/**
 * Response type for updateContact mutation
 */
export interface UpdateContactResponse {
  updateContact: Contact;
}

/**
 * Variables for deleteContact mutation
 */
export interface DeleteContactVariables {
  id: string;
}

/**
 * Response type for deleteContact mutation
 */
export interface DeleteContactResponse {
  deleteContact: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch a single contact by ID
 *
 * @param id - Contact ID
 * @param supabaseClient - Optional Supabase client for dependency injection (testing)
 * @returns Promise resolving to Contact or null if not found
 * @throws Error if request fails or user lacks authorization
 */
export async function getContact(id: string, supabaseClient?: SupabaseClient): Promise<Contact | null> {
  const data = await graphqlRequest<GetContactResponse>(GET_CONTACT_QUERY, { id }, supabaseClient);
  return data.contact;
}

/**
 * Fetch paginated list of contacts with optional filtering and sorting
 *
 * @param variables - Query variables for filtering, pagination, and sorting
 * @param supabaseClient - Optional Supabase client for dependency injection (testing)
 * @returns Promise resolving to ContactConnection
 * @throws Error if request fails
 */
export async function getContacts(
  variables?: GetContactsVariables,
  supabaseClient?: SupabaseClient
): Promise<ContactConnection> {
  const data = await graphqlRequest<GetContactsResponse>(GET_CONTACTS_QUERY, variables, supabaseClient);
  return data.contacts;
}

/**
 * Create a new contact
 *
 * @param input - Contact creation data
 * @param supabaseClient - Optional Supabase client for dependency injection (testing)
 * @returns Promise resolving to created Contact
 * @throws Error if validation fails or request fails
 */
export async function createContact(input: CreateContactInput, supabaseClient?: SupabaseClient): Promise<Contact> {
  const data = await graphqlMutation<CreateContactResponse>(CREATE_CONTACT_MUTATION, {
    input,
  }, supabaseClient);
  return data.createContact;
}

/**
 * Update an existing contact
 *
 * @param id - Contact ID
 * @param input - Partial contact update data
 * @param supabaseClient - Optional Supabase client for dependency injection (testing)
 * @returns Promise resolving to updated Contact
 * @throws Error if contact not found, validation fails, or user lacks authorization
 */
export async function updateContact(
  id: string,
  input: UpdateContactInput,
  supabaseClient?: SupabaseClient
): Promise<Contact> {
  const data = await graphqlMutation<UpdateContactResponse>(UPDATE_CONTACT_MUTATION, {
    id,
    input,
  }, supabaseClient);
  return data.updateContact;
}

/**
 * Delete a contact
 *
 * @param id - Contact ID
 * @param supabaseClient - Optional Supabase client for dependency injection (testing)
 * @returns Promise resolving to true if deletion successful
 * @throws Error if contact not found or user lacks authorization
 */
export async function deleteContact(id: string, supabaseClient?: SupabaseClient): Promise<boolean> {
  const data = await graphqlMutation<DeleteContactResponse>(DELETE_CONTACT_MUTATION, {
    id,
  }, supabaseClient);
  return data.deleteContact;
}
