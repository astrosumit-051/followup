import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * Email Variant
 *
 * Represents a single style variant of a generated email (formal or casual).
 * Each variant includes the email subject and body tailored to that communication style.
 */
@ObjectType({ description: 'A single style variant of a generated email (formal or casual)' })
export class EmailVariant {
  @Field({ description: 'Generated email subject line (5-50 words)' })
  subject!: string;

  @Field({ description: 'Generated email body text (50-300 words)' })
  body!: string;

  @Field(() => String, { nullable: true, description: 'HTML-formatted email body (optional, for rich formatting)' })
  bodyHtml?: string | null;
}

/**
 * Generated Email Template
 *
 * Represents the result of AI email generation containing both formal and casual variants.
 * Returned by the generateEmailTemplate mutation with metadata about the generation process.
 *
 * The AI system analyzes the contact's context (role, company, industry, previous conversations)
 * and generates two style variants to give the user choice in tone while maintaining personalization.
 *
 * @example
 * ```graphql
 * mutation GenerateEmail {
 *   generateEmailTemplate(input: { contactId: "contact-id", style: FORMAL }) {
 *     formal { subject body }
 *     casual { subject body }
 *     providerId
 *     tokensUsed
 *     generatedAt
 *   }
 * }
 * ```
 */
@ObjectType({ description: 'AI-generated email template with both formal and casual style variants' })
export class GeneratedEmailTemplate {
  @Field(() => EmailVariant, { description: 'Formal communication style: professional, structured, suitable for business networking' })
  formal!: EmailVariant;

  @Field(() => EmailVariant, { description: 'Casual communication style: friendly, conversational, warm yet professional' })
  casual!: EmailVariant;

  @Field({ description: 'LLM provider that generated this template (gemini, openai, anthropic)' })
  providerId!: string;

  @Field(() => Int, { description: 'Total tokens used during generation (for cost tracking across both variants)' })
  tokensUsed!: number;

  @Field(() => Date, { description: 'Timestamp when template was generated' })
  generatedAt!: Date;

  @Field({ description: 'ID of the contact this template was generated for' })
  contactId!: string;
}
