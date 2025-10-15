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
  emailTemplate: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
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
          sentAt: null,
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
          sentAt: null,
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

  describe('findTemplatesByUserId', () => {
    const mockTemplate = {
      id: 'template-123',
      userId: 'user-123',
      name: 'Follow-up Template',
      subject: 'Following up on our conversation',
      body: 'Hi {{name}},\n\nIt was great meeting you...',
      bodyHtml: '<p>Hi {{name}},</p><p>It was great meeting you...</p>',
      isDefault: false,
      category: 'Networking',
      usageCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return all templates for a user', async () => {
      const templates = [
        mockTemplate,
        { ...mockTemplate, id: 'template-124', isDefault: true, usageCount: 10 },
      ];

      prisma.emailTemplate.findMany.mockResolvedValue(templates);

      const result = await service.findTemplatesByUserId('user-123');

      expect(prisma.emailTemplate.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: [
          { isDefault: 'desc' },
          { usageCount: 'desc' },
          { createdAt: 'desc' },
        ],
      });
      expect(result).toEqual(templates);
    });

    it('should return empty array for user with no templates', async () => {
      prisma.emailTemplate.findMany.mockResolvedValue([]);

      const result = await service.findTemplatesByUserId('user-999');

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      prisma.emailTemplate.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.findTemplatesByUserId('user-123')).rejects.toThrow('Database error');
    });
  });

  describe('createTemplate', () => {
    const mockTemplate = {
      id: 'template-123',
      userId: 'user-123',
      name: 'Follow-up Template',
      subject: 'Following up',
      body: 'Template body',
      bodyHtml: null,
      isDefault: false,
      category: 'Networking',
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new template', async () => {
      const templateData = {
        name: 'Follow-up Template',
        subject: 'Following up',
        body: 'Template body',
        category: 'Networking',
      };

      prisma.emailTemplate.create.mockResolvedValue(mockTemplate);

      const result = await service.createTemplate('user-123', templateData);

      expect(prisma.emailTemplate.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          name: templateData.name,
          subject: templateData.subject,
          body: templateData.body,
          bodyHtml: null,
          isDefault: false,
          category: templateData.category,
          usageCount: 0,
        },
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should create template with isDefault=true and unset other defaults', async () => {
      const templateData = {
        name: 'Default Template',
        subject: 'Test',
        body: 'Body',
        isDefault: true,
      };

      const defaultTemplate = {
        ...mockTemplate,
        name: 'Default Template',
        isDefault: true,
      };

      prisma.emailTemplate.updateMany.mockResolvedValue({ count: 2 });
      prisma.emailTemplate.create.mockResolvedValue(defaultTemplate);

      const result = await service.createTemplate('user-123', templateData);

      // Should first unset all existing defaults
      expect(prisma.emailTemplate.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      // Then create the new default template
      expect(prisma.emailTemplate.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          name: templateData.name,
          subject: templateData.subject,
          body: templateData.body,
          bodyHtml: null,
          isDefault: true,
          category: null,
          usageCount: 0,
        },
      });
      expect(result).toEqual(defaultTemplate);
    });

    it('should create template with optional bodyHtml', async () => {
      const templateData = {
        name: 'HTML Template',
        subject: 'Test',
        body: 'Plain text',
        bodyHtml: '<p>HTML content</p>',
      };

      const htmlTemplate = {
        ...mockTemplate,
        bodyHtml: '<p>HTML content</p>',
      };

      prisma.emailTemplate.create.mockResolvedValue(htmlTemplate);

      const result = await service.createTemplate('user-123', templateData);

      expect(prisma.emailTemplate.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          name: templateData.name,
          subject: templateData.subject,
          body: templateData.body,
          bodyHtml: templateData.bodyHtml,
          isDefault: false,
          category: null,
          usageCount: 0,
        },
      });
      expect(result).toEqual(htmlTemplate);
    });

    it('should handle database errors gracefully', async () => {
      const templateData = {
        name: 'Test',
        subject: 'Test',
        body: 'Body',
      };

      prisma.emailTemplate.create.mockRejectedValue(new Error('Database error'));

      await expect(service.createTemplate('user-123', templateData)).rejects.toThrow('Database error');
    });
  });

  describe('updateTemplate', () => {
    const mockTemplate = {
      id: 'template-123',
      userId: 'user-123',
      name: 'Original Template',
      subject: 'Original Subject',
      body: 'Original body',
      bodyHtml: null,
      isDefault: false,
      category: 'Networking',
      usageCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a template', async () => {
      const updateData = {
        name: 'Updated Template',
        subject: 'Updated Subject',
      };

      const updatedTemplate = {
        ...mockTemplate,
        ...updateData,
      };

      prisma.emailTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.emailTemplate.update.mockResolvedValue(updatedTemplate);

      const result = await service.updateTemplate('template-123', 'user-123', updateData);

      expect(prisma.emailTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: 'template-123' },
      });
      expect(prisma.emailTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-123' },
        data: updateData,
      });
      expect(result).toEqual(updatedTemplate);
    });

    it('should update template to isDefault=true and unset other defaults', async () => {
      const updateData = {
        isDefault: true,
      };

      const updatedTemplate = {
        ...mockTemplate,
        isDefault: true,
      };

      prisma.emailTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.emailTemplate.updateMany.mockResolvedValue({ count: 1 });
      prisma.emailTemplate.update.mockResolvedValue(updatedTemplate);

      const result = await service.updateTemplate('template-123', 'user-123', updateData);

      // Should first unset all other defaults (excluding current template)
      expect(prisma.emailTemplate.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isDefault: true,
          id: { not: 'template-123' },
        },
        data: {
          isDefault: false,
        },
      });

      // Then update the template
      expect(prisma.emailTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-123' },
        data: updateData,
      });
      expect(result).toEqual(updatedTemplate);
    });

    it('should not unset other defaults when isDefault is false', async () => {
      const updateData = {
        name: 'Updated Name',
        isDefault: false,
      };

      const updatedTemplate = {
        ...mockTemplate,
        name: 'Updated Name',
      };

      prisma.emailTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.emailTemplate.update.mockResolvedValue(updatedTemplate);

      await service.updateTemplate('template-123', 'user-123', updateData);

      // Should NOT call updateMany when isDefault is false
      expect(prisma.emailTemplate.updateMany).not.toHaveBeenCalled();
      expect(prisma.emailTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-123' },
        data: updateData,
      });
    });

    it('should throw error when template not found', async () => {
      const updateData = { name: 'Updated' };

      prisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTemplate('template-999', 'user-123', updateData)
      ).rejects.toThrow('Template not found');
    });

    it('should throw error when user does not own the template', async () => {
      const updateData = { name: 'Updated' };
      const otherUserTemplate = { ...mockTemplate, userId: 'other-user' };

      prisma.emailTemplate.findUnique.mockResolvedValue(otherUserTemplate);

      await expect(
        service.updateTemplate('template-123', 'user-123', updateData)
      ).rejects.toThrow('Unauthorized to update this template');
    });

    it('should handle database errors gracefully', async () => {
      const updateData = { name: 'Updated' };

      prisma.emailTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.emailTemplate.update.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateTemplate('template-123', 'user-123', updateData)
      ).rejects.toThrow('Database error');
    });
  });

  describe('deleteTemplate', () => {
    const mockTemplate = {
      id: 'template-123',
      userId: 'user-123',
      name: 'Template to Delete',
      subject: 'Test',
      body: 'Body',
      bodyHtml: null,
      isDefault: false,
      category: null,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete a template', async () => {
      prisma.emailTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.emailTemplate.delete.mockResolvedValue(mockTemplate);

      await service.deleteTemplate('template-123', 'user-123');

      expect(prisma.emailTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: 'template-123' },
      });
      expect(prisma.emailTemplate.delete).toHaveBeenCalledWith({
        where: { id: 'template-123' },
      });
    });

    it('should throw error when template not found', async () => {
      prisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteTemplate('template-999', 'user-123')
      ).rejects.toThrow('Template not found');
    });

    it('should throw error when user does not own the template', async () => {
      const otherUserTemplate = { ...mockTemplate, userId: 'other-user' };
      prisma.emailTemplate.findUnique.mockResolvedValue(otherUserTemplate);

      await expect(
        service.deleteTemplate('template-123', 'user-123')
      ).rejects.toThrow('Unauthorized to delete this template');
    });

    it('should handle database errors gracefully', async () => {
      prisma.emailTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.emailTemplate.delete.mockRejectedValue(new Error('Database error'));

      await expect(
        service.deleteTemplate('template-123', 'user-123')
      ).rejects.toThrow('Database error');
    });
  });
});
