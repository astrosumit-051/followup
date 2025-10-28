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
import { EmailDraftService } from './email-draft.service';
import { EmailSignatureService } from './email-signature.service';
import { AIService } from '../ai/ai.service';
import { GmailOAuthService } from '../gmail/gmail-oauth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Email, EmailTemplate, ConversationHistory, EmailConnection, GeneratedEmailTemplate, EmailDraft, EmailSignature } from './entities';
import { GmailConnection } from '../gmail/entities/gmail-connection.entity';
import { FindEmailsInput, GenerateEmailInput, SaveEmailInput, UpdateEmailInput, CreateEmailTemplateInput, UpdateEmailTemplateInput, CreateDraftInput, UpdateDraftInput, CreateSignatureInput, UpdateSignatureInput, PaginationInput, EmailDraftConnection, SendEmailInput, SendBulkCampaignInput, PolishDraftInput, CreateConversationEntryInput } from './dto';
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
    private readonly emailDraftService: EmailDraftService,
    private readonly emailSignatureService: EmailSignatureService,
    private readonly aiService: AIService,
    private readonly gmailOAuthService: GmailOAuthService,
    private readonly prisma: PrismaService,
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
    console.log('[conversationHistory] Query received:', { userId: user.id, contactId, limit });
    const result = await this.emailService.getConversationHistory(user.id, contactId, limit);
    console.log('[conversationHistory] Returning', result.length, 'entries');
    return result as ConversationHistory[];
  }

  /**
   * Create a conversation history entry
   *
   * This mutation creates a conversation history entry for testing purposes
   * or manual conversation logging. It allows E2E tests to seed conversation
   * data to test features that depend on conversation history.
   *
   * The contact must belong to the authenticated user.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Conversation entry data (contactId, content, direction, emailId, metadata)
   * @returns Created conversation history entry
   * @throws NotFoundException if contact doesn't exist
   * @throws ForbiddenException if contact doesn't belong to user
   *
   * @example
   * ```graphql
   * mutation {
   *   createConversationEntry(input: {
   *     contactId: "contact-123"
   *     content: "Thanks for connecting! Looking forward to our collaboration."
   *     direction: SENT
   *   }) {
   *     id
   *     contactId
   *     content
   *     direction
   *     timestamp
   *   }
   * }
   * ```
   */
  @Mutation(() => ConversationHistory)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async createConversationEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { type: () => CreateConversationEntryInput }) input: CreateConversationEntryInput,
  ): Promise<ConversationHistory> {
    this.logger.log(`Creating conversation entry for user ${user.id}, contact ${input.contactId}`);

    // Verify contact exists and belongs to user
    const contact = await this.prisma.contact.findUnique({
      where: { id: input.contactId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${input.contactId} not found`);
    }

    if (contact.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to create conversation entries for this contact');
    }

    try {
      // Create conversation entry
      const entry = await this.emailService.createConversationEntry({
        userId: user.id,
        contactId: input.contactId,
        emailId: input.emailId,
        content: input.content,
        direction: input.direction,
        metadata: input.metadata,
      });

      this.logger.log(`Conversation entry created successfully: ${entry.id}`);
      return entry as ConversationHistory;
    } catch (error) {
      this.logger.error(`Failed to create conversation entry for user ${user.id}`, error);
      throw error;
    }
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
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
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
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
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
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async deleteEmail(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    this.logger.log(`Deleting email ${id} for user ${user.id}`);

    // Service handles authorization and deletion
    await this.emailService.deleteEmail(id, user.id);
    return true;
  }

  /**
   * Create a new email template
   *
   * This mutation creates reusable email templates with custom names and categories.
   * Templates can be marked as default for quick access.
   * If isDefault is true, all other templates will be set to isDefault=false.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Template data (name, subject, body, isDefault, category)
   * @returns Created email template
   *
   * @example
   * ```graphql
   * mutation {
   *   createEmailTemplate(input: {
   *     name: "Follow-up Template"
   *     subject: "Following up on our conversation"
   *     body: "Hi {{name}},\n\nIt was great meeting you..."
   *     isDefault: true
   *     category: "Networking"
   *   }) {
   *     id
   *     name
   *     subject
   *     isDefault
   *     createdAt
   *   }
   * }
   * ```
   */
  @Mutation(() => EmailTemplate)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async createEmailTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { type: () => CreateEmailTemplateInput }) input: CreateEmailTemplateInput,
  ): Promise<EmailTemplate> {
    this.logger.log(`Creating email template for user ${user.id}`);

    // Sanitize input to prevent XSS
    const sanitizedInput = {
      name: this.sanitizeContent(input.name),
      subject: this.sanitizeContent(input.subject),
      body: this.sanitizeContent(input.body),
      bodyHtml: input.bodyHtml ? this.sanitizeContent(input.bodyHtml) : undefined,
      isDefault: input.isDefault,
      category: input.category ? this.sanitizeContent(input.category) : undefined,
    };

    try {
      const template = await this.emailService.createTemplate(user.id, sanitizedInput);
      return template as EmailTemplate;
    } catch (error) {
      this.logger.error(`Failed to create email template for user ${user.id}`, error);
      throw error;
    }
  }

  /**
   * Update an existing email template
   *
   * This mutation updates email templates with authorization checks.
   * All fields are optional to allow partial updates.
   * If isDefault is set to true, all other templates will be set to isDefault=false.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Template ID to update
   * @param input - Update data (name, subject, body, isDefault, category)
   * @returns Updated email template
   * @throws NotFoundException if template not found or user doesn't own it
   *
   * @example
   * ```graphql
   * mutation {
   *   updateEmailTemplate(
   *     id: "template-123"
   *     input: {
   *       name: "Updated Template Name"
   *       isDefault: true
   *     }
   *   ) {
   *     id
   *     name
   *     isDefault
   *     updatedAt
   *   }
   * }
   * ```
   */
  @Mutation(() => EmailTemplate)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async updateEmailTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateEmailTemplateInput }) input: UpdateEmailTemplateInput,
  ): Promise<EmailTemplate> {
    this.logger.log(`Updating email template ${id} for user ${user.id}`);

    // Sanitize input to prevent XSS
    const sanitizedInput = {
      name: input.name ? this.sanitizeContent(input.name) : undefined,
      subject: input.subject ? this.sanitizeContent(input.subject) : undefined,
      body: input.body ? this.sanitizeContent(input.body) : undefined,
      bodyHtml: input.bodyHtml ? this.sanitizeContent(input.bodyHtml) : undefined,
      isDefault: input.isDefault,
      category: input.category ? this.sanitizeContent(input.category) : undefined,
    };

    try {
      const template = await this.emailService.updateTemplate(id, user.id, sanitizedInput);
      return template as EmailTemplate;
    } catch (error) {
      this.logger.error(`Failed to update email template ${id} for user ${user.id}`, error);
      throw error;
    }
  }

  /**
   * Delete an email template
   *
   * This mutation deletes email templates from the database with authorization checks.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Template ID to delete
   * @returns True if deleted successfully
   * @throws NotFoundException if template not found or user doesn't own it
   *
   * @example
   * ```graphql
   * mutation {
   *   deleteEmailTemplate(id: "template-123")
   * }
   * ```
   */
  @Mutation(() => Boolean)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async deleteEmailTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    this.logger.log(`Deleting email template ${id} for user ${user.id}`);

    try {
      await this.emailService.deleteTemplate(id, user.id);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete email template ${id} for user ${user.id}`, error);
      throw error;
    }
  }

  // ==================== EMAIL COMPOSITION QUERIES ====================

  /**
   * Get email draft for a specific contact
   *
   * Returns the email draft for a contact if it exists.
   * Each user-contact pair can have only one draft at a time.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param contactId - Contact ID to get draft for
   * @returns EmailDraft or null if no draft exists
   * @throws NotFoundException if contact doesn't exist
   * @throws ForbiddenException if contact doesn't belong to user
   *
   * @example
   * ```graphql
   * query {
   *   emailDraft(contactId: "contact-123") {
   *     id
   *     subject
   *     bodyJson
   *     attachments
   *     lastSyncedAt
   *   }
   * }
   * ```
   */
  @Query(() => EmailDraft, { name: 'emailDraft', nullable: true })
  async getEmailDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Args('contactId', { type: () => ID }) contactId: string,
  ): Promise<EmailDraft | null> {
    this.logger.log(`Getting email draft for user ${user.id}, contact ${contactId}`);
    return this.emailDraftService.getDraftByContact(user.id, contactId);
  }

  /**
   * List all email drafts for the authenticated user
   *
   * Returns paginated list of email drafts sorted by update time.
   * Supports pagination via skip/take parameters.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param pagination - Optional pagination parameters (skip, take)
   * @returns EmailDraftConnection with drafts and pagination metadata
   *
   * @example
   * ```graphql
   * query {
   *   emailDrafts(pagination: { skip: 0, take: 10 }) {
   *     edges {
   *       id
   *       subject
   *       contact { name }
   *       updatedAt
   *     }
   *     pageInfo {
   *       hasNextPage
   *       total
   *     }
   *   }
   * }
   * ```
   */
  @Query(() => EmailDraftConnection, { name: 'emailDrafts' })
  async listEmailDrafts(
    @CurrentUser() user: AuthenticatedUser,
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<EmailDraftConnection> {
    this.logger.log(`Listing email drafts for user ${user.id}`);
    return this.emailDraftService.listDrafts(user.id, pagination);
  }

  /**
   * Get all email signatures for the authenticated user
   *
   * Returns signatures sorted alphabetically by name.
   * Maximum 10 signatures per user.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @returns Array of email signatures
   *
   * @example
   * ```graphql
   * query {
   *   emailSignatures {
   *     id
   *     name
   *     contentHtml
   *     isDefaultForFormal
   *     isDefaultForCasual
   *   }
   * }
   * ```
   */
  @Query(() => [EmailSignature], { name: 'emailSignatures' })
  async listEmailSignatures(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EmailSignature[]> {
    this.logger.log(`Listing email signatures for user ${user.id}`);
    return this.emailSignatureService.listSignatures(user.id);
  }

  /**
   * Get Gmail OAuth connection status
   *
   * Returns connection status without exposing tokens.
   * Shows if user has connected Gmail, email address, scopes, and expiry.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @returns GmailConnection status
   *
   * @example
   * ```graphql
   * query {
   *   gmailConnection {
   *     isConnected
   *     email
   *     scopes
   *     expiresAt
   *   }
   * }
   * ```
   */
  @Query(() => GmailConnection, { name: 'gmailConnection' })
  async getGmailConnection(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GmailConnection> {
    this.logger.log(`Getting Gmail connection status for user ${user.id}`);

    const status = await this.gmailOAuthService.getConnectionStatus(user.id);

    // Get scopes from gmailToken record if connected
    let scopes: string[] = [];
    let connectedAt: Date | null = null;

    if (status.connected) {
      const tokenRecord = await this.prisma.gmailToken.findUnique({
        where: { userId: user.id },
      });

      if (tokenRecord) {
        scopes = tokenRecord.scope;
        connectedAt = tokenRecord.createdAt;
      }
    }

    return {
      isConnected: status.connected,
      email: status.emailAddress,
      scopes,
      connectedAt,
      expiresAt: status.expiresAt,
    };
  }

  // ==================== EMAIL COMPOSITION MUTATIONS ====================

  /**
   * Auto-save email draft
   *
   * Creates or updates email draft for a contact with conflict detection.
   * Only one draft per user-contact pair. Auto-save has high rate limit (60/min).
   *
   * Rate limit: 60 requests per minute per user
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Draft content (contactId, subject, bodyJson, bodyHtml, attachments, signatureId)
   * @returns Created or updated EmailDraft
   * @throws NotFoundException if contact doesn't exist
   * @throws ForbiddenException if contact doesn't belong to user
   * @throws ConflictException if concurrent modification detected
   *
   * @example
   * ```graphql
   * mutation {
   *   autoSaveDraft(input: {
   *     contactId: "contact-123"
   *     subject: "Follow-up"
   *     bodyJson: { type: "doc", content: [] }
   *     lastSyncedAt: "2025-10-15T10:00:00Z"
   *   }) {
   *     id
   *     subject
   *     lastSyncedAt
   *   }
   * }
   * ```
   */
  @Mutation(() => EmailDraft)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async autoSaveDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { type: () => CreateDraftInput }) input: CreateDraftInput,
  ): Promise<EmailDraft> {
    this.logger.log(`Auto-saving draft for user ${user.id}, contact ${input.contactId}`);

    const updateInput: UpdateDraftInput = {
      subject: input.subject,
      bodyJson: input.bodyJson,
      bodyHtml: input.bodyHtml,
      attachments: input.attachments,
      signatureId: input.signatureId,
    };

    return this.emailDraftService.autoSaveDraft(user.id, input.contactId, updateInput);
  }

  /**
   * Delete email draft
   *
   * Deletes draft for a specific contact. S3 attachment cleanup handled by background job.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param contactId - Contact ID to delete draft for
   * @returns True if deleted, false if draft didn't exist
   * @throws NotFoundException if contact doesn't exist
   * @throws ForbiddenException if contact doesn't belong to user
   *
   * @example
   * ```graphql
   * mutation {
   *   deleteDraft(contactId: "contact-123")
   * }
   * ```
   */
  @Mutation(() => Boolean)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async deleteDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Args('contactId', { type: () => ID }) contactId: string,
  ): Promise<boolean> {
    this.logger.log(`Deleting draft for user ${user.id}, contact ${contactId}`);
    return this.emailDraftService.deleteDraft(user.id, contactId);
  }

  /**
   * Create email signature
   *
   * Creates new email signature with optional default flags.
   * Maximum 10 signatures per user. If default flags are set,
   * other signatures with same flag are automatically unset.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param input - Signature content and default flags
   * @returns Created EmailSignature
   * @throws BadRequestException if user already has 10 signatures
   *
   * @example
   * ```graphql
   * mutation {
   *   createSignature(input: {
   *     name: "Professional"
   *     contentJson: { type: "doc", content: [] }
   *     contentHtml: "<p>Best regards,<br>John Doe</p>"
   *     isDefaultForFormal: true
   *   }) {
   *     id
   *     name
   *     isDefaultForFormal
   *   }
   * }
   * ```
   */
  @Mutation(() => EmailSignature)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async createSignature(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input', { type: () => CreateSignatureInput }) input: CreateSignatureInput,
  ): Promise<EmailSignature> {
    this.logger.log(`Creating signature for user ${user.id}`);
    return this.emailSignatureService.createSignature(user.id, input);
  }

  /**
   * Update email signature
   *
   * Updates existing signature. If default flags are changed,
   * other signatures with same flag are automatically unset.
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Signature ID to update
   * @param input - Updated signature content and flags
   * @returns Updated EmailSignature
   * @throws NotFoundException if signature doesn't exist
   * @throws ForbiddenException if signature doesn't belong to user
   *
   * @example
   * ```graphql
   * mutation {
   *   updateSignature(
   *     id: "signature-123"
   *     input: {
   *       name: "Updated Professional"
   *       isGlobalDefault: true
   *     }
   *   ) {
   *     id
   *     name
   *     isGlobalDefault
   *   }
   * }
   * ```
   */
  @Mutation(() => EmailSignature)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async updateSignature(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateSignatureInput }) input: UpdateSignatureInput,
  ): Promise<EmailSignature> {
    this.logger.log(`Updating signature ${id} for user ${user.id}`);
    return this.emailSignatureService.updateSignature(user.id, id, input);
  }

  /**
   * Delete email signature
   *
   * Deletes signature and sets all drafts using it to null (referential integrity).
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param id - Signature ID to delete
   * @returns True if deleted successfully
   * @throws NotFoundException if signature doesn't exist
   * @throws ForbiddenException if signature doesn't belong to user
   *
   * @example
   * ```graphql
   * mutation {
   *   deleteSignature(id: "signature-123")
   * }
   * ```
   */
  @Mutation(() => Boolean)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  async deleteSignature(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    this.logger.log(`Deleting signature ${id} for user ${user.id}`);
    return this.emailSignatureService.deleteSignature(user.id, id);
  }

  // ==================== EMAIL SEND MUTATIONS ====================
  // Email sending features (sendEmail, sendBulkCampaign, polishDraft) are documented in:
  // - Product roadmap: .agent-os/product/roadmap.md (Phase 2)
  // - Email composition spec: .agent-os/specs/2025-10-10-langchain-ai-email-generation/
  // Implementation tracked in roadmap Phase 2 tasks
}
