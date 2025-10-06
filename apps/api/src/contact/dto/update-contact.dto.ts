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
import { Priority } from '../enums/priority.enum';
import { Gender } from '../enums/gender.enum';

/**
 * DTO for updating an existing contact
 *
 * All fields are optional to allow partial updates.
 * Only provided fields will be validated and updated.
 *
 * All validation rules from CreateContactDto apply when fields are provided.
 * Immutable fields (id, userId, createdAt) cannot be updated.
 */
export class UpdateContactDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Matches(/\S/, { message: 'name cannot be only whitespace' })
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsUrl()
  linkedInUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  role?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthday?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  notes?: string;
}
