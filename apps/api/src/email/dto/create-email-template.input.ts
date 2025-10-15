import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

/**
 * Input for Creating an Email Template
 *
 * Used to save reusable email templates with custom names and categories.
 * Templates can be marked as default for quick access.
 */
@InputType()
export class CreateEmailTemplateInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  subject!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50000)
  body!: string;

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
