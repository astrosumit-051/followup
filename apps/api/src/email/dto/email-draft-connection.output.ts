import { ObjectType, Field, Int } from '@nestjs/graphql';
import { EmailDraft } from '../entities/email-draft.entity';

/**
 * Page Info for paginated email draft results
 */
@ObjectType()
export class EmailDraftPageInfo {
  @Field(() => Boolean, { description: 'Whether there are more results available' })
  hasNextPage!: boolean;

  @Field(() => Int, { description: 'Total number of items matching the query' })
  total!: number;
}

/**
 * Email Draft Connection (Paginated List)
 *
 * Used to return paginated list of email drafts with page metadata.
 */
@ObjectType()
export class EmailDraftConnection {
  @Field(() => [EmailDraft], { description: 'Array of email drafts in this page' })
  edges!: EmailDraft[];

  @Field(() => EmailDraftPageInfo, { description: 'Pagination metadata (hasNextPage, total)' })
  pageInfo!: EmailDraftPageInfo;
}
