import { registerEnumType } from '@nestjs/graphql';

/**
 * Polish Style Enum
 *
 * Defines the 4 AI refinement styles for the polishDraft mutation.
 * Each style applies different transformations to user's draft content.
 *
 * - FORMAL: Professional, business-appropriate language
 * - CASUAL: Friendly, conversational tone
 * - ELABORATE: Expanded version with more details and context
 * - CONCISE: Shortened version focusing on key points only
 */
export enum PolishStyle {
  FORMAL = 'FORMAL',
  CASUAL = 'CASUAL',
  ELABORATE = 'ELABORATE',
  CONCISE = 'CONCISE',
}

registerEnumType(PolishStyle, {
  name: 'PolishStyle',
  description: 'AI refinement styles for email draft polish feature. Each style applies different transformations to the content.',
  valuesMap: {
    FORMAL: {
      description: 'Professional, business-appropriate language with formal tone',
    },
    CASUAL: {
      description: 'Friendly, conversational tone suitable for informal communication',
    },
    ELABORATE: {
      description: 'Expanded version with more details, context, and explanation',
    },
    CONCISE: {
      description: 'Shortened version focusing on key points only, removing unnecessary words',
    },
  },
});
