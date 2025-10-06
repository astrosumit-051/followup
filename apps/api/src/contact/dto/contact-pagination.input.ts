import { IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';

/**
 * DTO for cursor-based pagination
 *
 * Implements cursor-based pagination for efficient scrolling through large contact lists.
 * - cursor: UUID cursor pointing to a position in the result set
 * - limit: Number of results per page (default: 20, max: 100)
 */
export class ContactPaginationInput {
  @IsOptional()
  @IsUUID('4', { message: 'cursor must be a valid UUID' })
  cursor?: string; // UUID cursor for pagination

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20; // Default 20, max 100
}
