import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSignatureInput } from './dto/create-signature.input';
import { UpdateSignatureInput } from './dto/update-signature.input';
import { EmailSignature } from './entities/email-signature.entity';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class EmailSignatureService {
  constructor(private prisma: PrismaService) {}

  /**
   * Sanitize HTML content to prevent XSS attacks
   *
   * Allows safe HTML tags for email signatures while stripping
   * potentially dangerous elements and attributes.
   *
   * Allowed tags: basic formatting (b, i, em, strong, u, s, sub, sup),
   * paragraphs, line breaks, lists, links, images (for logos)
   *
   * @param html - Raw HTML content from user input
   * @returns Sanitized HTML safe for storage and rendering
   */
  private sanitizeHtmlContent(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [
        'b', 'i', 'em', 'strong', 'u', 's', 'sub', 'sup',
        'p', 'br', 'ul', 'ol', 'li',
        'a', 'img', 'span', 'div',
      ],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
        'img': ['src', 'alt', 'width', 'height', 'style'],
        'span': ['style'],
        'div': ['style'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'data'], // data: for inline images
      allowedStyles: {
        '*': {
          'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/],
          'font-size': [/^\d+(?:px|em|%)$/],
          'font-weight': [/^bold|normal$/],
          'text-align': [/^left|right|center$/],
        },
      },
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
   * Unset existing default flags before setting a new default
   *
   * Ensures only one signature can have each default flag type.
   * Prevents multiple signatures from being marked as the same default.
   *
   * @param userId - ID of the authenticated user
   * @param input - Signature input with default flags
   * @param excludeId - Optional signature ID to exclude from update (for updates)
   */
  private async unsetDefaultFlags(
    userId: string,
    input: { isGlobalDefault?: boolean; isDefaultForFormal?: boolean; isDefaultForCasual?: boolean },
    excludeId?: string,
  ): Promise<void> {
    const updates: Promise<any>[] = [];

    if (input.isGlobalDefault) {
      updates.push(
        this.prisma.emailSignature.updateMany({
          where: {
            userId,
            isGlobalDefault: true,
            ...(excludeId && { id: { not: excludeId } }),
          },
          data: {
            isGlobalDefault: false,
          },
        }),
      );
    }

    if (input.isDefaultForFormal) {
      updates.push(
        this.prisma.emailSignature.updateMany({
          where: {
            userId,
            isDefaultForFormal: true,
            ...(excludeId && { id: { not: excludeId } }),
          },
          data: {
            isDefaultForFormal: false,
          },
        }),
      );
    }

    if (input.isDefaultForCasual) {
      updates.push(
        this.prisma.emailSignature.updateMany({
          where: {
            userId,
            isDefaultForCasual: true,
            ...(excludeId && { id: { not: excludeId } }),
          },
          data: {
            isDefaultForCasual: false,
          },
        }),
      );
    }

    // Execute all updates in parallel
    await Promise.all(updates);
  }

  /**
   * Create new email signature
   *
   * Enforces max 10 signatures per user. If default flags are set,
   * unsets other signatures with the same flag to prevent conflicts.
   *
   * @param userId - ID of the authenticated user
   * @param input - Signature content and default flags
   * @returns Created EmailSignature
   * @throws BadRequestException if user already has 10 signatures
   */
  async createSignature(
    userId: string,
    input: CreateSignatureInput,
  ): Promise<EmailSignature> {
    // Check if user already has 10 signatures
    const count = await this.prisma.emailSignature.count({
      where: { userId },
    });

    if (count >= 10) {
      throw new BadRequestException('You cannot have more than 10 signatures');
    }

    // If this is the first signature and no default flags are set, make it global default
    const isFirstSignature = count === 0;
    const hasNoDefaultFlags = !input.isGlobalDefault && !input.isDefaultForFormal && !input.isDefaultForCasual;
    const shouldSetGlobalDefault = isFirstSignature && hasNoDefaultFlags;

    // Sanitize HTML content to prevent XSS attacks
    const sanitizedContentHtml = input.contentHtml ? this.sanitizeHtmlContent(input.contentHtml) : '';

    // Wrap in transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // Unset other default flags if setting new defaults
      if (input.isGlobalDefault) {
        await tx.emailSignature.updateMany({
          where: {
            userId,
            isGlobalDefault: true,
          },
          data: {
            isGlobalDefault: false,
          },
        });
      }

      if (input.isDefaultForFormal) {
        await tx.emailSignature.updateMany({
          where: {
            userId,
            isDefaultForFormal: true,
          },
          data: {
            isDefaultForFormal: false,
          },
        });
      }

      if (input.isDefaultForCasual) {
        await tx.emailSignature.updateMany({
          where: {
            userId,
            isDefaultForCasual: true,
          },
          data: {
            isDefaultForCasual: false,
          },
        });
      }

      // Create signature
      return tx.emailSignature.create({
        data: {
          userId,
          name: input.name,
          contentJson: input.contentJson,
          contentHtml: sanitizedContentHtml,
          isDefaultForFormal: input.isDefaultForFormal ?? false,
          isDefaultForCasual: input.isDefaultForCasual ?? false,
          isGlobalDefault: shouldSetGlobalDefault ? true : (input.isGlobalDefault ?? false),
          usageCount: 0,
        },
      }) as unknown as EmailSignature;
    });
  }

  /**
   * Update existing email signature
   *
   * Validates user owns the signature. If default flags are changed,
   * unsets other signatures with the same flag.
   *
   * @param userId - ID of the authenticated user
   * @param signatureId - ID of the signature to update
   * @param input - Updated signature content and flags
   * @returns Updated EmailSignature
   * @throws NotFoundException if signature doesn't exist
   * @throws ForbiddenException if signature doesn't belong to user
   */
  async updateSignature(
    userId: string,
    signatureId: string,
    input: UpdateSignatureInput,
  ): Promise<EmailSignature> {
    // Verify signature exists and belongs to user
    const signature = await this.prisma.emailSignature.findUnique({
      where: { id: signatureId },
    });

    if (!signature) {
      throw new NotFoundException(`Signature with ID ${signatureId} not found`);
    }

    if (signature.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this signature');
    }

    // Sanitize HTML content to prevent XSS attacks
    const sanitizedContentHtml = input.contentHtml ? this.sanitizeHtmlContent(input.contentHtml) : undefined;

    // Wrap in transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // Unset other default flags if setting new defaults (excluding current signature)
      if (input.isGlobalDefault) {
        await tx.emailSignature.updateMany({
          where: {
            userId,
            isGlobalDefault: true,
            id: { not: signatureId },
          },
          data: {
            isGlobalDefault: false,
          },
        });
      }

      if (input.isDefaultForFormal) {
        await tx.emailSignature.updateMany({
          where: {
            userId,
            isDefaultForFormal: true,
            id: { not: signatureId },
          },
          data: {
            isDefaultForFormal: false,
          },
        });
      }

      if (input.isDefaultForCasual) {
        await tx.emailSignature.updateMany({
          where: {
            userId,
            isDefaultForCasual: true,
            id: { not: signatureId },
          },
          data: {
            isDefaultForCasual: false,
          },
        });
      }

      // Update signature
      return tx.emailSignature.update({
        where: { id: signatureId },
        data: {
          name: input.name,
          contentJson: input.contentJson,
          contentHtml: sanitizedContentHtml,
          isDefaultForFormal: input.isDefaultForFormal,
          isDefaultForCasual: input.isDefaultForCasual,
          isGlobalDefault: input.isGlobalDefault,
        },
      }) as unknown as EmailSignature;
    });
  }

  /**
   * List all signatures for user
   *
   * Returns signatures sorted alphabetically by name.
   *
   * @param userId - ID of the authenticated user
   * @returns Array of EmailSignature sorted by name
   */
  async listSignatures(userId: string): Promise<EmailSignature[]> {
    return this.prisma.emailSignature.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    }) as unknown as EmailSignature[];
  }

  /**
   * Get signature by ID
   *
   * Validates user owns the signature.
   *
   * @param userId - ID of the authenticated user
   * @param signatureId - ID of the signature to retrieve
   * @returns EmailSignature
   * @throws NotFoundException if signature doesn't exist
   * @throws ForbiddenException if signature doesn't belong to user
   */
  async getSignatureById(userId: string, signatureId: string): Promise<EmailSignature> {
    const signature = await this.prisma.emailSignature.findUnique({
      where: { id: signatureId },
    });

    if (!signature) {
      throw new NotFoundException(`Signature with ID ${signatureId} not found`);
    }

    if (signature.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this signature');
    }

    return signature as unknown as EmailSignature;
  }

  /**
   * Delete email signature
   *
   * Sets all drafts using this signature to null (referential integrity).
   * Validates user owns the signature.
   *
   * @param userId - ID of the authenticated user
   * @param signatureId - ID of the signature to delete
   * @returns true if deleted
   * @throws NotFoundException if signature doesn't exist
   * @throws ForbiddenException if signature doesn't belong to user
   */
  async deleteSignature(userId: string, signatureId: string): Promise<boolean> {
    // Verify signature exists and belongs to user
    const signature = await this.prisma.emailSignature.findUnique({
      where: { id: signatureId },
    });

    if (!signature) {
      throw new NotFoundException(`Signature with ID ${signatureId} not found`);
    }

    if (signature.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this signature');
    }

    // Set all drafts using this signature to null (referential integrity)
    await this.prisma.emailDraft.updateMany({
      where: { signatureId },
      data: { signatureId: null },
    });

    // Delete signature
    await this.prisma.emailSignature.delete({
      where: { id: signatureId },
    });

    return true;
  }

  /**
   * Get default signature with context-based selection
   *
   * Selects signature based on context:
   * - FORMAL: Returns formal default, falls back to global default
   * - CASUAL: Returns casual default, falls back to global default
   * - undefined: Returns global default
   *
   * @param userId - ID of the authenticated user
   * @param context - Email context (FORMAL or CASUAL)
   * @returns EmailSignature or null if no default found
   */
  async getDefaultSignature(
    userId: string,
    context?: 'FORMAL' | 'CASUAL',
  ): Promise<EmailSignature | null> {
    // Try context-specific default first
    if (context === 'FORMAL') {
      const formalDefault = await this.prisma.emailSignature.findFirst({
        where: {
          userId,
          isDefaultForFormal: true,
        },
      });

      if (formalDefault) {
        return formalDefault as unknown as EmailSignature;
      }
    }

    if (context === 'CASUAL') {
      const casualDefault = await this.prisma.emailSignature.findFirst({
        where: {
          userId,
          isDefaultForCasual: true,
        },
      });

      if (casualDefault) {
        return casualDefault as unknown as EmailSignature;
      }
    }

    // Fallback to global default
    const globalDefault = await this.prisma.emailSignature.findFirst({
      where: {
        userId,
        isGlobalDefault: true,
      },
    });

    return globalDefault as unknown as EmailSignature | null;
  }
}
