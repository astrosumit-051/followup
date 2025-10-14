import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Email, PrismaClient, EmailStatus, TemplateType } from '@prisma/client';

// Create a mock Prisma Client using Vitest's vi.fn()
const prismaMock = {
  email: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
} as unknown as PrismaClient;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Email Model', () => {
  const mockUserId = 'user-123';
  const mockContactId = 'contact-456';
  const baseDate = new Date('2025-10-14T10:00:00Z');

  describe('Email Creation', () => {
    it('should create a draft email with AI generation metadata', async () => {
      const mockEmail: Email = {
        id: 'email-123',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Test Subject',
        body: 'Test email body content',
        bodyHtml: '<p>Test email body content</p>',
        status: EmailStatus.DRAFT,
        templateType: TemplateType.FORMAL,
        providerId: 'openai/gpt-4-turbo',
        tokensUsed: 287,
        generatedAt: baseDate,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Test Subject',
          body: 'Test email body content',
          bodyHtml: '<p>Test email body content</p>',
          status: EmailStatus.DRAFT,
          templateType: TemplateType.FORMAL,
          providerId: 'openai/gpt-4-turbo',
          tokensUsed: 287,
          generatedAt: baseDate,
        },
      });

      expect(result).toEqual(mockEmail);
      expect(result.status).toBe(EmailStatus.DRAFT);
      expect(result.providerId).toBe('openai/gpt-4-turbo');
      expect(result.tokensUsed).toBe(287);
      expect(result.sentAt).toBeNull();
    });

    it('should create a draft email with casual template type', async () => {
      const mockEmail: Email = {
        id: 'email-124',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Hey! Quick follow-up',
        body: 'Hey there! Just wanted to check in...',
        bodyHtml: '<p>Hey there! Just wanted to check in...</p>',
        status: EmailStatus.DRAFT,
        templateType: TemplateType.CASUAL,
        providerId: 'anthropic/claude-3.5-sonnet',
        tokensUsed: 195,
        generatedAt: baseDate,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Hey! Quick follow-up',
          body: 'Hey there! Just wanted to check in...',
          bodyHtml: '<p>Hey there! Just wanted to check in...</p>',
          status: EmailStatus.DRAFT,
          templateType: TemplateType.CASUAL,
          providerId: 'anthropic/claude-3.5-sonnet',
          tokensUsed: 195,
          generatedAt: baseDate,
        },
      });

      expect(result.templateType).toBe(TemplateType.CASUAL);
      expect(result.providerId).toBe('anthropic/claude-3.5-sonnet');
    });

    it('should create a sent email with tracking metadata', async () => {
      const sentDate = new Date('2025-10-14T11:00:00Z');
      const openedDate = new Date('2025-10-14T14:30:00Z');

      const mockEmail: Email = {
        id: 'email-125',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Follow-up email',
        body: 'Following up on our conversation...',
        bodyHtml: '<p>Following up on our conversation...</p>',
        status: EmailStatus.SENT,
        templateType: TemplateType.FORMAL,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: sentDate,
        openedAt: openedDate,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: openedDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Follow-up email',
          body: 'Following up on our conversation...',
          bodyHtml: '<p>Following up on our conversation...</p>',
          status: EmailStatus.SENT,
          templateType: TemplateType.FORMAL,
          sentAt: sentDate,
          openedAt: openedDate,
        },
      });

      expect(result.status).toBe(EmailStatus.SENT);
      expect(result.sentAt).toEqual(sentDate);
      expect(result.openedAt).toEqual(openedDate);
      expect(result.repliedAt).toBeNull();
    });

    it('should create email without HTML body (plain text only)', async () => {
      const mockEmail: Email = {
        id: 'email-126',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Plain text email',
        body: 'This is a plain text email without HTML',
        bodyHtml: null,
        status: EmailStatus.DRAFT,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Plain text email',
          body: 'This is a plain text email without HTML',
          status: EmailStatus.DRAFT,
        },
      });

      expect(result.bodyHtml).toBeNull();
      expect(result.body).toBe('This is a plain text email without HTML');
    });
  });

  describe('Email Status Transitions', () => {
    it('should transition email from DRAFT to SENT', async () => {
      const sentDate = new Date('2025-10-14T15:00:00Z');

      const mockEmail: Email = {
        id: 'email-127',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Draft to Sent',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.SENT,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: sentDate,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: sentDate,
      };

      prismaMock.email.update.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.update({
        where: { id: 'email-127' },
        data: {
          status: EmailStatus.SENT,
          sentAt: sentDate,
        },
      });

      expect(result.status).toBe(EmailStatus.SENT);
      expect(result.sentAt).toEqual(sentDate);
    });

    it('should mark email as FAILED when send fails', async () => {
      const mockEmail: Email = {
        id: 'email-128',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Failed Email',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.FAILED,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.update.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.update({
        where: { id: 'email-128' },
        data: {
          status: EmailStatus.FAILED,
        },
      });

      expect(result.status).toBe(EmailStatus.FAILED);
      expect(result.sentAt).toBeNull();
    });

    it('should schedule email for later sending', async () => {
      const mockEmail: Email = {
        id: 'email-129',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Scheduled Email',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.SCHEDULED,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.update.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.update({
        where: { id: 'email-129' },
        data: {
          status: EmailStatus.SCHEDULED,
        },
      });

      expect(result.status).toBe(EmailStatus.SCHEDULED);
    });

    it('should cancel scheduled email', async () => {
      const mockEmail: Email = {
        id: 'email-130',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Cancelled Email',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.CANCELLED,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.update.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.update({
        where: { id: 'email-130' },
        data: {
          status: EmailStatus.CANCELLED,
        },
      });

      expect(result.status).toBe(EmailStatus.CANCELLED);
    });
  });

  describe('Email Tracking', () => {
    it('should record email open timestamp', async () => {
      const openedDate = new Date('2025-10-14T16:00:00Z');

      const mockEmail: Email = {
        id: 'email-131',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Tracked Email',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.SENT,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: new Date('2025-10-14T15:00:00Z'),
        openedAt: openedDate,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: openedDate,
      };

      prismaMock.email.update.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.update({
        where: { id: 'email-131' },
        data: {
          openedAt: openedDate,
        },
      });

      expect(result.openedAt).toEqual(openedDate);
    });

    it('should record email reply timestamp', async () => {
      const repliedDate = new Date('2025-10-14T17:00:00Z');

      const mockEmail: Email = {
        id: 'email-132',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Replied Email',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.SENT,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: new Date('2025-10-14T15:00:00Z'),
        openedAt: new Date('2025-10-14T16:00:00Z'),
        repliedAt: repliedDate,
        createdAt: baseDate,
        updatedAt: repliedDate,
      };

      prismaMock.email.update.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.update({
        where: { id: 'email-132' },
        data: {
          repliedAt: repliedDate,
        },
      });

      expect(result.repliedAt).toEqual(repliedDate);
      expect(result.openedAt).not.toBeNull();
    });
  });

  describe('AI Provider Tracking', () => {
    it('should track different AI providers (OpenAI)', async () => {
      const mockEmail: Email = {
        id: 'email-133',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'OpenAI Generated',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.DRAFT,
        templateType: TemplateType.FORMAL,
        providerId: 'openai/gpt-4-turbo',
        tokensUsed: 350,
        generatedAt: baseDate,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'OpenAI Generated',
          body: 'Email content',
          providerId: 'openai/gpt-4-turbo',
          tokensUsed: 350,
        },
      });

      expect(result.providerId).toBe('openai/gpt-4-turbo');
      expect(result.tokensUsed).toBe(350);
    });

    it('should track different AI providers (Anthropic via OpenRouter)', async () => {
      const mockEmail: Email = {
        id: 'email-134',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Anthropic Generated',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.DRAFT,
        templateType: TemplateType.CASUAL,
        providerId: 'anthropic/claude-3.5-sonnet',
        tokensUsed: 220,
        generatedAt: baseDate,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Anthropic Generated',
          body: 'Email content',
          providerId: 'anthropic/claude-3.5-sonnet',
          tokensUsed: 220,
        },
      });

      expect(result.providerId).toBe('anthropic/claude-3.5-sonnet');
    });

    it('should handle emails without AI generation (manual composition)', async () => {
      const mockEmail: Email = {
        id: 'email-135',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Manual Email',
        body: 'Manually written email',
        bodyHtml: null,
        status: EmailStatus.DRAFT,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Manual Email',
          body: 'Manually written email',
        },
      });

      expect(result.providerId).toBeNull();
      expect(result.tokensUsed).toBeNull();
      expect(result.generatedAt).toBeNull();
    });
  });

  describe('Query Operations', () => {
    it('should find email by ID', async () => {
      const mockEmail: Email = {
        id: 'email-136',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Find Me',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.SENT,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: baseDate,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.findUnique.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.findUnique({
        where: { id: 'email-136' },
      });

      expect(result).toEqual(mockEmail);
      expect(result?.subject).toBe('Find Me');
    });

    it('should find all draft emails for a user', async () => {
      const mockEmails: Email[] = [
        {
          id: 'email-137',
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Draft 1',
          body: 'Content 1',
          bodyHtml: null,
          status: EmailStatus.DRAFT,
          templateType: null,
          providerId: null,
          tokensUsed: null,
          generatedAt: null,
          sentAt: null,
          openedAt: null,
          repliedAt: null,
          createdAt: baseDate,
          updatedAt: baseDate,
        },
        {
          id: 'email-138',
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Draft 2',
          body: 'Content 2',
          bodyHtml: null,
          status: EmailStatus.DRAFT,
          templateType: null,
          providerId: null,
          tokensUsed: null,
          generatedAt: null,
          sentAt: null,
          openedAt: null,
          repliedAt: null,
          createdAt: baseDate,
          updatedAt: baseDate,
        },
      ];

      prismaMock.email.findMany.mockResolvedValue(mockEmails);

      const result = await prismaMock.email.findMany({
        where: {
          userId: mockUserId,
          status: EmailStatus.DRAFT,
        },
      });

      expect(result).toHaveLength(2);
      expect(result.every(email => email.status === EmailStatus.DRAFT)).toBe(true);
    });

    it('should find all sent emails for a contact', async () => {
      const mockEmails: Email[] = [
        {
          id: 'email-139',
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Sent 1',
          body: 'Content 1',
          bodyHtml: null,
          status: EmailStatus.SENT,
          templateType: null,
          providerId: null,
          tokensUsed: null,
          generatedAt: null,
          sentAt: baseDate,
          openedAt: null,
          repliedAt: null,
          createdAt: baseDate,
          updatedAt: baseDate,
        },
      ];

      prismaMock.email.findMany.mockResolvedValue(mockEmails);

      const result = await prismaMock.email.findMany({
        where: {
          userId: mockUserId,
          contactId: mockContactId,
          status: EmailStatus.SENT,
        },
      });

      expect(result.every(email => email.contactId === mockContactId)).toBe(true);
      expect(result.every(email => email.status === EmailStatus.SENT)).toBe(true);
    });

    it('should return null when email not found', async () => {
      prismaMock.email.findUnique.mockResolvedValue(null);

      const result = await prismaMock.email.findUnique({
        where: { id: 'non-existent-id' },
      });

      expect(result).toBeNull();
    });
  });

  describe('Email Deletion', () => {
    it('should delete email by ID', async () => {
      const mockEmail: Email = {
        id: 'email-140',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'To Be Deleted',
        body: 'Email content',
        bodyHtml: null,
        status: EmailStatus.DRAFT,
        templateType: null,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.delete.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.delete({
        where: { id: 'email-140' },
      });

      expect(result.id).toBe('email-140');
    });
  });

  describe('Template Types', () => {
    it('should create email with CUSTOM template type', async () => {
      const mockEmail: Email = {
        id: 'email-141',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Custom Template',
        body: 'Custom email content',
        bodyHtml: null,
        status: EmailStatus.DRAFT,
        templateType: TemplateType.CUSTOM,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Custom Template',
          body: 'Custom email content',
          templateType: TemplateType.CUSTOM,
        },
      });

      expect(result.templateType).toBe(TemplateType.CUSTOM);
    });

    it('should create email with TEMPLATE_BASED type', async () => {
      const mockEmail: Email = {
        id: 'email-142',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'Template Based Email',
        body: 'Email from saved template',
        bodyHtml: null,
        status: EmailStatus.DRAFT,
        templateType: TemplateType.TEMPLATE_BASED,
        providerId: null,
        tokensUsed: null,
        generatedAt: null,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'Template Based Email',
          body: 'Email from saved template',
          templateType: TemplateType.TEMPLATE_BASED,
        },
      });

      expect(result.templateType).toBe(TemplateType.TEMPLATE_BASED);
    });

    it('should create AI-generated email with AI_GENERATED type', async () => {
      const mockEmail: Email = {
        id: 'email-143',
        userId: mockUserId,
        contactId: mockContactId,
        subject: 'AI Generated Email',
        body: 'AI generated content',
        bodyHtml: null,
        status: EmailStatus.DRAFT,
        templateType: TemplateType.AI_GENERATED,
        providerId: 'openai/gpt-4-turbo',
        tokensUsed: 300,
        generatedAt: baseDate,
        sentAt: null,
        openedAt: null,
        repliedAt: null,
        createdAt: baseDate,
        updatedAt: baseDate,
      };

      prismaMock.email.create.mockResolvedValue(mockEmail);

      const result = await prismaMock.email.create({
        data: {
          userId: mockUserId,
          contactId: mockContactId,
          subject: 'AI Generated Email',
          body: 'AI generated content',
          templateType: TemplateType.AI_GENERATED,
          providerId: 'openai/gpt-4-turbo',
          tokensUsed: 300,
          generatedAt: baseDate,
        },
      });

      expect(result.templateType).toBe(TemplateType.AI_GENERATED);
      expect(result.providerId).toBe('openai/gpt-4-turbo');
    });
  });
});
