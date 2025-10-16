import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { IsString, IsOptional, MaxLength, IsUUID, IsNotEmpty } from 'class-validator';

/**
 * Input for Sending Single Email via Gmail
 *
 * Can send from an existing draft or create and send in one operation.
 * All emails are sent via Gmail API using stored OAuth tokens.
 */
@InputType()
export class SendEmailInput {
  @Field(() => String, { nullable: true, description: 'ID of existing draft to send (if sending from saved draft)' })
  @IsOptional()
  @IsString()
  @IsUUID()
  draftId?: string;

  @Field(() => String, { description: 'ID of the contact to send email to (required)' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  contactId!: string;

  @Field(() => String, { description: 'Email subject line (required)' })
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  subject!: string;

  @Field(() => GraphQLJSON, { description: 'TipTap document JSON for rich text body (required)' })
  @IsNotEmpty()
  bodyJson!: Record<string, any>;

  @Field(() => String, { description: 'Pre-rendered HTML body for email sending (required)' })
  @IsString()
  @MaxLength(50000)
  @IsNotEmpty()
  bodyHtml!: string;

  @Field(() => [GraphQLJSON], { nullable: true, description: 'Array of attachment metadata (S3 keys, filenames, etc.)' })
  @IsOptional()
  attachments?: Array<Record<string, any>>;

  @Field(() => String, { nullable: true, description: 'ID of the email signature to append (optional)' })
  @IsOptional()
  @IsString()
  @IsUUID()
  signatureId?: string;
}
