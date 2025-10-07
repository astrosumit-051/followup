import { registerEnumType } from '@nestjs/graphql';

/**
 * Contact Sort Field Enum
 *
 * Defines valid fields for sorting contacts in queries.
 * This enum prevents SQL injection by restricting sort fields to a whitelist.
 *
 * Security:
 * - Prevents SQL injection through sortBy parameter
 * - Only allows sorting on indexed and safe fields
 * - GraphQL validates enum values at schema level
 *
 * Performance:
 * - All sortable fields have database indexes for optimal query performance
 *
 * Usage:
 * ```graphql
 * query {
 *   contacts(sortBy: CREATED_AT, sortOrder: "desc") {
 *     nodes { id name }
 *   }
 * }
 * ```
 */
export enum ContactSortField {
  /** Sort by contact creation date (default) */
  CREATED_AT = 'createdAt',

  /** Sort by contact name (alphabetically) */
  NAME = 'name',

  /** Sort by contact priority (HIGH → MEDIUM → LOW) */
  PRIORITY = 'priority',

  /** Sort by last contact date (most recent first) */
  LAST_CONTACTED_AT = 'lastContactedAt',

  /** Sort by company name (alphabetically) */
  COMPANY = 'company',

  /** Sort by industry (alphabetically) */
  INDUSTRY = 'industry',
}

// Register enum for GraphQL schema generation
registerEnumType(ContactSortField, {
  name: 'ContactSortField',
  description: 'Fields available for sorting contacts',
});
