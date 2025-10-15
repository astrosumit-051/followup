import { ObjectType, Field, ID, HideField, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Direction } from '../enums';

// Register Direction enum for GraphQL schema generation
registerEnumType(Direction, {
  name: 'Direction',
  description: 'Direction of conversation (SENT by user or RECEIVED from contact)',
});

/**
 * Conversation History Entity
 *
 * Represents a single entry in the conversation history between user and contact.
 * Used to provide context to AI for personalized email generation.
 */
@ObjectType()
export class ConversationHistory {
  @Field(() => ID)
  id!: string;

  @HideField()
  userId!: string;

  @Field()
  contactId!: string;

  @Field(() => String, { nullable: true })
  emailId?: string | null;

  @Field()
  content!: string;

  @Field(() => Direction)
  direction!: Direction;

  @Field(() => Date)
  timestamp!: Date;

  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: Record<string, any> | null;
}
