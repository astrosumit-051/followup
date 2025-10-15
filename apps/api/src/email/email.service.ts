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
