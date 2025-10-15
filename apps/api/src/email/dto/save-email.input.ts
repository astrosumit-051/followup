import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmailStatus, TemplateType } from '../enums';

/**
 * Input for Saving an Email
 *
 * Used to save AI-generated or manually composed emails to the database.
 * Emails are created with DRAFT status by default unless specified.
 */
@InputType()
export class SaveEmailInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  contactId!: string;

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

  @Field(() => EmailStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @Field(() => TemplateType, { nullable: true })
  @IsOptional()
  @IsEnum(TemplateType)
  templateType?: TemplateType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  tokensUsed?: number;
}
