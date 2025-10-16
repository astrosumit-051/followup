import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { IsString, IsOptional, MaxLength, IsUUID } from 'class-validator';

/**
 * Input for Creating Email Draft
 *
 * Used to create a new email draft for a specific contact.
 * Minimal required fields - most content is added via auto-save updates.
 */
@InputType()
export class CreateDraftInput {
  @Field(() => String, { description: 'ID of the contact this draft is addressed to' })
  @IsString()
  @IsUUID()
  contactId!: string;

  @Field(() => String, { nullable: true, description: 'Email subject line (optional)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @Field(() => GraphQLJSON, { nullable: true, description: 'TipTap document JSON for rich text body (optional)' })
  @IsOptional()
  bodyJson?: Record<string, any>;

  @Field(() => String, { nullable: true, description: 'Pre-rendered HTML body (optional)' })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  bodyHtml?: string;

  @Field(() => [GraphQLJSON], { nullable: true, description: 'Array of attachment metadata (optional)' })
  @IsOptional()
  attachments?: Array<Record<string, any>>;

  @Field(() => String, { nullable: true, description: 'ID of the email signature to use (optional)' })
  @IsOptional()
  @IsString()
  @IsUUID()
  signatureId?: string;
}
