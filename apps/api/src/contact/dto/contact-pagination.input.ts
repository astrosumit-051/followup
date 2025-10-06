import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

/**
 * DTO for cursor-based pagination
 *
 * Implements cursor-based pagination for efficient scrolling through large contact lists.
 * - cursor: Opaque cursor string pointing to a position in the result set
 * - limit: Number of results per page (default: 20, max: 100)
 */
export class ContactPaginationInput {
  @IsOptional()
  @IsString()
  cursor?: string; // Opaque cursor for pagination

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20; // Default 20, max 100
}
