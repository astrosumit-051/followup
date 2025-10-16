import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

/**
 * Input for Updating Email Signature
 *
 * Used to update existing email signatures. All fields are optional.
 * Setting a default flag will automatically unset other signatures with the same flag.
 */
@InputType()
export class UpdateSignatureInput {
  @Field(() => String, { nullable: true, description: 'Updated name for this signature' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Updated TipTap document JSON' })
  @IsOptional()
  contentJson?: Record<string, any>;

  @Field(() => String, { nullable: true, description: 'Updated pre-rendered HTML' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  contentHtml?: string;

  @Field(() => Boolean, { nullable: true, description: 'Update formal default flag' })
  @IsOptional()
  @IsBoolean()
  isDefaultForFormal?: boolean;

  @Field(() => Boolean, { nullable: true, description: 'Update casual default flag' })
  @IsOptional()
  @IsBoolean()
  isDefaultForCasual?: boolean;

  @Field(() => Boolean, { nullable: true, description: 'Update global default flag' })
  @IsOptional()
  @IsBoolean()
  isGlobalDefault?: boolean;
}
