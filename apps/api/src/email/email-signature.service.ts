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

@Injectable()
export class EmailSignatureService {
  constructor(private prisma: PrismaService) {}

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

    // Unset other default flags if setting new defaults
    if (input.isGlobalDefault) {
      await this.prisma.emailSignature.updateMany({
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
      await this.prisma.emailSignature.updateMany({
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
      await this.prisma.emailSignature.updateMany({
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
    return this.prisma.emailSignature.create({
      data: {
        userId,
        name: input.name,
        contentJson: input.contentJson,
        contentHtml: input.contentHtml,
        isDefaultForFormal: input.isDefaultForFormal ?? false,
        isDefaultForCasual: input.isDefaultForCasual ?? false,
        isGlobalDefault: input.isGlobalDefault ?? false,
        usageCount: 0,
      },
    }) as unknown as EmailSignature;
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

    // Unset other default flags if setting new defaults
    if (input.isGlobalDefault) {
      await this.prisma.emailSignature.updateMany({
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
      await this.prisma.emailSignature.updateMany({
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
      await this.prisma.emailSignature.updateMany({
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
    return this.prisma.emailSignature.update({
      where: { id: signatureId },
      data: {
        name: input.name,
        contentJson: input.contentJson,
        contentHtml: input.contentHtml,
        isDefaultForFormal: input.isDefaultForFormal,
        isDefaultForCasual: input.isDefaultForCasual,
        isGlobalDefault: input.isGlobalDefault,
      },
    }) as unknown as EmailSignature;
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
