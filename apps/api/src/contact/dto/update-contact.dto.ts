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
 * DTO for updating an existing contact
 *
 * All fields are optional to allow partial updates.
 * Only provided fields will be validated and updated.
 *
 * All validation rules from CreateContactDto apply when fields are provided.
 * Immutable fields (id, userId, createdAt) cannot be updated.
 */
@InputType()
export class UpdateContactDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Matches(/\S/, { message: 'name cannot be only whitespace' })
  name?: string;

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
