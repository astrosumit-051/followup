import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * Attachment Entity
 *
 * Represents file attachment metadata for email drafts and sent emails.
 * Files are stored in S3, and this entity contains metadata for display and sending.
 *
 * @example
 * ```graphql
 * {
 *   key: "user-123/attachments/uuid-abc.pdf"
 *   filename: "proposal.pdf"
 *   contentType: "application/pdf"
 *   fileSize: 1048576
 *   uploadedAt: "2025-10-15T12:00:00Z"
 * }
 * ```
 */
@ObjectType({ description: 'File attachment metadata for email drafts and sent emails. Files are stored in S3.' })
export class Attachment {
  @Field(() => String, { description: 'S3 object key for this attachment (format: userId/attachments/uuid.ext)' })
  key!: string;

  @Field(() => String, { description: 'Original filename as uploaded by user (e.g., "proposal.pdf")' })
  filename!: string;

  @Field(() => String, { description: 'MIME content type (e.g., "application/pdf", "image/png")' })
  contentType!: string;

  @Field(() => Int, { description: 'File size in bytes (max 25MB = 26214400 bytes)' })
  fileSize!: number;

  @Field(() => Date, { description: 'Timestamp when file was uploaded to S3' })
  uploadedAt!: Date;
}
