import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Email } from './email.entity';

/**
 * PageInfo GraphQL Entity
 *
 * Contains pagination metadata for offset-based pagination.
 * Provides information about whether more results are available.
 */
@ObjectType()
export class EmailPageInfo {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  skip!: number;

  @Field(() => Int)
  take!: number;

  @Field()
  hasMore!: boolean;
}

/**
 * EmailConnection GraphQL Entity
 *
 * Represents a paginated list of emails using offset-based pagination.
 *
 * This structure provides:
 * - emails: Array of Email objects
 * - pageInfo: Metadata about pagination state and total count
 */
@ObjectType()
export class EmailConnection {
  @Field(() => [Email])
  emails!: Email[];

  @Field(() => EmailPageInfo)
  pageInfo!: EmailPageInfo;
}
