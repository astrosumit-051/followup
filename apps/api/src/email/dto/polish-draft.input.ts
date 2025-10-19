import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { PolishStyle } from '../enums/polish-style.enum';

/**
 * Input for Polish Draft Mutation
 *
 * Allows users to refine their email drafts using AI with 4 different style options.
 * Returns the polished version in the specified style with word count diff.
 */
@InputType()
export class PolishDraftInput {
  @Field(() => String, { description: 'Raw email content to polish (plain text or HTML)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content!: string;

  @Field(() => PolishStyle, { description: 'Polish style to apply (FORMAL, CASUAL, ELABORATE, CONCISE)' })
  @IsEnum(PolishStyle)
  @IsNotEmpty()
  style!: PolishStyle;
}
