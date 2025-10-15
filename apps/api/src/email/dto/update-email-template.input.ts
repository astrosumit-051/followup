import { InputType, Field } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

/**
 * Input for Updating an Email Template
 *
 * All fields are optional to allow partial updates.
 * Only provided fields will be validated and updated.
 */
@InputType()
export class UpdateEmailTemplateInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50000)
  body?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  bodyHtml?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
