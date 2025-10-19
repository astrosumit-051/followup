import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PolishStyle } from '../enums/polish-style.enum';

/**
 * PolishedDraft Entity
 *
 * Represents the output of the polishDraft mutation.
 * Contains the AI-refined content with metadata about the transformation.
 *
 * @example
 * ```graphql
 * mutation PolishEmail {
 *   polishDraft(input: { content: "hey can we meet", style: FORMAL }) {
 *     content
 *     style
 *     originalWordCount
 *     polishedWordCount
 *     wordCountDiff
 *     wordCountPercentageDiff
 *   }
 * }
 * ```
 */
@ObjectType({ description: 'AI-polished email draft with metadata about the transformation applied.' })
export class PolishedDraft {
  @Field(() => String, { description: 'Polished email content in the requested style' })
  content!: string;

  @Field(() => PolishStyle, { description: 'Style that was applied to the content' })
  style!: PolishStyle;

  @Field(() => Int, { description: 'Word count of the original content' })
  originalWordCount!: number;

  @Field(() => Int, { description: 'Word count of the polished content' })
  polishedWordCount!: number;

  @Field(() => Int, { description: 'Difference in word count (polished - original)' })
  wordCountDiff!: number;

  @Field(() => String, { description: 'Percentage change in word count (e.g., "-20%", "+15%")' })
  wordCountPercentageDiff!: string;
}
