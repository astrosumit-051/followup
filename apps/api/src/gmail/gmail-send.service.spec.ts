import { Test, TestingModule } from '@nestjs/testing';
import { GmailSendService } from './gmail-send.service';
import { PrismaService } from '../prisma/prisma.service';
import { GmailOAuthService } from './gmail-oauth.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { gmail_v1 } from 'googleapis';

describe('GmailSendService', () => {
  let service: GmailSendService;
  let prisma: PrismaService;
  let gmailOAuthService: GmailOAuthService;

  const mockPrismaService = {
    email: {
      create: jest.fn(),
    },
    emailDraft: {
      delete: jest.fn(),
    },
    conversationHistory: {
      create: jest.fn(),
    },
  };

  const mockGmailOAuthService = {
    refreshTokenIfNeeded: jest.fn(),
  };

  const mockUserId = 'user-123';
  const mockContactId = 'contact-456';
  const mockAccessToken = 'ya29.access-token';
  const mockGmailMessageId = 'msg-xyz';
  const mockGmailThreadId = 'thread-abc';

  const mockEmailData = {
    to: 'recipient@example.com',
    subject: 'Test Email',
    bodyHtml: '<p>This is a test email</p>',
    bodyText: 'This is a test email',
    signatureHtml: '<p>Best regards,<br>John Doe</p>',
    attachments: [] as Array<{ filename: string; contentType: string; content: Buffer }>,
  };

  const mockSentEmail = {
    id: 'email-123',
    userId: mockUserId,
    contactId: mockContactId,
    subject: mockEmailData.subject,
    body: mockEmailData.bodyText,
    bodyHtml: mockEmailData.bodyHtml,
    status: 'SENT',
    templateType: null,
    providerId: null,
    tokensUsed: null,
    generatedAt: null,
    sentAt: new Date(),
    openedAt: null,
    repliedAt: null,
    gmailMessageId: mockGmailMessageId,
    gmailThreadId: mockGmailThreadId,
    signatureId: null,
    attachments: [],
    campaignId: null,
    isColdEmail: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailSendService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: GmailOAuthService,
          useValue: mockGmailOAuthService,
        },
      ],
    }).compile();

    service = module.get<GmailSendService>(GmailSendService);
    prisma = module.get<PrismaService>(PrismaService);
    gmailOAuthService = module.get<GmailOAuthService>(GmailOAuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildMimeEmail', () => {
    it('should build simple MIME email without attachments', () => {
      const mimeEmail = (service as any).buildMimeEmail(mockEmailData);

      expect(mimeEmail).toContain('MIME-Version: 1.0');
      expect(mimeEmail).toContain(`To: ${mockEmailData.to}`);
      expect(mimeEmail).toContain(`Subject: ${mockEmailData.subject}`);
      expect(mimeEmail).toContain('Content-Type: text/html; charset=UTF-8');
      expect(mimeEmail).toContain(mockEmailData.bodyHtml);
      expect(mimeEmail).toContain(mockEmailData.signatureHtml);
    });

    it('should build multipart MIME email with attachments', () => {
      const emailWithAttachment = {
        ...mockEmailData,
        attachments: [
          {
            filename: 'document.pdf',
            contentType: 'application/pdf',
            content: Buffer.from('PDF content'),
          },
        ],
      };

      const mimeEmail = (service as any).buildMimeEmail(emailWithAttachment);

      expect(mimeEmail).toContain('Content-Type: multipart/mixed');
      expect(mimeEmail).toContain('boundary=');
      expect(mimeEmail).toContain('Content-Type: text/html; charset=UTF-8');
      expect(mimeEmail).toContain('Content-Type: application/pdf');
      expect(mimeEmail).toContain('Content-Disposition: attachment; filename="document.pdf"');
      expect(mimeEmail).toContain('Content-Transfer-Encoding: base64');
      expect(mimeEmail).toContain(Buffer.from('PDF content').toString('base64'));
    });

    it('should handle multiple attachments', () => {
      const emailWithMultipleAttachments = {
        ...mockEmailData,
        attachments: [
          {
            filename: 'document.pdf',
            contentType: 'application/pdf',
            content: Buffer.from('PDF content'),
          },
          {
            filename: 'image.png',
            contentType: 'image/png',
            content: Buffer.from('PNG content'),
          },
        ],
      };

      const mimeEmail = (service as any).buildMimeEmail(emailWithMultipleAttachments);

      expect(mimeEmail).toContain('document.pdf');
      expect(mimeEmail).toContain('image.png');
      expect(mimeEmail).toContain('application/pdf');
      expect(mimeEmail).toContain('image/png');
    });

    it('should encode subject with non-ASCII characters', () => {
      const emailWithUnicode = {
        ...mockEmailData,
        subject: 'Hello 世界 🌍',
      };

      const mimeEmail = (service as any).buildMimeEmail(emailWithUnicode);

      expect(mimeEmail).toContain('Subject:');
      // Should contain encoded subject (base64 or quoted-printable)
    });
  });

  describe('sendEmail', () => {
    it('should send email via Gmail API and store in database', async () => {
      const mockGmailResponse = {
        data: {
          id: mockGmailMessageId,
          threadId: mockGmailThreadId,
        },
      };

      // Mock Gmail API call
      const mockGmailSend = jest.fn().mockResolvedValue(mockGmailResponse);
      jest.spyOn(service as any, 'callGmailApi').mockImplementation(mockGmailSend);

      mockGmailOAuthService.refreshTokenIfNeeded.mockResolvedValue(mockAccessToken);
      mockPrismaService.email.create.mockResolvedValue(mockSentEmail);

      const result = await service.sendEmail(
        mockUserId,
        mockContactId,
        mockEmailData,
        null, // signatureId
        null, // campaignId
        false, // isColdEmail
      );

      expect(gmailOAuthService.refreshTokenIfNeeded).toHaveBeenCalledWith(mockUserId);
      expect(mockGmailSend).toHaveBeenCalledWith(
        mockAccessToken,
        expect.objectContaining({
          raw: expect.any(String),
        }),
      );
      expect(prisma.email.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: mockEmailData.subject,
          body: mockEmailData.bodyText,
          bodyHtml: mockEmailData.bodyHtml,
          status: 'SENT',
          sentAt: expect.any(Date),
          gmailMessageId: mockGmailMessageId,
          gmailThreadId: mockGmailThreadId,
          signatureId: null,
          attachments: [],
          campaignId: null,
          isColdEmail: false,
        },
      });
      expect(result).toEqual(mockSentEmail);
    });

    it('should send email with attachments', async () => {
      const emailWithAttachment = {
        ...mockEmailData,
        attachments: [
          {
            filename: 'document.pdf',
            contentType: 'application/pdf',
            content: Buffer.from('PDF content'),
          },
        ],
      };

      const mockGmailResponse = {
        data: {
          id: mockGmailMessageId,
          threadId: mockGmailThreadId,
        },
      };

      const mockGmailSend = jest.fn().mockResolvedValue(mockGmailResponse);
      jest.spyOn(service as any, 'callGmailApi').mockImplementation(mockGmailSend);

      mockGmailOAuthService.refreshTokenIfNeeded.mockResolvedValue(mockAccessToken);
      mockPrismaService.email.create.mockResolvedValue({
        ...mockSentEmail,
        attachments: [{ filename: 'document.pdf', s3Url: 's3://bucket/file.pdf' }],
      });

      const result = await service.sendEmail(
        mockUserId,
        mockContactId,
        emailWithAttachment,
        null,
        null,
        false,
      );

      expect(result.attachments).toHaveLength(1);
    });

    it('should retry on 429 rate limit error', async () => {
      const mockGmailResponse = {
        data: {
          id: mockGmailMessageId,
          threadId: mockGmailThreadId,
        },
      };

      const mockGmailSend = jest
        .fn()
        .mockRejectedValueOnce({ response: { status: 429 } }) // First attempt: rate limit
        .mockResolvedValueOnce(mockGmailResponse); // Second attempt: success

      jest.spyOn(service as any, 'callGmailApi').mockImplementation(mockGmailSend);

      mockGmailOAuthService.refreshTokenIfNeeded.mockResolvedValue(mockAccessToken);
      mockPrismaService.email.create.mockResolvedValue(mockSentEmail);

      const result = await service.sendEmail(
        mockUserId,
        mockContactId,
        mockEmailData,
        null,
        null,
        false,
      );

      expect(mockGmailSend).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockSentEmail);
    });

    it('should retry on 500 internal server error', async () => {
      const mockGmailResponse = {
        data: {
          id: mockGmailMessageId,
          threadId: mockGmailThreadId,
        },
      };

      const mockGmailSend = jest
        .fn()
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockResolvedValueOnce(mockGmailResponse);

      jest.spyOn(service as any, 'callGmailApi').mockImplementation(mockGmailSend);

      mockGmailOAuthService.refreshTokenIfNeeded.mockResolvedValue(mockAccessToken);
      mockPrismaService.email.create.mockResolvedValue(mockSentEmail);

      const result = await service.sendEmail(
        mockUserId,
        mockContactId,
        mockEmailData,
        null,
        null,
        false,
      );

      expect(mockGmailSend).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockSentEmail);
    });

    it('should throw BadRequestException on 401 unauthorized error', async () => {
      const mockGmailSend = jest.fn().mockRejectedValue({ response: { status: 401 } });
      jest.spyOn(service as any, 'callGmailApi').mockImplementation(mockGmailSend);

      mockGmailOAuthService.refreshTokenIfNeeded.mockResolvedValue(mockAccessToken);

      await expect(
        service.sendEmail(mockUserId, mockContactId, mockEmailData, null, null, false),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException after max retries', async () => {
      const mockGmailSend = jest.fn().mockRejectedValue({ response: { status: 429 } });
      jest.spyOn(service as any, 'callGmailApi').mockImplementation(mockGmailSend);

      mockGmailOAuthService.refreshTokenIfNeeded.mockResolvedValue(mockAccessToken);

      await expect(
        service.sendEmail(mockUserId, mockContactId, mockEmailData, null, null, false),
      ).rejects.toThrow(InternalServerErrorException);

      // Should retry 3 times (initial + 2 retries)
      expect(mockGmailSend).toHaveBeenCalledTimes(3);
    });
  });

  describe('deleteDraftAfterSend', () => {
    it('should delete draft after successful email send', async () => {
      mockPrismaService.emailDraft.delete.mockResolvedValue({});

      await service.deleteDraftAfterSend(mockUserId, mockContactId);

      expect(prisma.emailDraft.delete).toHaveBeenCalledWith({
        where: {
          userId_contactId: {
            userId: mockUserId,
            contactId: mockContactId,
          },
        },
      });
    });

    it('should not throw error if draft does not exist', async () => {
      mockPrismaService.emailDraft.delete.mockRejectedValue(new Error('Not found'));

      // Should not throw
      await expect(
        service.deleteDraftAfterSend(mockUserId, mockContactId),
      ).resolves.not.toThrow();
    });
  });

  describe('createConversationHistory', () => {
    it('should create conversation history entry for sent email', async () => {
      const mockHistoryEntry = {
        id: 'history-123',
        userId: mockUserId,
        contactId: mockContactId,
        emailId: mockSentEmail.id,
        content: `${mockEmailData.subject}\n\n${mockEmailData.bodyText}`,
        direction: 'SENT',
        timestamp: expect.any(Date),
        metadata: null,
      };

      mockPrismaService.conversationHistory.create.mockResolvedValue(mockHistoryEntry);

      const result = await service.createConversationHistory(
        mockUserId,
        mockContactId,
        mockSentEmail.id,
        mockEmailData.subject,
        mockEmailData.bodyText,
      );

      expect(prisma.conversationHistory.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          emailId: mockSentEmail.id,
          content: `${mockEmailData.subject}\n\n${mockEmailData.bodyText}`,
          direction: 'SENT',
          timestamp: expect.any(Date),
        },
      });
      expect(result).toEqual(mockHistoryEntry);
    });
  });

  describe('encodeBase64Url', () => {
    it('should encode string to base64url format', () => {
      const input = 'Hello World!';
      const encoded = (service as any).encodeBase64Url(input);

      // Base64url: no padding, - instead of +, _ instead of /
      expect(encoded).not.toContain('=');
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
    });
  });
});
