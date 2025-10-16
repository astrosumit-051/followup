import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDraftInput } from './dto/update-draft.input';
import { EmailDraft } from './entities/email-draft.entity';
import { EmailDraftConnection } from './dto/email-draft-connection.output';
import { PaginationInput, DraftSortField, SortOrder } from './dto/pagination.input';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class EmailDraftService {
  constructor(private prisma: PrismaService) {}

  /**
   * Sanitize HTML content to prevent XSS attacks
   *
   * Allows safe HTML tags for email composition while stripping
   * potentially dangerous elements and attributes.
   *
   * Allowed tags: basic formatting (b, i, em, strong, u, s, sub, sup),
   * paragraphs, line breaks, lists, headings, links, code blocks
   *
   * @param html - Raw HTML content from user input
   * @returns Sanitized HTML safe for storage and rendering
   */
  private sanitizeHtmlContent(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [
        'b', 'i', 'em', 'strong', 'u', 's', 'sub', 'sup',
        'p', 'br', 'ul', 'ol', 'li', 'blockquote',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'a', 'code', 'pre', 'hr',
      ],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      // Automatically add rel="noopener noreferrer" to external links
      transformTags: {
        'a': (tagName, attribs) => {
          return {
            tagName: 'a',
            attribs: {
              ...attribs,
              rel: 'noopener noreferrer',
              target: attribs.target || '_blank',
            },
          };
        },
      },
    });
  }

  /**
   * Auto-save email draft (create or update)
   *
   * Implements upsert pattern with conflict detection using lastSyncedAt.
   * Validates user owns the contact before allowing save.
   *
   * @param userId - ID of the authenticated user
   * @param contactId - ID of the contact this draft is for
   * @param input - Draft content (subject, bodyJson, bodyHtml, attachments, signatureId)
   * @returns Created or updated EmailDraft
   * @throws NotFoundException if contact doesn't exist
   * @throws ForbiddenException if contact doesn't belong to user
   * @throws ConflictException if concurrent modification detected
   */
  async autoSaveDraft(
    userId: string,
    contactId: string,
    input: UpdateDraftInput,
  ): Promise<EmailDraft> {
    // Verify contact exists and belongs to user
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    if (contact.userId !== userId) {
      throw new ForbiddenException('You do not have permission to create a draft for this contact');
    }

    // Check if draft already exists
    const existingDraft = await this.prisma.emailDraft.findUnique({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
    });

    // Conflict detection: check if lastSyncedAt is older than existing draft
    if (existingDraft && input.lastSyncedAt) {
      if (existingDraft.lastSyncedAt && input.lastSyncedAt < existingDraft.lastSyncedAt) {
        throw new ConflictException(
          'Draft has been modified by another client. Please refresh and try again.',
        );
      }
    }

    // Prepare draft data (ensure bodyJson is not undefined)
    // Sanitize bodyHtml to prevent XSS attacks
    const sanitizedBodyHtml = input.bodyHtml ? this.sanitizeHtmlContent(input.bodyHtml) : '';

    const draftData = {
      subject: input.subject ?? '',
      bodyJson: input.bodyJson ?? { type: 'doc', content: [] },
      bodyHtml: sanitizedBodyHtml,
      attachments: input.attachments ?? [],
      signatureId: input.signatureId ?? null,
      lastSyncedAt: input.lastSyncedAt ?? new Date(),
    };

    if (existingDraft) {
      // Update existing draft
      return this.prisma.emailDraft.update({
        where: {
          userId_contactId: {
            userId,
            contactId,
          },
        },
        data: draftData,
        include: {
          user: true,
          contact: true,
          signature: true,
        },
      }) as unknown as EmailDraft;
    } else {
      // Create new draft
      return this.prisma.emailDraft.create({
        data: {
          userId,
          contactId,
          ...draftData,
        },
        include: {
          user: true,
          contact: true,
          signature: true,
        },
      }) as unknown as EmailDraft;
    }
  }

  /**
   * Get email draft for specific contact
   *
   * Returns draft if exists, null otherwise.
   * Validates user owns the contact.
   *
   * @param userId - ID of the authenticated user
   * @param contactId - ID of the contact to get draft for
   * @returns EmailDraft or null if no draft exists
   * @throws NotFoundException if contact doesn't exist
   * @throws ForbiddenException if contact doesn't belong to user
   */
  async getDraftByContact(
    userId: string,
    contactId: string,
  ): Promise<EmailDraft | null> {
    // Verify contact exists and belongs to user
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    if (contact.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view drafts for this contact');
    }

    const draft = await this.prisma.emailDraft.findUnique({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
      include: {
        user: true,
        contact: true,
        signature: true,
      },
    });

    return draft as unknown as EmailDraft | null;
  }

  /**
   * List all email drafts for user with pagination and sorting
   *
   * @param userId - ID of the authenticated user
   * @param pagination - Pagination options (skip, take)
   * @param sortBy - Field to sort by (UPDATED_AT, CREATED_AT, CONTACT_NAME)
   * @param sortOrder - Sort order (ASC or DESC)
   * @returns EmailDraftConnection with edges and pageInfo
   */
  async listDrafts(
    userId: string,
    pagination: PaginationInput = { skip: 0, take: 10 },
    sortBy: DraftSortField = DraftSortField.UPDATED_AT,
    sortOrder: SortOrder = SortOrder.DESC,
  ): Promise<EmailDraftConnection> {
    const { skip = 0, take = 10 } = pagination;

    // Determine sort field
    let orderBy: any;
    switch (sortBy) {
      case DraftSortField.UPDATED_AT:
        orderBy = { updatedAt: sortOrder.toLowerCase() };
        break;
      case DraftSortField.CREATED_AT:
        orderBy = { createdAt: sortOrder.toLowerCase() };
        break;
      case DraftSortField.CONTACT_NAME:
        orderBy = { contact: { name: sortOrder.toLowerCase() } };
        break;
      default:
        orderBy = { updatedAt: 'desc' };
    }

    // Fetch drafts
    const drafts = await this.prisma.emailDraft.findMany({
      where: { userId },
      skip,
      take,
      orderBy,
      include: {
        user: true,
        contact: true,
        signature: true,
      },
    });

    // Get total count
    const total = await this.prisma.emailDraft.count({
      where: { userId },
    });

    // Determine if there are more results
    const hasNextPage = skip + take < total;

    return {
      edges: drafts as unknown as EmailDraft[],
      pageInfo: {
        hasNextPage,
        total,
      },
    };
  }

  /**
   * Delete email draft
   *
   * Removes draft from database. S3 attachment cleanup is handled by background job.
   * Validates user owns the contact.
   *
   * @param userId - ID of the authenticated user
   * @param contactId - ID of the contact to delete draft for
   * @returns true if deleted, false if draft didn't exist
   * @throws NotFoundException if contact doesn't exist
   * @throws ForbiddenException if contact doesn't belong to user
   */
  async deleteDraft(userId: string, contactId: string): Promise<boolean> {
    // Verify contact exists and belongs to user
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    if (contact.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete drafts for this contact');
    }

    // Check if draft exists
    const draft = await this.prisma.emailDraft.findUnique({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
    });

    if (!draft) {
      return false;
    }

    // Delete draft
    await this.prisma.emailDraft.delete({
      where: {
        userId_contactId: {
          userId,
          contactId,
        },
      },
    });

    // Note: S3 attachment cleanup will be handled by background job in future implementation
    // For now, we just delete the database record

    return true;
  }
}
