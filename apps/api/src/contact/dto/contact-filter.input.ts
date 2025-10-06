import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { Priority } from '../enums/priority.enum';

/**
 * DTO for filtering contacts in list queries
 *
 * All fields are optional and can be combined for precise filtering.
 * Multiple filters are combined with AND logic.
 */
export class ContactFilterInput {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string; // Search across name, email, company

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

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
}
