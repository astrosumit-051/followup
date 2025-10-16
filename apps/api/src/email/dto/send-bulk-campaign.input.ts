import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { IsArray, IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID, ArrayMaxSize, ArrayMinSize } from 'class-validator';

/**
 * Input for Sending Bulk Email Campaign via Gmail
 *
 * Sends personalized emails to multiple contacts (max 100) with rate limiting.
 * Supports placeholders {{firstName}} and {{company}} for personalization.
 * Queues emails for rate-limited sending (10 emails/min) via BullMQ.
 */
@InputType()
export class SendBulkCampaignInput {
  @Field(() => [String], { description: 'Array of contact IDs to send emails to (min 1, max 100)' })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least 1 contact is required for bulk sending' })
  @ArrayMaxSize(100, { message: 'Maximum 100 contacts allowed per bulk campaign' })
  @IsUUID(undefined, { each: true })
  contactIds!: string[];

  @Field(() => String, { description: 'Email subject line (supports {{firstName}}, {{company}} placeholders)' })
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  subject!: string;

  @Field(() => GraphQLJSON, { description: 'TipTap document JSON for rich text body (supports placeholders)' })
  @IsNotEmpty()
  bodyJson!: Record<string, any>;

  @Field(() => String, { description: 'Pre-rendered HTML body template (supports placeholders)' })
  @IsString()
  @MaxLength(50000)
  @IsNotEmpty()
  bodyHtml!: string;

  @Field(() => [GraphQLJSON], { nullable: true, description: 'Array of shared attachment metadata (same for all recipients)' })
  @IsOptional()
  attachments?: Array<Record<string, any>>;

  @Field(() => String, { nullable: true, description: 'ID of the email signature to append (optional)' })
  @IsOptional()
  @IsString()
  @IsUUID()
  signatureId?: string;
}
