import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Direction } from '../enums';

/**
 * Input for Creating a Conversation History Entry
 *
 * Used to track conversation history between user and contact.
 * Automatically created when emails are sent.
 */
@InputType()
export class CreateConversationEntryInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  contactId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  emailId?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50000)
  content!: string;

  @Field(() => Direction)
  @IsNotEmpty()
  @IsEnum(Direction)
  direction!: Direction;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}
