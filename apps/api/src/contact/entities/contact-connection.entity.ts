import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Contact } from './contact.entity';

/**
 * PageInfo GraphQL Entity
 *
 * Contains pagination metadata for cursor-based pagination.
 * Follows Relay specification for connection-based pagination.
 *
 * @see https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo
 */
@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage!: boolean;

  @Field()
  hasPreviousPage!: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

/**
 * ContactEdge GraphQL Entity
 *
 * Represents an edge in a connection, containing a node and a cursor.
 * Used for cursor-based pagination.
 */
@ObjectType()
export class ContactEdge {
  @Field(() => Contact)
  node!: Contact;

  @Field()
  cursor!: string;
}

/**
 * ContactConnection GraphQL Entity
 *
 * Represents a paginated list of contacts following the Relay
 * connection specification for cursor-based pagination.
 *
 * This structure provides:
 * - nodes: Array of Contact objects for easy access
 * - edges: Array of ContactEdge for cursor-based navigation
 * - pageInfo: Metadata about pagination state
 * - totalCount: Total number of contacts matching the query
 *
 * @see https://relay.dev/graphql/connections.htm
 */
@ObjectType()
export class ContactConnection {
  @Field(() => [Contact])
  nodes!: Contact[];

  @Field(() => [ContactEdge])
  edges!: ContactEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;

  @Field(() => Int)
  totalCount!: number;
}
