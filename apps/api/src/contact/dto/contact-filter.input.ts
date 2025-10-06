import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { Priority } from '../enums/priority.enum';

/**
 * DTO for filtering contacts in list queries
 *
 * All fields are optional and can be combined for precise filtering.
 * Multiple filters are combined with AND logic.
 */
@InputType()
export class ContactFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string; // Search across name, email, company

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

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
}
