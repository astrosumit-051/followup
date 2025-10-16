import { ObjectType, Field } from '@nestjs/graphql';

/**
 * GmailConnection Entity
 *
 * Represents the Gmail OAuth connection status for a user.
 * SECURITY: Tokens are NEVER exposed through GraphQL - only connection metadata.
 *
 * @example
 * ```graphql
 * query CheckGmailConnection {
 *   gmailConnection {
 *     isConnected
 *     email
 *     scopes
 *     connectedAt
 *     expiresAt
 *   }
 * }
 * ```
 */
@ObjectType({ description: 'Gmail OAuth connection status for a user. Tokens are never exposed for security.' })
export class GmailConnection {
  @Field(() => Boolean, { description: 'Whether user has an active Gmail connection with valid tokens' })
  isConnected!: boolean;

  @Field(() => String, { nullable: true, description: 'Connected Gmail email address (null if not connected)' })
  email?: string | null;

  @Field(() => [String], { description: 'OAuth scopes granted (e.g., ["gmail.send", "gmail.readonly"])' })
  scopes!: string[];

  @Field(() => Date, { nullable: true, description: 'Timestamp when Gmail was connected (null if not connected)' })
  connectedAt?: Date | null;

  @Field(() => Date, { nullable: true, description: 'Timestamp when access token expires (null if not connected)' })
  expiresAt?: Date | null;
}
