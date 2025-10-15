import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EmailStatus } from '../enums';

/**
 * Input for Finding/Filtering Emails
 *
 * Supports pagination, filtering by contact and status.
 * Used by the emails query to list user's emails with filters.
 */
@InputType()
export class FindEmailsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactId?: string;

  @Field(() => EmailStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  take?: number;
}
