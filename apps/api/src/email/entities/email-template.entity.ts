import { ObjectType, Field, ID, Int, HideField } from '@nestjs/graphql';

/**
 * Email Template Entity
 *
 * Represents a saved email template that users can reuse for similar communications.
 * Tracks usage count and allows marking a default template.
 */
@ObjectType()
export class EmailTemplate {
  @Field(() => ID)
  id!: string;

  @HideField()
  userId!: string;

  @Field()
  name!: string;

  @Field()
  subject!: string;

  @Field()
  body!: string;

  @Field(() => String, { nullable: true })
  bodyHtml?: string | null;

  @Field()
  isDefault!: boolean;

  @Field(() => String, { nullable: true })
  category?: string | null;

  @Field(() => Int)
  usageCount!: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
