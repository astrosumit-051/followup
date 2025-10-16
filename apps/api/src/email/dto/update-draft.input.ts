import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { IsOptional, IsString, IsDate, MaxLength, IsUUID } from 'class-validator';

/**
 * Input for Updating Email Draft (Auto-Save)
 *
 * Used by the autoSaveDraft mutation to create or update email drafts.
 * Implements last-write-wins conflict detection using lastSyncedAt timestamp.
 */
@InputType()
export class UpdateDraftInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  bodyJson?: Record<string, any>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  bodyHtml?: string;

  @Field(() => [GraphQLJSON], { nullable: true })
  @IsOptional()
  attachments?: Array<Record<string, any>>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  signatureId?: string;

  @Field(() => Date, { nullable: true, description: 'Timestamp of last local sync (for conflict detection)' })
  @IsOptional()
  @IsDate()
  lastSyncedAt?: Date;
}
