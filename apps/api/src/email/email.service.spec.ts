import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailStatus, TemplateType, Direction } from '@relationhub/database';

// Mock PrismaService
const mockPrismaService = {
  email: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  conversationHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('EmailService', () => {
  let service: EmailService;
  let prisma: typeof mockPrismaService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    supabaseId: 'supabase-123',
  };

  const mockContact = {
    id: 'contact-456',
    userId: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockEmail = {
    id: 'email-789',
    userId: 'user-123',
    contactId: 'contact-456',
    subject: 'Test Email',
    body: 'This is a test email body',
    bodyHtml: '<p>This is a test email body</p>',
    status: EmailStatus.DRAFT,
    templateType: TemplateType.FORMAL,
    providerId: 'openai/gpt-4-turbo',
    tokensUsed: 150,
    generatedAt: new Date(),
    sentAt: null,
    openedAt: null,
    repliedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    prisma = mockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('createEmail', () => {
    it('should create a new email draft', async () => {
      const createDto = {
        userId: 'user-123',
        contactId: 'contact-456',
        subject: 'Test Email',
        body: 'This is a test email body',
        bodyHtml: '<p>This is a test email body</p>',
        templateType: TemplateType.FORMAL,
        providerId: 'openai/gpt-4-turbo',
        tokensUsed: 150,
      };

      prisma.email.create.mockResolvedValue(mockEmail);

      const result = await service.createEmail(createDto);

      expect(prisma.email.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          status: EmailStatus.DRAFT,
          generatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockEmail);
    });

    it('should create email without optional fields', async () => {
      const minimalDto = {
        userId: 'user-123',
        contactId: 'contact-456',
        subject: 'Test',
        body: 'Body',
      };

      const minimalEmail = {
        ...mockEmail,
        bodyHtml: null,
        templateType: null,
        providerId: null,
        tokensUsed: null,
      };

      prisma.email.create.mockResolvedValue(minimalEmail);

      const result = await service.createEmail(minimalDto);

      expect(prisma.email.create).toHaveBeenCalledWith({
        data: {
          ...minimalDto,
          status: EmailStatus.DRAFT,
          generatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(minimalEmail);
    });

    it('should handle database errors gracefully', async () => {
      const createDto = {
        userId: 'user-123',
        contactId: 'contact-456',
        subject: 'Test',
        body: 'Body',
      };

      prisma.email.create.mockRejectedValue(new Error('Database error'));

      await expect(service.createEmail(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findUserEmails', () => {
    it('should return paginated emails for a user', async () => {
      const emails = [mockEmail, { ...mockEmail, id: 'email-790' }];

      prisma.email.findMany.mockResolvedValue(emails);
      prisma.email.count.mockResolvedValue(2);

      const result = await service.findUserEmails('user-123', { skip: 0, take: 10 });

      expect(prisma.email.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.email.count).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(result).toEqual({
        emails,
        total: 2,
        skip: 0,
        take: 10,
      });
    });

    it('should filter emails by contactId', async () => {
      const emails = [mockEmail];

      prisma.email.findMany.mockResolvedValue(emails);
      prisma.email.count.mockResolvedValue(1);

      const result = await service.findUserEmails('user-123', {
        skip: 0,
        take: 10,
        contactId: 'contact-456',
      });

      expect(prisma.email.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          contactId: 'contact-456',
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.emails).toEqual(emails);
      expect(result.total).toBe(1);
    });

    it('should filter emails by status', async () => {
      const sentEmails = [{ ...mockEmail, status: EmailStatus.SENT }];

      prisma.email.findMany.mockResolvedValue(sentEmails);
      prisma.email.count.mockResolvedValue(1);

      const result = await service.findUserEmails('user-123', {
        skip: 0,
        take: 10,
        status: EmailStatus.SENT,
      });

      expect(prisma.email.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: EmailStatus.SENT,
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.emails).toEqual(sentEmails);
    });

    it('should return empty array for user with no emails', async () => {
      prisma.email.findMany.mockResolvedValue([]);
      prisma.email.count.mockResolvedValue(0);

      const result = await service.findUserEmails('user-999', { skip: 0, take: 10 });

      expect(result.emails).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('updateEmail', () => {
    it('should update a draft email', async () => {
      const updateDto = {
        subject: 'Updated Subject',
        body: 'Updated body',
        bodyHtml: '<p>Updated body</p>',
      };

      const existingEmail = { ...mockEmail, status: EmailStatus.DRAFT };
      const updatedEmail = { ...existingEmail, ...updateDto };

      prisma.email.findUnique.mockResolvedValue(existingEmail);
      prisma.email.update.mockResolvedValue(updatedEmail);

      const result = await service.updateEmail('email-789', 'user-123', updateDto);

      expect(prisma.email.findUnique).toHaveBeenCalledWith({
        where: { id: 'email-789' },
      });
      expect(prisma.email.update).toHaveBeenCalledWith({
        where: { id: 'email-789' },
        data: updateDto,
      });
      expect(result).toEqual(updatedEmail);
    });

    it('should throw error when updating non-draft email', async () => {
      const updateDto = { subject: 'Updated' };
      const sentEmail = { ...mockEmail, status: EmailStatus.SENT };

      prisma.email.findUnique.mockResolvedValue(sentEmail);

      await expect(
        service.updateEmail('email-789', 'user-123', updateDto)
      ).rejects.toThrow('Only draft emails can be updated');
    });

    it('should throw error when email not found', async () => {
      const updateDto = { subject: 'Updated' };

      prisma.email.findUnique.mockResolvedValue(null);

      await expect(
        service.updateEmail('email-999', 'user-123', updateDto)
      ).rejects.toThrow('Email not found');
    });

    it('should throw error when user does not own the email', async () => {
      const updateDto = { subject: 'Updated' };
      const otherUserEmail = { ...mockEmail, userId: 'other-user' };

      prisma.email.findUnique.mockResolvedValue(otherUserEmail);

      await expect(
        service.updateEmail('email-789', 'user-123', updateDto)
      ).rejects.toThrow('Unauthorized to update this email');
    });
  });

  describe('deleteEmail', () => {
    it('should delete an email', async () => {
      prisma.email.findUnique.mockResolvedValue(mockEmail);
      prisma.email.delete.mockResolvedValue(mockEmail);

      await service.deleteEmail('email-789', 'user-123');

      expect(prisma.email.findUnique).toHaveBeenCalledWith({
        where: { id: 'email-789' },
      });
      expect(prisma.email.delete).toHaveBeenCalledWith({
        where: { id: 'email-789' },
      });
    });

    it('should throw error when email not found', async () => {
      prisma.email.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteEmail('email-999', 'user-123')
      ).rejects.toThrow('Email not found');
    });

    it('should throw error when user does not own the email', async () => {
      const otherUserEmail = { ...mockEmail, userId: 'other-user' };
      prisma.email.findUnique.mockResolvedValue(otherUserEmail);

      await expect(
        service.deleteEmail('email-789', 'user-123')
      ).rejects.toThrow('Unauthorized to delete this email');
    });
  });

  describe('getConversationHistory', () => {
    const mockConversation = {
      id: 'conv-123',
      userId: 'user-123',
      contactId: 'contact-456',
      emailId: 'email-789',
      content: 'Subject: Test\n\nBody content',
      direction: Direction.SENT,
      timestamp: new Date(),
      metadata: null,
    };

    it('should return conversation history for a contact', async () => {
      const history = [
        mockConversation,
        { ...mockConversation, id: 'conv-124', direction: Direction.RECEIVED },
      ];

      prisma.conversationHistory.findMany.mockResolvedValue(history);

      const result = await service.getConversationHistory('user-123', 'contact-456', 10);

      expect(prisma.conversationHistory.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          contactId: 'contact-456',
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });
      expect(result).toEqual(history);
    });

    it('should limit conversation history to 5 entries by default', async () => {
      const history = [mockConversation];

      prisma.conversationHistory.findMany.mockResolvedValue(history);

      await service.getConversationHistory('user-123', 'contact-456');

      expect(prisma.conversationHistory.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          contactId: 'contact-456',
        },
        orderBy: { timestamp: 'desc' },
        take: 5,
      });
    });

    it('should return empty array for contact with no history', async () => {
      prisma.conversationHistory.findMany.mockResolvedValue([]);

      const result = await service.getConversationHistory('user-123', 'contact-999');

      expect(result).toEqual([]);
    });
  });

  describe('createConversationEntry', () => {
    it('should create a conversation history entry', async () => {
      const entryDto = {
        userId: 'user-123',
        contactId: 'contact-456',
        emailId: 'email-789',
        content: 'Subject: Test\n\nBody content',
        direction: Direction.SENT,
      };

      const mockEntry = {
        id: 'conv-123',
        ...entryDto,
        timestamp: new Date(),
        metadata: null,
      };

      prisma.conversationHistory.create.mockResolvedValue(mockEntry);

      const result = await service.createConversationEntry(entryDto);

      expect(prisma.conversationHistory.create).toHaveBeenCalledWith({
        data: entryDto,
      });
      expect(result).toEqual(mockEntry);
    });

    it('should create entry without emailId (manual conversation)', async () => {
      const entryDto = {
        userId: 'user-123',
        contactId: 'contact-456',
        content: 'Had a phone call',
        direction: Direction.RECEIVED,
      };

      const mockEntry = {
        id: 'conv-124',
        ...entryDto,
        emailId: null,
        timestamp: new Date(),
        metadata: null,
      };

      prisma.conversationHistory.create.mockResolvedValue(mockEntry);

      const result = await service.createConversationEntry(entryDto);

      expect(result).toEqual(mockEntry);
    });
  });
});
