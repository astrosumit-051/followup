import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * Sort field options for email drafts
 */
export enum DraftSortField {
  UPDATED_AT = 'UPDATED_AT',
  CREATED_AT = 'CREATED_AT',
  CONTACT_NAME = 'CONTACT_NAME',
}

/**
 * Sort order options
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Register enums for GraphQL schema generation
registerEnumType(DraftSortField, {
  name: 'DraftSortField',
  description: 'Sort field options for email drafts (UPDATED_AT, CREATED_AT, CONTACT_NAME)',
});

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Sort order (ASC or DESC)',
});

/**
 * Pagination Input
 *
 * Used for paginating list results with skip/take pattern.
 */
@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 0, description: 'Number of items to skip (default: 0)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @Field(() => Int, { nullable: true, defaultValue: 10, description: 'Number of items to take (default: 10, max: 100)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10;
}
