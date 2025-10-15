import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

/**
 * Input for AI Email Template Generation
 *
 * Used to generate personalized email templates (formal and casual variants)
 * based on contact context and conversation history.
 */
@InputType()
export class GenerateEmailInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  contactId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  additionalContext?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeConversationHistory?: boolean;
}
