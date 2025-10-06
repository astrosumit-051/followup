import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsUrl,
  IsEnum,
  IsDate,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field } from '@nestjs/graphql';
import { Priority } from '../enums/priority.enum';
import { Gender } from '../enums/gender.enum';

/**
 * DTO for creating a new contact
 *
 * Validation rules:
 * - name: Required, 1-255 characters
 * - email: Optional, valid email format
 * - phone: Optional, max 50 characters
 * - linkedInUrl: Optional, valid URL format
 * - company: Optional, max 255 characters
 * - industry: Optional, max 255 characters
 * - role: Optional, max 255 characters
 * - priority: Optional, valid Priority enum (defaults to MEDIUM in service layer)
 * - gender: Optional, valid Gender enum
 * - birthday: Optional, valid Date
 * - notes: Optional, max 10,000 characters
 */
@InputType()
export class CreateContactDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Matches(/\S/, { message: 'name cannot be only whitespace' })
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  linkedInUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  role?: string;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthday?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  notes?: string;
}
