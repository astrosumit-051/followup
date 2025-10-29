import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachmentService } from './attachment.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

/**
 * Attachment REST API Controller
 *
 * Provides REST endpoints for file attachment management via S3:
 * - POST /api/attachments/presigned-url - Generates presigned upload URL
 * - DELETE /api/attachments/:key - Deletes attachment from S3
 *
 * Security:
 * - All endpoints require authentication
 * - File type whitelist (PDF, DOC, DOCX, XLS, XLSX, PNG, JPEG)
 * - File size limit (25MB)
 * - User isolation (can only delete own attachments)
 * - Rate limiting on presigned URL generation (20 requests per minute)
 * - Rate limiting on deletion (10 requests per minute)
 */
@Controller('api/attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  /**
   * POST /api/attachments/presigned-url
   *
   * Generates a presigned S3 URL for direct browser file upload.
   * The URL expires after 15 minutes and can only be used once.
   *
   * File validation:
   * - Type: Must be PDF, DOC, DOCX, XLS, XLSX, PNG, or JPEG
   * - Size: Must be ≤25MB
   * - Filename: Must be provided and non-empty
   *
   * Returns:
   * - uploadUrl: Presigned S3 PUT URL
   * - key: S3 object key (format: userId/attachments/uuid.ext)
   * - expiresAt: URL expiration timestamp
   *
   * Rate limited to 20 requests per minute per user.
   *
   * @param user - Authenticated user from JWT token
   * @param body - Request body with file metadata
   * @returns Presigned upload URL, S3 key, and expiry timestamp
   * @throws BadRequestException if file type/size invalid
   */
  @Post('presigned-url')
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async generatePresignedUrl(
    @CurrentUser() user: CurrentUserData,
    @Body()
    body: {
      filename: string;
      contentType: string;
      fileSize: number;
    },
  ): Promise<{ uploadUrl: string; key: string; expiresAt: Date }> {
    const { filename, contentType, fileSize } = body;

    return this.attachmentService.generatePresignedUploadUrl(
      user.supabaseId,
      filename,
      contentType,
      fileSize,
    );
  }

  /**
   * DELETE /api/attachments/:key
   *
   * Deletes an attachment from S3 storage.
   * Users can only delete their own attachments (enforced by service layer).
   *
   * The S3 key format is: userId/attachments/uuid.extension
   * The service verifies that the userId in the key matches the authenticated user.
   *
   * Rate limited to 10 requests per minute per user.
   *
   * @param user - Authenticated user from JWT token
   * @param key - S3 object key (URL parameter, captures full path including slashes)
   * @returns Success response
   * @throws ForbiddenException if user tries to delete another user's attachment
   * @throws BadRequestException if S3 key format is invalid
   */
  @Delete('*key')
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async deleteAttachment(
    @CurrentUser() user: CurrentUserData,
    @Param('key') key: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.attachmentService.deleteAttachment(user.supabaseId, key);

    return {
      success: true,
      message: 'Attachment deleted successfully',
    };
  }
}
