import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

/**
 * Input for Creating Email Signature
 *
 * Used to create new email signatures with rich text content (TipTap JSON).
 * Users can set default flags for automatic signature selection.
 */
@InputType()
export class CreateSignatureInput {
  @Field(() => String, { description: 'User-friendly name for this signature (e.g., "Professional", "Casual")' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @Field(() => GraphQLJSON, { description: 'TipTap document JSON format for rich text editing' })
  @IsNotEmpty()
  contentJson!: Record<string, any>;

  @Field(() => String, { description: 'Pre-rendered HTML for email sending' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  contentHtml!: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false, description: 'Set as default for formal emails' })
  @IsOptional()
  @IsBoolean()
  isDefaultForFormal?: boolean = false;

  @Field(() => Boolean, { nullable: true, defaultValue: false, description: 'Set as default for casual emails' })
  @IsOptional()
  @IsBoolean()
  isDefaultForCasual?: boolean = false;

  @Field(() => Boolean, { nullable: true, defaultValue: false, description: 'Set as global fallback default' })
  @IsOptional()
  @IsBoolean()
  isGlobalDefault?: boolean = false;
}
