import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Email, ConversationHistory, EmailStatus, TemplateType, Direction } from '@relationhub/database';

export interface CreateEmailDto {
  userId: string;
  contactId: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  status?: EmailStatus;
  templateType?: TemplateType;
  providerId?: string;
  tokensUsed?: number;
}

export interface UpdateEmailDto {
  subject?: string;
  body?: string;
  bodyHtml?: string;
  status?: EmailStatus;
}

export interface FindEmailsDto {
  skip: number;
  take: number;
  contactId?: string;
  status?: EmailStatus;
}

export interface CreateConversationEntryDto {
  userId: string;
  contactId: string;
  emailId?: string;
  content: string;
  direction: Direction;
  metadata?: any;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new email draft
   * @param createDto - Email creation data
   * @returns Created email
   */
  async createEmail(createDto: CreateEmailDto): Promise<Email> {
    this.logger.log(`Creating email for contact ${createDto.contactId}`);

    try {
      const email = await this.prisma.email.create({
        data: {
          ...createDto,
          status: createDto.status || EmailStatus.DRAFT,
          generatedAt: new Date(),
          sentAt: createDto.status === EmailStatus.SENT ? new Date() : null,
        },
      });

      this.logger.log(`Email created successfully: ${email.id}`);
      return email;
    } catch (error) {
      this.logger.error(`Failed to create email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Retrieves emails for a user with pagination and optional filters
   * @param userId - User ID
   * @param options - Pagination and filter options
   * @returns Paginated emails
   */
  async findUserEmails(
    userId: string,
    options: FindEmailsDto
  ): Promise<{ emails: Email[]; total: number; skip: number; take: number }> {
    this.logger.log(`Finding emails for user ${userId}`);

    const where: any = { userId };

    if (options.contactId) {
      where.contactId = options.contactId;
    }

    if (options.status) {
      where.status = options.status;
    }

    try {
      const [emails, total] = await Promise.all([
        this.prisma.email.findMany({
          where,
          skip: options.skip,
          take: options.take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.email.count({ where }),
      ]);

      this.logger.log(`Found ${total} emails for user ${userId}`);

      return {
        emails,
        total,
        skip: options.skip,
        take: options.take,
      };
    } catch (error) {
      this.logger.error(`Failed to find emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Finds a single email by ID with ownership verification
   * @param emailId - Email ID
   * @param userId - User ID (for authorization)
   * @returns Email if found and owned by user, null otherwise
   */
  async findEmailById(emailId: string, userId: string): Promise<Email | null> {
    this.logger.log(`Finding email ${emailId} for user ${userId}`);

    try {
      const email = await this.prisma.email.findUnique({
        where: { id: emailId },
      });

      // Return null if email doesn't exist or user doesn't own it
      if (!email || email.userId !== userId) {
        return null;
      }

      return email;
    } catch (error) {
      this.logger.error(`Failed to find email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Finds all email templates for a user
   * @param userId - User ID
   * @returns Array of email templates owned by the user
   */
  async findTemplatesByUserId(userId: string): Promise<any[]> {
    this.logger.log(`Finding email templates for user ${userId}`);

    try {
      const templates = await this.prisma.emailTemplate.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' }, // Default templates first
          { usageCount: 'desc' }, // Then by popularity
          { createdAt: 'desc' }, // Then by creation date
        ],
      });

      this.logger.log(`Found ${templates.length} templates for user ${userId}`);
      return templates;
    } catch (error) {
      this.logger.error(`Failed to find templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Creates a new email template
   * If isDefault is true, sets all other templates for this user to isDefault=false
   * @param userId - User ID
   * @param templateData - Template data
   * @returns Created template
   */
  async createTemplate(
    userId: string,
    templateData: {
      name: string;
      subject: string;
      body: string;
      bodyHtml?: string | null;
      isDefault?: boolean;
      category?: string | null;
    }
  ): Promise<any> {
    this.logger.log(`Creating email template for user ${userId}`);

    try {
      // If this template is being set as default, unset all other defaults for this user
      if (templateData.isDefault) {
        await this.prisma.emailTemplate.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });

        this.logger.log(`Unset previous default templates for user ${userId}`);
      }

      // Create the new template
      const template = await this.prisma.emailTemplate.create({
        data: {
          userId,
          name: templateData.name,
          subject: templateData.subject,
          body: templateData.body,
          bodyHtml: templateData.bodyHtml || null,
          isDefault: templateData.isDefault || false,
          category: templateData.category || null,
          usageCount: 0,
        },
      });

      this.logger.log(`Email template created: ${template.id}`);
      return template;
    } catch (error) {
      this.logger.error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Updates an existing email template
   * If isDefault is set to true, unsets all other default templates for the user
   * @param templateId - Template ID
   * @param userId - User ID (for authorization)
   * @param updateData - Update data
   * @returns Updated template
   */
  async updateTemplate(
    templateId: string,
    userId: string,
    updateData: {
      name?: string;
      subject?: string;
      body?: string;
      bodyHtml?: string | null;
      isDefault?: boolean;
      category?: string | null;
    }
  ): Promise<any> {
    this.logger.log(`Updating template ${templateId}`);

    // Check if template exists and user owns it
    const existingTemplate = await this.prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    if (existingTemplate.userId !== userId) {
      throw new ForbiddenException('Unauthorized to update this template');
    }

    try {
      // If setting this as default, unset all other defaults first
      if (updateData.isDefault === true) {
        await this.prisma.emailTemplate.updateMany({
          where: {
            userId,
            isDefault: true,
            id: { not: templateId }, // Exclude current template
          },
          data: {
            isDefault: false,
          },
        });

        this.logger.log(`Unset previous default templates for user ${userId}`);
      }

      // Update the template
      const updatedTemplate = await this.prisma.emailTemplate.update({
        where: { id: templateId },
        data: updateData,
      });

      this.logger.log(`Template ${templateId} updated successfully`);
      return updatedTemplate;
    } catch (error) {
      this.logger.error(`Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Deletes an email template
   * @param templateId - Template ID
   * @param userId - User ID (for authorization)
   */
  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting template ${templateId}`);

    // Check if template exists and user owns it
    const existingTemplate = await this.prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    if (existingTemplate.userId !== userId) {
      throw new ForbiddenException('Unauthorized to delete this template');
    }

    try {
      await this.prisma.emailTemplate.delete({
        where: { id: templateId },
      });

      this.logger.log(`Template ${templateId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Updates an email (only drafts can be updated)
   * @param emailId - Email ID
   * @param userId - User ID (for authorization)
   * @param updateDto - Update data
   * @returns Updated email
   */
  async updateEmail(
    emailId: string,
    userId: string,
    updateDto: UpdateEmailDto
  ): Promise<Email> {
    this.logger.log(`Updating email ${emailId}`);

    // Check if email exists and user owns it
    const existingEmail = await this.prisma.email.findUnique({
      where: { id: emailId },
    });

    if (!existingEmail) {
      throw new NotFoundException('Email not found');
    }

    if (existingEmail.userId !== userId) {
      throw new ForbiddenException('Unauthorized to update this email');
    }

    // Only allow updating draft emails
    if (existingEmail.status !== EmailStatus.DRAFT) {
      throw new BadRequestException('Only draft emails can be updated');
    }

    try {
      const updatedEmail = await this.prisma.email.update({
        where: { id: emailId },
        data: updateDto,
      });

      this.logger.log(`Email ${emailId} updated successfully`);
      return updatedEmail;
    } catch (error) {
      this.logger.error(`Failed to update email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Deletes an email
   * @param emailId - Email ID
   * @param userId - User ID (for authorization)
   */
  async deleteEmail(emailId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting email ${emailId}`);

    // Check if email exists and user owns it
    const existingEmail = await this.prisma.email.findUnique({
      where: { id: emailId },
    });

    if (!existingEmail) {
      throw new NotFoundException('Email not found');
    }

    if (existingEmail.userId !== userId) {
      throw new ForbiddenException('Unauthorized to delete this email');
    }

    try {
      await this.prisma.email.delete({
        where: { id: emailId },
      });

      this.logger.log(`Email ${emailId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Retrieves conversation history for a contact
   * @param userId - User ID
   * @param contactId - Contact ID
   * @param limit - Maximum number of entries to return (default: 5)
   * @returns Conversation history entries
   */
  async getConversationHistory(
    userId: string,
    contactId: string,
    limit: number = 5
  ): Promise<ConversationHistory[]> {
    this.logger.log(`Getting conversation history for contact ${contactId}`);

    try {
      const history = await this.prisma.conversationHistory.findMany({
        where: {
          userId,
          contactId,
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      this.logger.log(`Found ${history.length} conversation entries`);
      return history;
    } catch (error) {
      this.logger.error(
        `Failed to get conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  /**
   * Creates a conversation history entry
   * @param createDto - Conversation entry data
   * @returns Created conversation entry
   */
  async createConversationEntry(
    createDto: CreateConversationEntryDto
  ): Promise<ConversationHistory> {
    this.logger.log(`Creating conversation entry for contact ${createDto.contactId}`);

    try {
      const entry = await this.prisma.conversationHistory.create({
        data: createDto,
      });

      this.logger.log(`Conversation entry created: ${entry.id}`);
      return entry;
    } catch (error) {
      this.logger.error(
        `Failed to create conversation entry: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }
}
