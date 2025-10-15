import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * Email Variant
 *
 * Represents a single style variant of a generated email (formal or casual).
 */
@ObjectType()
export class EmailVariant {
  @Field()
  subject!: string;

  @Field()
  body!: string;

  @Field({ nullable: true })
  bodyHtml?: string | null;
}

/**
 * Generated Email Template
 *
 * Represents the result of AI email generation containing both formal and casual variants.
 * Returned by the generateEmailTemplate mutation.
 */
@ObjectType()
export class GeneratedEmailTemplate {
  @Field(() => EmailVariant)
  formal!: EmailVariant;

  @Field(() => EmailVariant)
  casual!: EmailVariant;

  @Field()
  providerId!: string;

  @Field(() => Int)
  tokensUsed!: number;

  @Field()
  generatedAt!: Date;

  @Field()
  contactId!: string;
}
