import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { EmailStatus, TemplateType } from '../enums';

/**
 * Input for Updating an Email
 *
 * Used to update draft emails. Only draft emails can be updated.
 * All fields except id are optional to allow partial updates.
 */
@InputType()
export class UpdateEmailInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  id!: string;

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

  @Field(() => EmailStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @Field(() => TemplateType, { nullable: true })
  @IsOptional()
  @IsEnum(TemplateType)
  templateType?: TemplateType;
}
