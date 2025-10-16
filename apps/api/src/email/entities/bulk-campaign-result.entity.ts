import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * BulkCampaignResult Entity
 *
 * Represents the result of a bulk email campaign send operation.
 * Provides status, progress tracking, and error information.
 *
 * @example
 * ```graphql
 * mutation SendCampaign {
 *   sendBulkCampaignViaGmail(input: { contactIds: [...], subject: "...", ... }) {
 *     campaignId
 *     totalEmails
 *     queuedCount
 *     estimatedCompletionTime
 *     rateLimit
 *   }
 * }
 * ```
 */
@ObjectType({ description: 'Result of bulk email campaign send operation with progress tracking.' })
export class BulkCampaignResult {
  @Field(() => String, { description: 'Unique identifier for this campaign (used to track progress)' })
  campaignId!: string;

  @Field(() => Int, { description: 'Total number of emails to be sent in this campaign' })
  totalEmails!: number;

  @Field(() => Int, { description: 'Number of emails successfully queued for sending' })
  queuedCount!: number;

  @Field(() => Date, { description: 'Estimated time when all emails will be sent (based on rate limit)' })
  estimatedCompletionTime!: Date;

  @Field(() => String, { description: 'Rate limit applied (e.g., "10 emails per minute")' })
  rateLimit!: string;

  @Field(() => [String], { nullable: true, description: 'Array of contact IDs that failed to queue (if any)' })
  failedContactIds?: string[];

  @Field(() => String, { nullable: true, description: 'Error message if campaign failed to start (null on success)' })
  error?: string | null;
}
