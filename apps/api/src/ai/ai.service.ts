import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';

export interface GenerateEmailTemplateInput {
  contactName: string;
  contactEmail: string;
  contactCompany?: string;
  contactRole?: string;
  contactNotes?: string;
  contactPriority?: string;
  conversationHistory?: string[];
  emailContext?: string;
}

export interface GeneratedEmailTemplate {
  formal: {
    subject: string;
    body: string;
    bodyHtml: string;
  };
  casual: {
    subject: string;
    body: string;
    bodyHtml: string;
  };
  providerId: string;
  tokensUsed: number;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly models = [
    'openai/gpt-4-turbo',
    'anthropic/claude-3-5-sonnet',
    'google/gemini-pro-1.5',
  ];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Creates a ChatOpenAI instance configured for OpenRouter
   */
  private createChatModel(model: string): ChatOpenAI {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY')!; // API key already validated
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

    return new ChatOpenAI({
      model,
      temperature: 0.8,
      apiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': appUrl,
          'X-Title': 'RelationHub',
        },
      },
    });
  }

  /**
   * Sanitizes user input to prevent prompt injection attacks
   *
   * @param value - The input value to sanitize
   * @param fieldName - The name of the field (for logging)
   * @param maxLength - Maximum allowed length
   * @returns Sanitized input value
   */
  private sanitizeInput(value: string, fieldName: string, maxLength: number): string {
    if (!value) {
      return value;
    }

    // Trim whitespace
    let sanitized = value.trim();

    // Check length limit
    if (sanitized.length > maxLength) {
      this.logger.warn(`Input for ${fieldName} exceeds maximum length of ${maxLength} characters. Truncating.`);
      sanitized = sanitized.substring(0, maxLength);
    }

    // Detect suspicious patterns (case-insensitive)
    // Match the pattern and surrounding context to remove malicious content more effectively
    const suspiciousPatterns = [
      { pattern: /ignore\s+(previous|all|above).*?(\.|$)/i, reason: 'prompt injection attempt' },
      { pattern: /disregard\s+(previous|all|above).*?(\.|$)/i, reason: 'prompt injection attempt' },
      { pattern: /forget\s+(everything|previous|all).*?(\.|$)/i, reason: 'prompt injection attempt' },
      { pattern: /you\s+are\s+now.*?(\.|$)/i, reason: 'role manipulation attempt' },
      { pattern: /new\s+instructions.*?(\.|$)/i, reason: 'instruction override attempt' },
      { pattern: /system\s*prompt.*?(\.|$)/i, reason: 'system prompt extraction attempt' },
      { pattern: /system\s*:.*?(\.|$)/i, reason: 'role injection attempt' },
      { pattern: /assistant\s*:.*?(\.|$)/i, reason: 'role injection attempt' },
      { pattern: /\bSUBJECT\s*:.*?$/im, reason: 'delimiter injection attempt' },
      { pattern: /\bBODY\s*:.*?$/im, reason: 'delimiter injection attempt' },
    ];

    for (const { pattern, reason } of suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        this.logger.warn(`Suspicious pattern detected in ${fieldName}: ${reason}`);
        // Remove the entire sentence/line containing the suspicious pattern
        sanitized = sanitized.replace(pattern, '[CONTENT REMOVED FOR SECURITY]');
      }
    }

    // Replace multiple consecutive newlines with maximum of 2
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

    return sanitized;
  }

  /**
   * Generates email templates (formal and casual) based on contact context
   */
  async generateEmailTemplate(
    input: GenerateEmailTemplateInput,
  ): Promise<GeneratedEmailTemplate> {
    this.logger.log(`Generating email template for contact: ${input.contactName}`);

    // Check API key configuration before attempting generation
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Sanitize all user inputs to prevent prompt injection
    const sanitizedInput: GenerateEmailTemplateInput = {
      contactName: this.sanitizeInput(input.contactName, 'contactName', 100),
      contactEmail: this.sanitizeInput(input.contactEmail, 'contactEmail', 100),
      contactCompany: input.contactCompany ? this.sanitizeInput(input.contactCompany, 'contactCompany', 100) : undefined,
      contactRole: input.contactRole ? this.sanitizeInput(input.contactRole, 'contactRole', 100) : undefined,
      contactNotes: input.contactNotes ? this.sanitizeInput(input.contactNotes, 'contactNotes', 1000) : undefined,
      contactPriority: input.contactPriority ? this.sanitizeInput(input.contactPriority, 'contactPriority', 20) : undefined,
      emailContext: input.emailContext ? this.sanitizeInput(input.emailContext, 'emailContext', 500) : undefined,
      conversationHistory: input.conversationHistory?.map((msg, i) =>
        this.sanitizeInput(msg, `conversationHistory[${i}]`, 500)
      ),
    };

    // Build context from contact information
    const contactContext = this.buildContactContext(sanitizedInput);

    // Try each model in the fallback chain
    for (const model of this.models) {
      try {
        this.logger.log(`Attempting generation with model: ${model}`);

        const chat = this.createChatModel(model);

        // Generate formal variant
        const formalPrompt = this.buildFormalPrompt(contactContext, sanitizedInput);
        const formalResponse = await chat.invoke([
          new SystemMessage(this.getSystemPrompt()),
          new HumanMessage(formalPrompt),
        ]);

        // Generate casual variant
        const casualPrompt = this.buildCasualPrompt(contactContext, sanitizedInput);
        const casualResponse = await chat.invoke([
          new SystemMessage(this.getSystemPrompt()),
          new HumanMessage(casualPrompt),
        ]);

        // Parse responses
        const formal = this.parseEmailResponse(formalResponse.content.toString());
        const casual = this.parseEmailResponse(casualResponse.content.toString());

        // Estimate tokens used (rough approximation: ~4 chars per token)
        const tokensUsed = Math.ceil(
          (formalPrompt.length + formalResponse.content.toString().length +
           casualPrompt.length + casualResponse.content.toString().length) / 4
        );

        this.logger.log(`Successfully generated email templates using ${model}`);

        return {
          formal,
          casual,
          providerId: model,
          tokensUsed,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Failed to generate with ${model}: ${errorMessage}`);
        // Continue to next model in fallback chain
      }
    }

    throw new Error('All AI providers failed to generate email template');
  }

  /**
   * Builds contact context string for the prompt
   */
  private buildContactContext(input: GenerateEmailTemplateInput): string {
    const parts: string[] = [
      `Contact Name: ${input.contactName}`,
      `Contact Email: ${input.contactEmail}`,
    ];

    if (input.contactCompany) {
      parts.push(`Company: ${input.contactCompany}`);
    }

    if (input.contactRole) {
      parts.push(`Role: ${input.contactRole}`);
    }

    if (input.contactPriority) {
      parts.push(`Priority: ${input.contactPriority}`);
    }

    if (input.contactNotes) {
      parts.push(`Notes: ${input.contactNotes}`);
    }

    if (input.conversationHistory && input.conversationHistory.length > 0) {
      parts.push('\nConversation History:');
      parts.push(...input.conversationHistory.map((msg, i) => `${i + 1}. ${msg}`));
    }

    return parts.join('\n');
  }

  /**
   * System prompt defining AI role as networking assistant
   */
  private getSystemPrompt(): string {
    return `You are a professional networking assistant helping users maintain and strengthen their professional relationships.

Your role is to generate personalized, authentic email templates that help users:
- Follow up after meetings or events
- Check in with contacts periodically
- Maintain meaningful professional connections
- Show genuine interest in their contacts' work and achievements

Guidelines:
1. Keep emails concise (2-3 paragraphs maximum)
2. Be authentic and personable, not salesy or transactional
3. Reference specific context when available (notes, previous conversations, company, role)
4. Include a clear but soft call-to-action
5. Match the requested tone (formal or casual)
6. Output in the format: SUBJECT: [subject line]\\n\\nBODY: [email body]

Here are examples of high-quality emails:

Example 1 (Formal - Conference Follow-up):
Context: Met Sarah Chen, VP Engineering at TechCorp, at AI Summit 2024. Discussed scaling AI infrastructure. Priority: HIGH

SUBJECT: Following Up from AI Summit 2024

BODY: Hi Sarah,

It was great meeting you at AI Summit last week. I really enjoyed our conversation about scaling AI infrastructure – your insights on managing GPU clusters at TechCorp's scale were fascinating.

I'd love to continue the discussion and perhaps explore how our approaches compare. Would you be open to a quick call in the next couple of weeks?

Best regards

Example 2 (Casual - Reconnection):
Context: Mike Rodriguez, former colleague from Acme Inc. Recently promoted to Engineering Manager. Last contact: 6 months ago

SUBJECT: Congrats on the promotion!

BODY: Hey Mike!

I saw on LinkedIn that you made Engineering Manager – that's awesome! Well-deserved after all the great work you did at Acme. How are you finding the new role?

Would love to catch up sometime if you're free. Maybe grab coffee or jump on a call?

Cheers`;
  }

  /**
   * Builds formal style prompt
   */
  private buildFormalPrompt(contactContext: string, input: GenerateEmailTemplateInput): string {
    let prompt = `Generate a formal, professional email template with the following context:\n\n${contactContext}`;

    if (input.emailContext) {
      prompt += `\n\nAdditional Context: ${input.emailContext}`;
    }

    prompt += '\n\nStyle: Formal and professional, suitable for business communications.';
    prompt += '\n\nOutput format: SUBJECT: [subject line]\\n\\nBODY: [email body]';

    return prompt;
  }

  /**
   * Builds casual style prompt
   */
  private buildCasualPrompt(contactContext: string, input: GenerateEmailTemplateInput): string {
    let prompt = `Generate a casual, friendly email template with the following context:\n\n${contactContext}`;

    if (input.emailContext) {
      prompt += `\n\nAdditional Context: ${input.emailContext}`;
    }

    prompt += '\n\nStyle: Casual and friendly, more conversational and relaxed.';
    prompt += '\n\nOutput format: SUBJECT: [subject line]\\n\\nBODY: [email body]';

    return prompt;
  }

  /**
   * Parses LLM response into subject and body
   */
  private parseEmailResponse(response: string): {
    subject: string;
    body: string;
    bodyHtml: string;
  } {
    // Extract subject line
    const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n\n|\nBODY:)/s);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Follow-up';

    // Extract body
    const bodyMatch = response.match(/BODY:\s*(.+)/s);
    const body = bodyMatch ? bodyMatch[1].trim() : response;

    // Convert body to HTML (simple paragraph conversion)
    const bodyHtml = body
      .split('\n\n')
      .map((paragraph) => `<p>${paragraph.trim()}</p>`)
      .join('\n');

    return {
      subject,
      body,
      bodyHtml,
    };
  }
}
