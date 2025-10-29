import { graphqlRequest, graphqlMutation } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Email Template GraphQL Queries and Mutations
 *
 * This module provides GraphQL operations for Email Template CRUD functionality.
 * All operations are strongly typed and authenticated via Supabase JWT.
 *
 * Query Operations:
 * - getEmailTemplates: Fetch all email templates for current user
 *
 * Mutation Operations:
 * - createEmailTemplate: Save email as reusable template
 * - updateEmailTemplate: Update existing template
 * - deleteEmailTemplate: Delete template by ID
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  bodyHtml?: string | null;
  isDefault: boolean;
  category?: string | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateInput {
  name: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  isDefault?: boolean;
  category?: string;
}

export interface UpdateEmailTemplateInput {
  name?: string;
  subject?: string;
  body?: string;
  bodyHtml?: string;
  isDefault?: boolean;
  category?: string;
}

// ============================================================================
// GRAPHQL FRAGMENTS
// ============================================================================

/**
 * GraphQL fragment for EmailTemplate fields
 * Reused across all template queries to ensure consistency
 */
const EMAIL_TEMPLATE_FIELDS = `
  id
  name
  subject
  body
  bodyHtml
  isDefault
  category
  usageCount
  createdAt
  updatedAt
`;

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Query to fetch all email templates for current user
 */
const GET_EMAIL_TEMPLATES_QUERY = `
  query GetEmailTemplates {
    emailTemplates {
      ${EMAIL_TEMPLATE_FIELDS}
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mutation to create a new email template
 */
const CREATE_EMAIL_TEMPLATE_MUTATION = `
  mutation CreateEmailTemplate($input: CreateEmailTemplateInput!) {
    createEmailTemplate(input: $input) {
      ${EMAIL_TEMPLATE_FIELDS}
    }
  }
`;

/**
 * Mutation to update an existing email template
 */
const UPDATE_EMAIL_TEMPLATE_MUTATION = `
  mutation UpdateEmailTemplate($id: ID!, $input: UpdateEmailTemplateInput!) {
    updateEmailTemplate(id: $id, input: $input) {
      ${EMAIL_TEMPLATE_FIELDS}
    }
  }
`;

/**
 * Mutation to delete an email template
 */
const DELETE_EMAIL_TEMPLATE_MUTATION = `
  mutation DeleteEmailTemplate($id: ID!) {
    deleteEmailTemplate(id: $id)
  }
`;

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Fetch all email templates for current user
 *
 * @param supabase - Authenticated Supabase client
 * @returns Array of email templates
 * @throws Error if query fails or user is unauthorized
 *
 * @example
 * ```typescript
 * const templates = await getEmailTemplates(supabase);
 * console.log('Templates:', templates);
 * ```
 */
export async function getEmailTemplates(
  supabase: SupabaseClient
): Promise<EmailTemplate[]> {
  const response = await graphqlRequest<{ emailTemplates: EmailTemplate[] }>(
    GET_EMAIL_TEMPLATES_QUERY,
    undefined,
    supabase
  );

  return response.emailTemplates;
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Create a new email template
 *
 * @param supabase - Authenticated Supabase client
 * @param input - Template data (name, subject, body, category, etc.)
 * @returns Created email template
 * @throws Error if mutation fails or validation error
 *
 * @example
 * ```typescript
 * const template = await createEmailTemplate(supabase, {
 *   name: "Follow-up Template",
 *   subject: "Following up on {{topic}}",
 *   body: "Hi {{firstName}},\n\nJust wanted to follow up...",
 *   category: "follow-up",
 * });
 * ```
 */
export async function createEmailTemplate(
  supabase: SupabaseClient,
  input: CreateEmailTemplateInput
): Promise<EmailTemplate> {
  const response = await graphqlMutation<{ createEmailTemplate: EmailTemplate }>(
    CREATE_EMAIL_TEMPLATE_MUTATION,
    { input },
    supabase
  );

  return response.createEmailTemplate;
}

/**
 * Update an existing email template
 *
 * @param supabase - Authenticated Supabase client
 * @param id - Template ID to update
 * @param input - Updated template data (partial update)
 * @returns Updated email template
 * @throws Error if mutation fails, template not found, or unauthorized
 *
 * @example
 * ```typescript
 * const updatedTemplate = await updateEmailTemplate(supabase, "template-123", {
 *   name: "Updated Template Name",
 *   category: "introduction",
 * });
 * ```
 */
export async function updateEmailTemplate(
  supabase: SupabaseClient,
  id: string,
  input: UpdateEmailTemplateInput
): Promise<EmailTemplate> {
  const response = await graphqlMutation<{ updateEmailTemplate: EmailTemplate }>(
    UPDATE_EMAIL_TEMPLATE_MUTATION,
    { id, input },
    supabase
  );

  return response.updateEmailTemplate;
}

/**
 * Delete an email template
 *
 * @param supabase - Authenticated Supabase client
 * @param id - Template ID to delete
 * @returns True if deletion successful
 * @throws Error if mutation fails, template not found, or unauthorized
 *
 * @example
 * ```typescript
 * await deleteEmailTemplate(supabase, "template-123");
 * console.log('Template deleted successfully');
 * ```
 */
export async function deleteEmailTemplate(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const response = await graphqlMutation<{ deleteEmailTemplate: boolean }>(
    DELETE_EMAIL_TEMPLATE_MUTATION,
    { id },
    supabase
  );

  return response.deleteEmailTemplate;
}
