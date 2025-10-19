import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

/**
 * EmailDraft Entity
 *
 * Represents an auto-saved email draft with rich text content (TipTap JSON format).
 * One draft per user-contact pair. Supports attachments and signature selection.
 *
 * @example
 * ```graphql
 * query GetEmailDraft {
 *   emailDraft(contactId: "contact-id") {
 *     id
 *     subject
 *     bodyJson
 *     bodyHtml
 *     attachments
 *     signature {
 *       id
 *       name
 *     }
 *   }
 * }
 * ```
 */
@ObjectType({ description: 'An auto-saved email draft with rich text content stored in TipTap JSON format. One draft per user-contact pair.' })
export class EmailDraft {
  @Field(() => ID, { description: 'Unique identifier for this draft' })
  id!: string;

  @Field(() => ID, { description: 'ID of the user who owns this draft' })
  userId!: string;

  @Field(() => ID, { description: 'ID of the contact this draft is addressed to' })
  contactId!: string;

  @Field(() => String, { nullable: true, description: 'Email subject line (optional, can be empty)' })
  subject?: string | null;

  @Field(() => GraphQLJSON, { description: 'TipTap document JSON format for rich text editing' })
  bodyJson!: Record<string, any>;

  @Field(() => String, { nullable: true, description: 'Pre-rendered HTML for sending (optional)' })
  bodyHtml?: string | null;

  @Field(() => [GraphQLJSON], { description: 'Array of attachment metadata (S3 keys, filenames, sizes, content types)' })
  attachments!: Array<Record<string, any>>;

  @Field(() => ID, { nullable: true, description: 'ID of the email signature to use (optional)' })
  signatureId?: string | null;

  @Field(() => Date, { description: 'Timestamp when draft was created' })
  createdAt!: Date;

  @Field(() => Date, { description: 'Timestamp when draft was last modified' })
  updatedAt!: Date;

  @Field(() => Date, { nullable: true, description: 'Timestamp of last DB sync from localStorage (for conflict detection)' })
  lastSyncedAt?: Date | null;
}
