import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GmailOAuthService } from './gmail-oauth.service';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Email, ConversationHistory } from '@relationhub/database';

interface EmailData {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  signatureHtml?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: Buffer;
  }>;
}

/**
 * Gmail Send Service
 *
 * Handles email sending via Gmail API:
 * - Builds RFC 2822 compliant MIME emails
 * - Supports multipart MIME with base64 encoded attachments
 * - Sends emails via Gmail API with retry logic
 * - Stores sent emails in database with gmailMessageId
 * - Deletes drafts after successful send
 * - Creates conversation history entries
 *
 * Error Handling:
 * - 401 Unauthorized: Throws BadRequestException (token invalid)
 * - 429 Rate Limit: Retries with exponential backoff (max 3 attempts)
 * - 500 Server Error: Retries with exponential backoff (max 3 attempts)
 * - Other errors: Throws InternalServerErrorException
 */
@Injectable()
export class GmailSendService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000; // Initial retry delay

  constructor(
    private prisma: PrismaService,
    private gmailOAuthService: GmailOAuthService,
  ) {}

  /**
   * Send email via Gmail API
   *
   * Full workflow:
   * 1. Refresh OAuth token if needed
   * 2. Build MIME email with attachments
   * 3. Send via Gmail API with retry logic
   * 4. Store sent email in database
   * 5. Delete draft (if exists)
   * 6. Create conversation history entry
   *
   * @param userId - ID of the authenticated user
   * @param contactId - ID of the recipient contact
   * @param emailData - Email content and metadata
   * @param signatureId - Optional signature ID
   * @param campaignId - Optional campaign ID for bulk sends
   * @param isColdEmail - Whether this is a cold email (no prior conversation)
   * @returns Created Email record with gmailMessageId
   */
  async sendEmail(
    userId: string,
    contactId: string,
    emailData: EmailData,
    signatureId: string | null,
    campaignId: string | null,
    isColdEmail: boolean,
  ): Promise<Email> {
    // Step 1: Refresh token if needed
    const accessToken = await this.gmailOAuthService.refreshTokenIfNeeded(userId);

    // Step 2: Build MIME email
    const mimeEmail = this.buildMimeEmail(emailData);
    const encodedEmail = this.encodeBase64Url(mimeEmail);

    // Step 3: Send via Gmail API with retry logic
    const gmailResponse = await this.callGmailApiWithRetry(accessToken, { raw: encodedEmail });

    const gmailMessageId = gmailResponse.data.id!;
    const gmailThreadId = gmailResponse.data.threadId!;

    // Step 4: Store sent email in database
    const attachmentMetadata = emailData.attachments?.map(att => ({
      filename: att.filename,
      s3Url: '', // Will be populated later if attachments are stored in S3
    })) || [];

    const sentEmail = await this.prisma.email.create({
      data: {
        userId,
        contactId,
        subject: emailData.subject,
        body: emailData.bodyText,
        bodyHtml: emailData.bodyHtml,
        status: 'SENT',
        sentAt: new Date(),
        gmailMessageId,
        gmailThreadId,
        signatureId,
        attachments: attachmentMetadata,
        campaignId,
        isColdEmail,
      },
    });

    // Step 5: Delete draft (best-effort, don't fail if no draft exists)
    await this.deleteDraftAfterSend(userId, contactId);

    // Step 6: Create conversation history entry
    await this.createConversationHistory(
      userId,
      contactId,
      sentEmail.id,
      emailData.subject,
      emailData.bodyText,
    );

    return sentEmail;
  }

  /**
   * Build RFC 2822 compliant MIME email
   *
   * Format:
   * - Simple email: text/html content type
   * - With attachments: multipart/mixed with base64 encoded attachments
   *
   * @param emailData - Email content and attachments
   * @returns MIME-formatted email string
   */
  private buildMimeEmail(emailData: EmailData): string {
    const hasAttachments = emailData.attachments && emailData.attachments.length > 0;
    const boundary = hasAttachments ? `----=_Part_${Date.now()}` : '';

    // Combine body and signature
    const fullBodyHtml = emailData.signatureHtml
      ? `${emailData.bodyHtml}<br><br>${emailData.signatureHtml}`
      : emailData.bodyHtml;

    if (!hasAttachments) {
      // Simple email without attachments
      return [
        'MIME-Version: 1.0',
        `To: ${emailData.to}`,
        `Subject: ${this.encodeSubject(emailData.subject)}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        fullBodyHtml,
      ].join('\r\n');
    }

    // Multipart email with attachments
    const parts: string[] = [];

    // Headers
    parts.push('MIME-Version: 1.0');
    parts.push(`To: ${emailData.to}`);
    parts.push(`Subject: ${this.encodeSubject(emailData.subject)}`);
    parts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    parts.push('');

    // Body part
    parts.push(`--${boundary}`);
    parts.push('Content-Type: text/html; charset=UTF-8');
    parts.push('Content-Transfer-Encoding: 7bit');
    parts.push('');
    parts.push(fullBodyHtml);
    parts.push('');

    // Attachment parts
    for (const attachment of emailData.attachments!) {
      parts.push(`--${boundary}`);
      parts.push(`Content-Type: ${attachment.contentType}`);
      parts.push('Content-Transfer-Encoding: base64');
      parts.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
      parts.push('');
      parts.push(attachment.content.toString('base64'));
      parts.push('');
    }

    // End boundary
    parts.push(`--${boundary}--`);

    return parts.join('\r\n');
  }

  /**
   * Encode email subject for RFC 2822 compliance
   *
   * Uses UTF-8 encoding for non-ASCII characters.
   *
   * @param subject - Email subject
   * @returns Encoded subject string
   */
  private encodeSubject(subject: string): string {
    // Check if subject contains non-ASCII characters
    if (/[^\x00-\x7F]/.test(subject)) {
      // Encode as UTF-8 base64
      const encoded = Buffer.from(subject, 'utf-8').toString('base64');
      return `=?UTF-8?B?${encoded}?=`;
    }
    return subject;
  }

  /**
   * Encode string to base64url format
   *
   * Gmail API requires base64url encoding (no padding, - instead of +, _ instead of /)
   *
   * @param str - String to encode
   * @returns Base64url encoded string
   */
  private encodeBase64Url(str: string): string {
    return Buffer.from(str, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Call Gmail API with retry logic
   *
   * Retries on:
   * - 429 Rate Limit (exponential backoff)
   * - 500 Internal Server Error (exponential backoff)
   *
   * Throws immediately on:
   * - 401 Unauthorized (invalid token)
   *
   * @param accessToken - OAuth2 access token
   * @param message - Gmail API message object
   * @returns Gmail API response
   */
  private async callGmailApiWithRetry(
    accessToken: string,
    message: { raw: string },
    attempt: number = 1,
  ): Promise<any> {
    try {
      return await this.callGmailApi(accessToken, message);
    } catch (error: any) {
      const status = error?.response?.status;

      // Don't retry on 401 (unauthorized)
      if (status === 401) {
        throw new BadRequestException('Gmail authentication failed. Please reconnect your account.');
      }

      // Retry on 429 (rate limit) or 500 (server error)
      if ((status === 429 || status === 500) && attempt < this.MAX_RETRIES) {
        const delayMs = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
        await this.sleep(delayMs);
        return this.callGmailApiWithRetry(accessToken, message, attempt + 1);
      }

      // Max retries exceeded or other error
      throw new InternalServerErrorException(
        `Failed to send email via Gmail API after ${attempt} attempts`,
      );
    }
  }

  /**
   * Call Gmail API to send message
   *
   * Uses googleapis library to send email with OAuth2 authentication.
   *
   * @param accessToken - OAuth2 access token
   * @param message - Gmail API message object
   * @returns Gmail API response with messageId and threadId
   */
  private async callGmailApi(accessToken: string, message: { raw: string }): Promise<any> {
    // Create OAuth2Client and set credentials for proper authentication
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    return gmail.users.messages.send({
      userId: 'me',
      requestBody: message,
    });
  }

  /**
   * Delete draft after successful email send
   *
   * Best-effort deletion - does not throw if draft doesn't exist.
   *
   * @param userId - ID of the authenticated user
   * @param contactId - ID of the contact
   */
  async deleteDraftAfterSend(userId: string, contactId: string): Promise<void> {
    try {
      await this.prisma.emailDraft.delete({
        where: {
          userId_contactId: {
            userId,
            contactId,
          },
        },
      });
    } catch (error) {
      // Ignore error if draft doesn't exist
    }
  }

  /**
   * Create conversation history entry
   *
   * Stores sent email content for AI context building.
   *
   * @param userId - ID of the authenticated user
   * @param contactId - ID of the contact
   * @param emailId - ID of the sent email
   * @param subject - Email subject
   * @param bodyText - Email body text
   * @returns Created ConversationHistory record
   */
  async createConversationHistory(
    userId: string,
    contactId: string,
    emailId: string,
    subject: string,
    bodyText: string,
  ): Promise<ConversationHistory> {
    const content = `${subject}\n\n${bodyText}`;

    return this.prisma.conversationHistory.create({
      data: {
        userId,
        contactId,
        emailId,
        content,
        direction: 'SENT',
        timestamp: new Date(),
      },
    });
  }

  /**
   * Sleep for specified milliseconds
   *
   * Used for retry backoff.
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
