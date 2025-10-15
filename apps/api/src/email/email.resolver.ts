import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
} from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import * as sanitizeHtml from 'sanitize-html';
import { EmailService } from './email.service';
import { AIService } from '../ai/ai.service';
import { Email, EmailTemplate, ConversationHistory, EmailConnection, GeneratedEmailTemplate } from './entities';
import { FindEmailsInput, GenerateEmailInput, SaveEmailInput, UpdateEmailInput } from './dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/authenticated-user.interface';
import { EmailStatus, Direction } from './enums';

/**
 * Email GraphQL Resolver
 *
 * Handles all GraphQL query operations for email management.
 * All operations are protected by AuthGuard and require authentication.
 *
 * Security:
 * - @UseGuards(AuthGuard): Ensures all requests are authenticated
 * - @CurrentUser(): Extracts authenticated user from JWT token
 * - ValidationPipe: Validates all input DTOs using class-validator
 * - Service layer enforces user ownership on all operations
 * - Rate limiting handled by GqlThrottlerGuard globally
 *
 * @example
 * ```graphql
 * query {
 *   emails(input: { contactId: "123", status: SENT, skip: 0, take: 20 }) {
 *     emails { id subject status }
 *     pageInfo { total hasMore }
 *   }
 * }
 * ```
 */
@Resolver(() => Email)
@UseGuards(AuthGuard) // Protect all resolver methods with authentication
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Validate all inputs
export class EmailResolver {
  private readonly logger = new Logger(EmailResolver.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly aiService: AIService,
  ) {}

  /**
   * Get a single email by ID
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Email ID
   * @returns Email if found and owned by user
   * @throws NotFoundException if email not found or user doesn't own it
   */
  @Query(() => Email, { name: 'email' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Email> {
    const email = await this.emailService.findEmailById(id, user.id);

    if (!email) {
      throw new NotFoundException(
        `Email with ID ${id} not found or you do not have access to it`
      );
    }

    return email as Email;
  }

  /**
   * Get all emails for the authenticated user with filtering and pagination
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Optional filter criteria and pagination parameters
   * @returns Paginated list of emails with metadata
   */
  @Query(() => EmailConnection, { name: 'emails' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { type: () => FindEmailsInput, nullable: true })
    input?: FindEmailsInput,
  ): Promise<EmailConnection> {
    const { emails, total, skip, take } = await this.emailService.findUserEmails(
      user.id,
      input || ({} as any),
    );

    return {
      emails: emails as Email[],
      pageInfo: {
        total,
        skip: skip || 0,
        take: take || 10,
        hasMore: (skip || 0) + (take || 10) < total,
      },
    };
  }

  /**
   * Get conversation history for a specific contact
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param contactId - Contact ID to get conversation history for
   * @param limit - Maximum number of entries to return (default: 5)
   * @returns Array of conversation history entries, ordered by timestamp descending
   */
  @Query(() => [ConversationHistory], { name: 'conversationHistory' })
  async conversationHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Args('contactId', { type: () => ID }) contactId: string,
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 5 }) limit: number,
  ): Promise<ConversationHistory[]> {
    return this.emailService.getConversationHistory(user.id, contactId, limit) as Promise<ConversationHistory[]>;
  }

  /**
   * Get all email templates for the authenticated user
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @returns Array of email templates owned by the user
   */
  @Query(() => [EmailTemplate], { name: 'emailTemplates' })
  async emailTemplates(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EmailTemplate[]> {
    return this.emailService.findTemplatesByUserId(user.id) as Promise<EmailTemplate[]>;
  }

  /**
   * Generate AI-powered email templates (formal and casual variants)
   *
   * This mutation generates personalized email templates using AI based on:
   * - Contact information (name, company, role, industry, notes)
   * - Conversation history (if includeConversationHistory is true)
   * - Additional context (if provided)
   *
   * Rate limit: 10 requests per minute per user to prevent abuse
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Generation parameters (contactId, additionalContext, includeConversationHistory)
   * @returns GeneratedEmailTemplate with both formal and casual variants
   * @throws NotFoundException if contact not found or user doesn't own it
   * @throws Error if AI service fails for both providers
   *
   * @example
   * ```graphql
   * mutation {
   *   generateEmailTemplate(input: {
   *     contactId: "contact-123"
   *     additionalContext: "Follow up about our meeting at AWS Summit"
   *     includeConversationHistory: true
   *   }) {
   *     formal { subject body }
   *     casual { subject body }
   *     providerId
   *     tokensUsed
   *     generatedAt
   *   }
   * }
   * ```
   */
  @Mutation(() => GeneratedEmailTemplate)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async generateEmailTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { type: () => GenerateEmailInput }) input: GenerateEmailInput,
  ): Promise<GeneratedEmailTemplate> {
    this.logger.log(`Generating email templates for user ${user.id}, contact ${input.contactId}`);

    try {
      // Generate formal variant
      const formalResult = await this.aiService.generateEmailTemplate(
        user.id,
        input.contactId,
        'formal',
      );

      // Generate casual variant
      const casualResult = await this.aiService.generateEmailTemplate(
        user.id,
        input.contactId,
        'casual',
      );

      // Use the provider that was successful (they should be the same)
      const providerId = formalResult.providerId;
      const totalTokens = formalResult.tokensUsed + casualResult.tokensUsed;

      this.logger.log(`Email templates generated successfully using ${providerId} (${totalTokens} tokens)`);

      return {
        formal: {
          subject: formalResult.subject,
          body: formalResult.body,
          bodyHtml: null, // HTML conversion can be added later
        },
        casual: {
          subject: casualResult.subject,
          body: casualResult.body,
          bodyHtml: null,
        },
        providerId,
        tokensUsed: totalTokens,
        generatedAt: new Date(),
        contactId: input.contactId,
      };
    } catch (error) {
      this.logger.error(`Email template generation failed for user ${user.id}, contact ${input.contactId}`, error);

      // Re-throw the error with user-friendly message
      if (error instanceof Error) {
        throw new Error(`Failed to generate email templates: ${error.message}`);
      }

      throw new Error('Failed to generate email templates. Please try again later.');
    }
  }

  /**
   * Private helper to sanitize HTML content and prevent XSS attacks
   */
  private sanitizeContent(content: string): string {
    return sanitizeHtml(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      allowedAttributes: {
        'a': ['href', 'title', 'target'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      disallowedTagsMode: 'discard',
    });
  }

  /**
   * Save email as draft or mark as sent
   *
   * This mutation saves AI-generated or manually composed emails to the database.
   * When status=SENT, it also creates a conversation history entry for AI context.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Email data (contactId, subject, body, status, templateType, etc.)
   * @returns Saved email record
   * @throws NotFoundException if contact not found or user doesn't own it
   *
   * @example
   * ```graphql
   * mutation {
   *   saveEmail(input: {
   *     contactId: "contact-123"
   *     subject: "Following Up on Our Discussion"
   *     body: "Dear John,\n\nIt was great meeting you..."
   *     status: DRAFT
   *     templateType: FORMAL
   *   }) {
   *     id
   *     subject
   *     status
   *     createdAt
   *   }
   * }
   * ```
   */
  @Mutation(() => Email)
  async saveEmail(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { type: () => SaveEmailInput }) input: SaveEmailInput,
  ): Promise<Email> {
    this.logger.log(`Saving email for user ${user.id}, contact ${input.contactId}`);

    // Sanitize input to prevent XSS
    const sanitizedInput = {
      userId: user.id,
      contactId: input.contactId,
      subject: this.sanitizeContent(input.subject),
      body: this.sanitizeContent(input.body),
      bodyHtml: input.bodyHtml ? this.sanitizeContent(input.bodyHtml) : undefined,
      status: input.status,
      templateType: input.templateType,
      providerId: input.providerId,
      tokensUsed: input.tokensUsed,
    };

    try {
      // Save email to database
      const savedEmail = await this.emailService.createEmail(sanitizedInput);

      // If email is sent, create conversation history entry
      if (savedEmail.status === EmailStatus.SENT) {
        await this.emailService.createConversationEntry({
          userId: user.id,
          contactId: input.contactId,
          emailId: savedEmail.id,
          content: savedEmail.body,
          direction: Direction.SENT,
        });

        this.logger.log(`Conversation history created for email ${savedEmail.id}`);
      }

      return savedEmail as Email;
    } catch (error) {
      this.logger.error(`Failed to save email for user ${user.id}`, error);
      throw error;
    }
  }

  /**
   * Update an existing email draft
   *
   * This mutation updates draft emails only. Sent emails cannot be modified.
   * All fields are optional to allow partial updates.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Update data (id, subject, body, bodyHtml, status, templateType)
   * @returns Updated email record
   * @throws NotFoundException if email not found or user doesn't own it
   * @throws ForbiddenException if email is not a draft
   *
   * @example
   * ```graphql
   * mutation {
   *   updateEmail(input: {
   *     id: "email-123"
   *     subject: "Updated Subject"
   *     body: "Updated body content"
   *   }) {
   *     id
   *     subject
   *     body
   *     updatedAt
   *   }
   * }
   * ```
   */
  @Mutation(() => Email)
  async updateEmail(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { type: () => UpdateEmailInput }) input: UpdateEmailInput,
  ): Promise<Email> {
    this.logger.log(`Updating email ${input.id} for user ${user.id}`);

    // Sanitize input to prevent XSS
    const sanitizedInput = {
      subject: input.subject ? this.sanitizeContent(input.subject) : undefined,
      body: input.body ? this.sanitizeContent(input.body) : undefined,
      bodyHtml: input.bodyHtml ? this.sanitizeContent(input.bodyHtml) : undefined,
      status: input.status,
      templateType: input.templateType,
    };

    // Service handles authorization and draft-only validation
    return this.emailService.updateEmail(input.id, user.id, sanitizedInput) as Promise<Email>;
  }

  /**
   * Delete an email
   *
   * This mutation deletes emails from the database.
   * Drafts are hard deleted, sent emails could be soft deleted (Phase 3).
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Email ID to delete
   * @returns True if deleted successfully
   * @throws NotFoundException if email not found or user doesn't own it
   *
   * @example
   * ```graphql
   * mutation {
   *   deleteEmail(id: "email-123")
   * }
   * ```
   */
  @Mutation(() => Boolean)
  async deleteEmail(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    this.logger.log(`Deleting email ${id} for user ${user.id}`);

    // Service handles authorization and deletion
    await this.emailService.deleteEmail(id, user.id);
    return true;
  }
}
