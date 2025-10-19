import { Injectable, BadRequestException, ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

/**
 * Attachment Service
 *
 * Handles file upload and deletion via AWS S3:
 * - Generates presigned URLs for direct browser uploads
 * - Validates file types against whitelist
 * - Validates file sizes (≤25MB)
 * - Manages S3 keys with user isolation (userId/attachments/uuid.ext)
 * - Provides cleanup for orphaned attachments (>30 days old)
 *
 * Security Features:
 * - File type whitelist (PDF, DOC, DOCX, XLS, XLSX, PNG, JPEG only)
 * - File size limits (25MB)
 * - User authorization checks for deletion
 * - 15-minute expiry on presigned URLs
 */
@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);
  private s3Client: S3Client;
  private bucketName: string;

  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
  private readonly PRESIGNED_URL_EXPIRY = 15 * 60; // 15 minutes in seconds (900)
  private readonly ORPHAN_AGE_DAYS = 30;

  private readonly ALLOWED_CONTENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
  ];

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('S3_BUCKET')!;

    // Validate all required AWS credentials are present
    if (!region || !accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error(
        'Missing required AWS S3 configuration. Please set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET environment variables.',
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Generate presigned URL for file upload
   *
   * Workflow:
   * 1. Validate file type against whitelist
   * 2. Validate file size (≤25MB)
   * 3. Generate S3 key: userId/attachments/uuid.extension
   * 4. Create presigned PUT URL with 60-minute expiry
   * 5. Return URL, key, and expiry timestamp
   *
   * @param userId - ID of the authenticated user
   * @param filename - Original filename
   * @param contentType - MIME type of the file
   * @param fileSize - Size of the file in bytes
   * @returns Presigned upload URL, S3 key, and expiry timestamp
   */
  async generatePresignedUploadUrl(
    userId: string,
    filename: string,
    contentType: string,
    fileSize: number,
  ): Promise<{ uploadUrl: string; key: string; expiresAt: Date }> {
    // Validate file type
    if (!this.isValidContentType(contentType)) {
      throw new BadRequestException('File type not allowed');
    }

    // Validate file size
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 25MB limit');
    }

    // Generate unique S3 key
    const extension = this.getFileExtension(filename);
    const uuid = randomUUID();
    const key = `${userId}/attachments/${uuid}${extension}`;

    try {
      // Create presigned URL for PUT operation
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.PRESIGNED_URL_EXPIRY,
      });

      const expiresAt = new Date(Date.now() + this.PRESIGNED_URL_EXPIRY * 1000);

      this.logger.log(`Generated presigned upload URL for user ${userId}: ${key}`);

      return {
        uploadUrl,
        key,
        expiresAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned upload URL for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to generate upload URL. Please try again.');
    }
  }

  /**
   * Delete attachment from S3
   *
   * Security:
   * - Verifies user owns the attachment by checking key prefix
   * - Only allows deletion if key starts with userId/
   *
   * @param userId - ID of the authenticated user
   * @param key - S3 key of the attachment to delete
   * @returns True if deletion successful
   */
  async deleteAttachment(userId: string, key: string): Promise<boolean> {
    // Verify user owns this attachment
    if (!key.startsWith(`${userId}/`)) {
      throw new ForbiddenException('You do not have permission to delete this attachment');
    }

    try {
      await this.deleteFromS3(key);
      this.logger.log(`Successfully deleted attachment for user ${userId}: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete attachment ${key} for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete attachment. Please try again.');
    }
  }

  /**
   * Cleanup orphaned attachments
   *
   * Background job that:
   * 1. Queries database for all active attachment keys (from drafts and sent emails)
   * 2. Lists all objects in S3 bucket
   * 3. Identifies attachments that are both old (>30 days) AND not referenced in database
   * 4. Batch deletes truly orphaned attachments
   *
   * Important: Preserves attachments referenced in sent emails and drafts indefinitely
   *
   * @returns Count of deleted attachments
   */
  async cleanupOrphanedAttachments(): Promise<{ deletedCount: number }> {
    try {
      // Step 1: Get all active attachment keys from database
      const activeKeys = await this.getActiveAttachmentKeys();

      // Step 2: List all S3 objects
      const objects = await this.listS3Objects();

      if (!objects.Contents || objects.Contents.length === 0) {
        this.logger.log('No S3 objects found during cleanup');
        return { deletedCount: 0 };
      }

      // Step 3: Find truly orphaned attachments (old AND not in database)
      const orphanedKeys = objects.Contents
        .filter((obj: any) => {
          const key = obj.Key!;
          const lastModified = obj.LastModified!;

          // Must be both old AND not referenced in database
          const isOld = this.isOrphanedAttachment(lastModified);
          const isNotReferenced = !activeKeys.has(key);

          return isOld && isNotReferenced;
        })
        .map((obj: any) => obj.Key!)
        .filter((key: string | undefined) => key !== undefined);

      if (orphanedKeys.length === 0) {
        this.logger.log('No orphaned attachments found during cleanup');
        return { deletedCount: 0 };
      }

      // Step 4: Delete orphaned objects
      await this.deleteS3Objects(orphanedKeys);

      this.logger.log(`Successfully cleaned up ${orphanedKeys.length} orphaned attachments`);
      return { deletedCount: orphanedKeys.length };
    } catch (error) {
      this.logger.error(`Failed to cleanup orphaned attachments: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to cleanup orphaned attachments');
    }
  }

  /**
   * Get all active attachment keys from database
   *
   * Queries EmailDraft and Email tables to extract all attachment keys
   * that are currently referenced. These attachments should never be deleted.
   *
   * @returns Set of active S3 keys
   */
  private async getActiveAttachmentKeys(): Promise<Set<string>> {
    const activeKeys = new Set<string>();

    // Get all draft attachments
    const drafts = await this.prisma.emailDraft.findMany({
      select: {
        attachments: true,
      },
    });

    for (const draft of drafts) {
      if (Array.isArray(draft.attachments)) {
        for (const attachment of draft.attachments) {
          // Each attachment is { key, filename, size, contentType, s3Url }
          if (attachment && typeof attachment === 'object' && 'key' in attachment) {
            activeKeys.add(attachment.key as string);
          }
        }
      }
    }

    // Get all email attachments (especially sent emails which should be preserved)
    const emails = await this.prisma.email.findMany({
      select: {
        attachments: true,
      },
    });

    for (const email of emails) {
      if (Array.isArray(email.attachments)) {
        for (const attachment of email.attachments) {
          // Each attachment is { key, filename, size, contentType, s3Url }
          if (attachment && typeof attachment === 'object' && 'key' in attachment) {
            activeKeys.add(attachment.key as string);
          }
        }
      }
    }

    return activeKeys;
  }

  /**
   * Extract file extension from filename
   *
   * @param filename - Original filename
   * @returns File extension including dot (e.g., ".pdf") or empty string
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return filename.substring(lastDotIndex);
  }

  /**
   * Validate content type against whitelist
   *
   * Allowed types:
   * - PDF: application/pdf
   * - DOC: application/msword
   * - DOCX: application/vnd.openxmlformats-officedocument.wordprocessingml.document
   * - XLS: application/vnd.ms-excel
   * - XLSX: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   * - PNG: image/png
   * - JPEG: image/jpeg
   *
   * @param contentType - MIME type to validate
   * @returns True if content type is allowed
   */
  private isValidContentType(contentType: string): boolean {
    return this.ALLOWED_CONTENT_TYPES.includes(contentType);
  }

  /**
   * Check if attachment is orphaned (>30 days old)
   *
   * @param lastModified - Last modified date from S3 object
   * @returns True if attachment is older than 30 days
   */
  private isOrphanedAttachment(lastModified: Date): boolean {
    const ageInMilliseconds = Date.now() - lastModified.getTime();
    const ageInDays = ageInMilliseconds / (1000 * 60 * 60 * 24);
    return ageInDays > this.ORPHAN_AGE_DAYS;
  }

  /**
   * Delete single object from S3
   *
   * @param key - S3 key to delete
   * @throws InternalServerErrorException if S3 deletion fails
   */
  private async deleteFromS3(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Failed to delete S3 object ${key}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to delete S3 object: ${key}`);
    }
  }

  /**
   * List all objects in S3 bucket with pagination
   *
   * Iterates through all pages using ContinuationToken to ensure
   * all objects are retrieved (not just first 1000).
   *
   * @returns Array of all S3 objects
   * @throws InternalServerErrorException if S3 listing fails
   */
  private async listS3Objects(): Promise<{ Contents: any[] }> {
    try {
      const allObjects: any[] = [];
      let continuationToken: string | undefined;

      do {
        const command = new ListObjectsV2Command({
          Bucket: this.bucketName,
          ContinuationToken: continuationToken,
        });

        const response = await this.s3Client.send(command);

        if (response.Contents) {
          allObjects.push(...response.Contents);
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      return { Contents: allObjects };
    } catch (error) {
      this.logger.error(`Failed to list S3 objects in bucket ${this.bucketName}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to list S3 objects');
    }
  }

  /**
   * Batch delete multiple objects from S3
   *
   * @param keys - Array of S3 keys to delete
   * @throws InternalServerErrorException if S3 batch deletion fails
   */
  private async deleteS3Objects(keys: string[]): Promise<void> {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
        },
      });
      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Failed to batch delete ${keys.length} S3 objects: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to batch delete S3 objects');
    }
  }
}
