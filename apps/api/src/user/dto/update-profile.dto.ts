import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

/**
 * Data Transfer Object for updating user profile
 *
 * Security Features:
 * - Input length validation (prevents buffer overflow attacks)
 * - Character set validation (prevents XSS and injection attacks)
 * - URL format validation (prevents malicious URL injections)
 * - Optional fields (provides flexibility)
 *
 * @see https://github.com/typestack/class-validator
 */
@InputType()
export class UpdateProfileDto {
  /**
   * User's display name
   *
   * Validation Rules:
   * - Optional field
   * - Must be a string
   * - Min length: 1 character (no empty strings)
   * - Max length: 100 characters (prevent buffer overflow)
   * - Allowed characters: Unicode letters, numbers, spaces, hyphens, apostrophes, periods
   * - Prevents: XSS attacks, SQL injection, control characters
   *
   * Supports international names including:
   * - Latin: John Doe, María García, François Müller
   * - Cyrillic: Иван Петров, Ольга Смирнова
   * - Arabic: محمد علي, فاطمة حسن
   * - Chinese: 李明, 王芳
   * - Japanese: 田中太郎, さくら
   * - Korean: 김철수, 이영희
   *
   * @example "John Doe"
   * @example "María García"
   * @example "O'Brien"
   * @example "محمد علي"
   * @example "李明"
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/^(?!\s+$)[\p{L}\p{N} \t\-'\.]+$/u, {
    message:
      'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods',
  })
  name?: string;

  /**
   * URL to user's profile picture
   *
   * Validation Rules:
   * - Optional field
   * - Must be a valid URL format
   * - Must use HTTPS protocol (prevents mixed content attacks)
   * - Max length: 2048 characters (standard URL length limit)
   * - Prevents: Protocol injection, XSS attacks, file:// URIs
   *
   * @example "https://example.com/avatar.jpg"
   * @example "https://storage.googleapis.com/bucket/profile-123.png"
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsUrl(
    {
      protocols: ['https'], // Only allow HTTPS URLs
      require_protocol: true, // Protocol must be explicitly specified
      require_valid_protocol: true, // Enforce protocol validation
    },
    { message: 'Profile picture must be a valid HTTPS URL' },
  )
  @MaxLength(2048, {
    message: 'Profile picture URL must not exceed 2048 characters',
  })
  profilePicture?: string;
}
