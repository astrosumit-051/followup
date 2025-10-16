import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

/**
 * EmailSignature Entity
 *
 * Represents a reusable email signature with rich text formatting (TipTap JSON).
 * Users can have multiple signatures with context-based default selection.
 *
 * @example
 * ```graphql
 * query ListSignatures {
 *   emailSignatures {
 *     id
 *     name
 *     contentJson
 *     contentHtml
 *     isGlobalDefault
 *     isDefaultForFormal
 *     isDefaultForCasual
 *   }
 * }
 * ```
 */
@ObjectType({ description: 'A reusable email signature with rich text formatting. Users can have multiple signatures with context-based default selection.' })
export class EmailSignature {
  @Field(() => ID, { description: 'Unique identifier for this signature' })
  id!: string;

  @Field(() => ID, { description: 'ID of the user who owns this signature' })
  userId!: string;

  @Field(() => String, { description: 'User-friendly name for this signature (e.g., "Formal", "Casual", "Sales Pitch")' })
  name!: string;

  @Field(() => GraphQLJSON, { description: 'TipTap document JSON format for rich text editing' })
  contentJson!: Record<string, any>;

  @Field(() => String, { description: 'Pre-rendered HTML for email sending' })
  contentHtml!: string;

  @Field(() => Boolean, { description: 'Whether this signature is the default for formal emails' })
  isDefaultForFormal!: boolean;

  @Field(() => Boolean, { description: 'Whether this signature is the default for casual emails' })
  isDefaultForCasual!: boolean;

  @Field(() => Boolean, { description: 'Whether this signature is the global fallback default' })
  isGlobalDefault!: boolean;

  @Field(() => Date, { description: 'Timestamp when signature was created' })
  createdAt!: Date;

  @Field(() => Date, { description: 'Timestamp when signature was last modified' })
  updatedAt!: Date;

  @Field(() => Int, { description: 'Number of times this signature has been used (for analytics)' })
  usageCount!: number;
}
