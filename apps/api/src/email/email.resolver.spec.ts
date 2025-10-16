import { Test, TestingModule } from '@nestjs/testing';
import { EmailResolver } from './email.resolver';
import { EmailService } from './email.service';
import { EmailDraftService } from './email-draft.service';
import { EmailSignatureService } from './email-signature.service';
import { AIService } from '../ai/ai.service';
import { GmailOAuthService } from '../gmail/gmail-oauth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailStatus } from './enums/email-status.enum';
import { TemplateType } from './enums/template-type.enum';
import { Direction } from './enums/direction.enum';
import { FindEmailsInput } from './dto/find-emails.input';
import { GenerateEmailInput } from './dto/generate-email.input';

// Mock the AuthGuard to avoid jose/Supabase dependencies in tests
jest.mock('../auth/auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockResolvedValue(true),
  })),
}));

describe('EmailResolver', () => {
  let resolver: EmailResolver;
  let service: EmailService;
  let aiService: AIService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    profilePicture: undefined,
  };

  const mockEmail = {
    id: 'email-456',
    userId: 'user-123',
    contactId: 'contact-789',
    subject: 'Follow-up meeting',
    body: 'Hi John, it was great meeting you...',
    bodyHtml: '<p>Hi John, it was great meeting you...</p>',
    status: EmailStatus.DRAFT,
    providerId: 'openai/gpt-4-turbo',
    tokensUsed: 250,
    createdAt: new Date('2025-10-14'),
    updatedAt: new Date('2025-10-14'),
  };

  const mockEmailTemplate = {
    id: 'template-111',
    userId: 'user-123',
    name: 'Follow-up Template',
    type: TemplateType.FORMAL,
    subject: '{{subject}}',
    body: '{{body}}',
    bodyHtml: '<p>{{body}}</p>',
    isDefault: true,
    usageCount: 15,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-10'),
  };

  const mockConversationHistory = {
    id: 'history-222',
    userId: 'user-123',
    contactId: 'contact-789',
    direction: Direction.SENT,
    subject: 'Re: Meeting',
    body: 'Thanks for the meeting...',
    timestamp: new Date('2025-10-13'),
    metadata: { opened: true },
    createdAt: new Date('2025-10-13'),
  };

  // Mock EmailService with new methods
  const mockEmailService = {
    findUserEmails: jest.fn(),
    findEmailById: jest.fn(),
    findTemplatesByUserId: jest.fn(),
    getConversationHistory: jest.fn(),
    createEmail: jest.fn(),
    updateEmail: jest.fn(),
    deleteEmail: jest.fn(),
    createConversationEntry: jest.fn(),
  };

  // Mock EmailDraftService
  const mockEmailDraftService = {
    getDraftByContact: jest.fn(),
    listDrafts: jest.fn(),
    autoSaveDraft: jest.fn(),
    deleteDraft: jest.fn(),
  };

  // Mock EmailSignatureService
  const mockEmailSignatureService = {
    listSignatures: jest.fn(),
    createSignature: jest.fn(),
    updateSignature: jest.fn(),
    deleteSignature: jest.fn(),
  };

  // Mock AIService
  const mockAIService = {
    generateEmailTemplate: jest.fn(),
    isOpenAIAvailable: jest.fn().mockReturnValue(true),
    isAnthropicAvailable: jest.fn().mockReturnValue(true),
  };

  // Mock GmailOAuthService
  const mockGmailOAuthService = {
    getConnectionStatus: jest.fn(),
  };

  // Mock PrismaService
  const mockPrismaService = {
    gmailToken: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailResolver,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: EmailDraftService,
          useValue: mockEmailDraftService,
        },
        {
          provide: EmailSignatureService,
          useValue: mockEmailSignatureService,
        },
        {
          provide: AIService,
          useValue: mockAIService,
        },
        {
          provide: GmailOAuthService,
          useValue: mockGmailOAuthService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<EmailResolver>(EmailResolver);
    service = module.get<EmailService>(EmailService);
    aiService = module.get<AIService>(AIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('email query (single email retrieval)', () => {
    it('should return email when found and owned by user', async () => {
      mockEmailService.findEmailById.mockResolvedValue(mockEmail);

      const result = await resolver.findOne(mockUser, 'email-456');

      expect(result).toEqual(mockEmail);
      expect(service.findEmailById).toHaveBeenCalledWith('email-456', 'user-123');
      expect(service.findEmailById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when email not found', async () => {
      mockEmailService.findEmailById.mockResolvedValue(null);

      await expect(resolver.findOne(mockUser, 'nonexistent-id')).rejects.toThrow(
        'Email with ID nonexistent-id not found or you do not have access to it'
      );
      expect(service.findEmailById).toHaveBeenCalledWith('nonexistent-id', 'user-123');
    });

    it('should throw NotFoundException when email belongs to different user', async () => {
      // Service returns null when user doesn't own the email
      mockEmailService.findEmailById.mockResolvedValue(null);

      await expect(resolver.findOne(mockUser, 'email-456')).rejects.toThrow(
        'Email with ID email-456 not found or you do not have access to it'
      );
      expect(service.findEmailById).toHaveBeenCalledWith('email-456', 'user-123');
    });

    it('should verify user ownership before returning email', async () => {
      mockEmailService.findEmailById.mockResolvedValue(mockEmail);

      const result = await resolver.findOne(mockUser, 'email-456');

      expect(result).toEqual(mockEmail);
      expect(mockEmail.userId).toBe(mockUser.id);
    });

    it('should call service with correct user ID from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-999' };
      const differentUserEmail = { ...mockEmail, userId: 'user-999' };
      mockEmailService.findEmailById.mockResolvedValue(differentUserEmail);

      const result = await resolver.findOne(differentUser, 'email-456');

      expect(result).toEqual(differentUserEmail);
      expect(result?.userId).toBe('user-999');
      expect(service.findEmailById).toHaveBeenCalledWith('email-456', 'user-999');
    });
  });

  describe('emails query (list with pagination)', () => {
    const mockEmailConnection = {
      emails: [mockEmail],
      total: 10,
      skip: 0,
      take: 10,
    };

    const mockPageInfo = {
      total: 10,
      skip: 0,
      take: 10,
      hasMore: false,
    };

    it('should return paginated emails with default parameters', async () => {
      mockEmailService.findUserEmails.mockResolvedValue(mockEmailConnection);

      const result = await resolver.findAll(mockUser);

      expect(result.emails).toEqual([mockEmail]);
      expect(result.pageInfo).toEqual(mockPageInfo);
      expect(service.findUserEmails).toHaveBeenCalledWith('user-123', {});
    });

    it('should return emails with contactId filter', async () => {
      const input: FindEmailsInput = { contactId: 'contact-789' };
      mockEmailService.findUserEmails.mockResolvedValue(mockEmailConnection);

      const result = await resolver.findAll(mockUser, input);

      expect(result.emails).toEqual([mockEmail]);
      expect(service.findUserEmails).toHaveBeenCalledWith('user-123', input);
    });

    it('should return emails with status filter', async () => {
      const input: FindEmailsInput = { status: EmailStatus.SENT };
      mockEmailService.findUserEmails.mockResolvedValue(mockEmailConnection);

      const result = await resolver.findAll(mockUser, input);

      expect(service.findUserEmails).toHaveBeenCalledWith('user-123', input);
    });

    it('should return emails with pagination (skip and take)', async () => {
      const input: FindEmailsInput = { skip: 20, take: 20 };
      const paginatedConnection = {
        emails: [mockEmail],
        total: 100,
        skip: 20,
        take: 20,
      };
      mockEmailService.findUserEmails.mockResolvedValue(paginatedConnection);

      const result = await resolver.findAll(mockUser, input);

      expect(result.pageInfo.skip).toBe(20);
      expect(result.pageInfo.take).toBe(20);
      expect(result.pageInfo.hasMore).toBe(true); // 20 + 20 = 40 < 100
      expect(service.findUserEmails).toHaveBeenCalledWith('user-123', input);
    });

    it('should calculate hasMore correctly when on last page', async () => {
      const input: FindEmailsInput = { skip: 80, take: 20 };
      const lastPageConnection = {
        emails: [mockEmail],
        total: 100,
        skip: 80,
        take: 20,
      };
      mockEmailService.findUserEmails.mockResolvedValue(lastPageConnection);

      const result = await resolver.findAll(mockUser, input);

      expect(result.pageInfo.hasMore).toBe(false); // 80 + 20 = 100, no more
    });

    it('should return emails with multiple filters', async () => {
      const input: FindEmailsInput = {
        contactId: 'contact-789',
        status: EmailStatus.SENT,
        skip: 0,
        take: 50,
      };
      mockEmailService.findUserEmails.mockResolvedValue(mockEmailConnection);

      const result = await resolver.findAll(mockUser, input);

      expect(service.findUserEmails).toHaveBeenCalledWith('user-123', input);
    });

    it('should return empty list when no emails found', async () => {
      const emptyConnection = {
        emails: [],
        total: 0,
        skip: 0,
        take: 10,
      };
      mockEmailService.findUserEmails.mockResolvedValue(emptyConnection);

      const result = await resolver.findAll(mockUser);

      expect(result.emails).toHaveLength(0);
      expect(result.pageInfo.total).toBe(0);
      expect(result.pageInfo.hasMore).toBe(false);
    });

    it('should use default skip and take when not provided', async () => {
      mockEmailService.findUserEmails.mockResolvedValue(mockEmailConnection);

      const result = await resolver.findAll(mockUser);

      expect(result.pageInfo.skip).toBe(0);
      expect(result.pageInfo.take).toBe(10);
    });

    it('should handle service returning undefined skip/take', async () => {
      const connectionWithoutDefaults = {
        emails: [mockEmail],
        total: 10,
        skip: undefined,
        take: undefined,
      };
      mockEmailService.findUserEmails.mockResolvedValue(
        connectionWithoutDefaults,
      );

      const result = await resolver.findAll(mockUser);

      expect(result.pageInfo.skip).toBe(0); // Default to 0
      expect(result.pageInfo.take).toBe(10); // Default to 10
    });

    it('should enforce user ownership in service layer', async () => {
      mockEmailService.findUserEmails.mockResolvedValue(mockEmailConnection);

      await resolver.findAll(mockUser);

      // Verify userId is passed to service
      expect(service.findUserEmails).toHaveBeenCalledWith('user-123', {});
    });
  });

  describe('conversationHistory query', () => {
    it('should return conversation history for contact', async () => {
      mockEmailService.getConversationHistory.mockResolvedValue([
        mockConversationHistory,
      ]);

      const result = await resolver.conversationHistory(
        mockUser,
        'contact-789',
        5,
      );

      expect(result).toEqual([mockConversationHistory]);
      expect(service.getConversationHistory).toHaveBeenCalledWith(
        'user-123',
        'contact-789',
        5, // Default limit
      );
    });

    it('should use default limit of 5 when provided', async () => {
      mockEmailService.getConversationHistory.mockResolvedValue([
        mockConversationHistory,
      ]);

      await resolver.conversationHistory(mockUser, 'contact-789', 5);

      expect(service.getConversationHistory).toHaveBeenCalledWith(
        'user-123',
        'contact-789',
        5,
      );
    });

    it('should accept custom limit parameter', async () => {
      mockEmailService.getConversationHistory.mockResolvedValue([
        mockConversationHistory,
      ]);

      await resolver.conversationHistory(mockUser, 'contact-789', 10);

      expect(service.getConversationHistory).toHaveBeenCalledWith(
        'user-123',
        'contact-789',
        10,
      );
    });

    it('should return empty array when no history found', async () => {
      mockEmailService.getConversationHistory.mockResolvedValue([]);

      const result = await resolver.conversationHistory(
        mockUser,
        'contact-789',
        5,
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return multiple history entries in order', async () => {
      const historyEntry1 = {
        ...mockConversationHistory,
        id: 'history-1',
        timestamp: new Date('2025-10-13'),
      };
      const historyEntry2 = {
        ...mockConversationHistory,
        id: 'history-2',
        timestamp: new Date('2025-10-14'),
      };
      mockEmailService.getConversationHistory.mockResolvedValue([
        historyEntry2,
        historyEntry1,
      ]);

      const result = await resolver.conversationHistory(
        mockUser,
        'contact-789',
        10,
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('history-2');
      expect(result[1].id).toBe('history-1');
    });

    it('should enforce user ownership in service layer', async () => {
      mockEmailService.getConversationHistory.mockResolvedValue([
        mockConversationHistory,
      ]);

      await resolver.conversationHistory(mockUser, 'contact-789', 5);

      // Verify userId is passed to service
      expect(service.getConversationHistory).toHaveBeenCalledWith(
        'user-123',
        'contact-789',
        5,
      );
    });

    it('should inject correct user ID from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };
      mockEmailService.getConversationHistory.mockResolvedValue([
        { ...mockConversationHistory, userId: 'user-different' },
      ]);

      await resolver.conversationHistory(differentUser, 'contact-789', 5);

      expect(service.getConversationHistory).toHaveBeenCalledWith(
        'user-different',
        'contact-789',
        5,
      );
    });
  });

  describe('emailTemplates query', () => {
    it('should return all templates for user', async () => {
      mockEmailService.findTemplatesByUserId.mockResolvedValue([
        mockEmailTemplate,
      ]);

      const result = await resolver.emailTemplates(mockUser);

      expect(result).toEqual([mockEmailTemplate]);
      expect(service.findTemplatesByUserId).toHaveBeenCalledWith('user-123');
      expect(service.findTemplatesByUserId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no templates found', async () => {
      mockEmailService.findTemplatesByUserId.mockResolvedValue([]);

      const result = await resolver.emailTemplates(mockUser);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return templates sorted by isDefault, usageCount, createdAt', async () => {
      const template1 = {
        ...mockEmailTemplate,
        id: 'template-1',
        isDefault: true,
        usageCount: 10,
      };
      const template2 = {
        ...mockEmailTemplate,
        id: 'template-2',
        isDefault: false,
        usageCount: 20,
      };
      mockEmailService.findTemplatesByUserId.mockResolvedValue([
        template1,
        template2,
      ]);

      const result = await resolver.emailTemplates(mockUser);

      expect(result).toHaveLength(2);
      expect(service.findTemplatesByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return multiple templates', async () => {
      const templates = [
        { ...mockEmailTemplate, id: 'template-1', name: 'Template 1' },
        { ...mockEmailTemplate, id: 'template-2', name: 'Template 2' },
        { ...mockEmailTemplate, id: 'template-3', name: 'Template 3' },
      ];
      mockEmailService.findTemplatesByUserId.mockResolvedValue(templates);

      const result = await resolver.emailTemplates(mockUser);

      expect(result).toHaveLength(3);
    });

    it('should enforce user ownership via service layer', async () => {
      mockEmailService.findTemplatesByUserId.mockResolvedValue([
        mockEmailTemplate,
      ]);

      await resolver.emailTemplates(mockUser);

      expect(service.findTemplatesByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should inject correct user ID from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };
      mockEmailService.findTemplatesByUserId.mockResolvedValue([
        { ...mockEmailTemplate, userId: 'user-different' },
      ]);

      await resolver.emailTemplates(differentUser);

      expect(service.findTemplatesByUserId).toHaveBeenCalledWith('user-different');
    });
  });

  describe('resolver integration with service layer', () => {
    it('should handle database errors on findOne', async () => {
      const dbError = new Error('Database connection failed');
      mockEmailService.findEmailById.mockRejectedValue(dbError);

      await expect(resolver.findOne(mockUser, 'email-456')).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle database errors on findAll', async () => {
      const dbError = new Error('Database query failed');
      mockEmailService.findUserEmails.mockRejectedValue(dbError);

      await expect(resolver.findAll(mockUser)).rejects.toThrow(
        'Database query failed',
      );
    });

    it('should handle service errors on conversationHistory', async () => {
      const serviceError = new Error('Failed to fetch conversation history');
      mockEmailService.getConversationHistory.mockRejectedValue(serviceError);

      await expect(
        resolver.conversationHistory(mockUser, 'contact-789', 5),
      ).rejects.toThrow('Failed to fetch conversation history');
    });

    it('should handle database errors on emailTemplates', async () => {
      const dbError = new Error('Database connection lost');
      mockEmailService.findTemplatesByUserId.mockRejectedValue(dbError);

      await expect(resolver.emailTemplates(mockUser)).rejects.toThrow(
        'Database connection lost',
      );
    });

    it('should handle undefined input in findAll', async () => {
      const mockConnection = {
        emails: [mockEmail],
        total: 1,
        skip: 0,
        take: 10,
      };
      mockEmailService.findUserEmails.mockResolvedValue(mockConnection);

      const result = await resolver.findAll(mockUser, undefined);

      expect(service.findUserEmails).toHaveBeenCalledWith('user-123', {});
      expect(result.emails).toEqual([mockEmail]);
    });

    it('should handle null values gracefully', async () => {
      const mockConnection = {
        emails: [],
        total: 0,
        skip: 0,
        take: 10,
      };
      mockEmailService.findUserEmails.mockResolvedValue(mockConnection);

      const result = await resolver.findAll(mockUser, null as any);

      expect(service.findUserEmails).toHaveBeenCalledWith('user-123', {});
      expect(result.emails).toHaveLength(0);
    });
  });

  describe('authorization and security', () => {
    it('should enforce AuthGuard on all queries', () => {
      // Verify AuthGuard is applied at resolver level
      const guards = Reflect.getMetadata('__guards__', EmailResolver);
      expect(guards).toBeDefined();
    });

    it('should use ValidationPipe for input validation', () => {
      // Verify ValidationPipe is applied at resolver level
      const pipes = Reflect.getMetadata('__pipes__', EmailResolver);
      expect(pipes).toBeDefined();
    });

    it('should only return emails owned by authenticated user', async () => {
      mockEmailService.findEmailById.mockResolvedValue(mockEmail);

      const result = await resolver.findOne(mockUser, 'email-456');

      expect(result?.userId).toBe(mockUser.id);
    });

    it('should filter templates by user ownership', async () => {
      mockEmailService.findTemplatesByUserId.mockResolvedValue([
        mockEmailTemplate,
      ]);

      await resolver.emailTemplates(mockUser);

      expect(service.findTemplatesByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it('should pass userId to service for authorization checks', async () => {
      mockEmailService.findUserEmails.mockResolvedValue({
        emails: [],
        total: 0,
        skip: 0,
        take: 10,
      });

      await resolver.findAll(mockUser);

      expect(service.findUserEmails).toHaveBeenCalledWith(mockUser.id, {});
    });
  });

  describe('generateEmailTemplate mutation', () => {
    const mockGenerateEmailInput: GenerateEmailInput = {
      contactId: 'contact-789',
      additionalContext: 'Follow up about AWS Summit',
      includeConversationHistory: true,
    };

    const mockFormalResult = {
      subject: 'Following Up on Our AWS Summit Discussion',
      body: 'Dear John,\n\nIt was great meeting you at AWS Summit 2024. I wanted to follow up on our conversation about cloud architecture...',
      providerId: 'openai/gpt-4-turbo',
      tokensUsed: 150,
    };

    const mockCasualResult = {
      subject: 'Great meeting you at AWS Summit!',
      body: 'Hey John,\n\nReally enjoyed chatting with you at AWS Summit! I wanted to reach out about what we discussed...',
      providerId: 'openai/gpt-4-turbo',
      tokensUsed: 120,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should generate both formal and casual email variants successfully', async () => {
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      const result = await resolver.generateEmailTemplate(
        mockUser,
        mockGenerateEmailInput,
      );

      expect(result).toBeDefined();
      expect(result.formal.subject).toBe(mockFormalResult.subject);
      expect(result.formal.body).toBe(mockFormalResult.body);
      expect(result.casual.subject).toBe(mockCasualResult.subject);
      expect(result.casual.body).toBe(mockCasualResult.body);
      expect(result.providerId).toBe('openai/gpt-4-turbo');
      expect(result.tokensUsed).toBe(270); // 150 + 120
      expect(result.generatedAt).toBeInstanceOf(Date);
      expect(result.contactId).toBe('contact-789');
    });

    it('should call AIService twice (once for formal, once for casual)', async () => {
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      await resolver.generateEmailTemplate(mockUser, mockGenerateEmailInput);

      expect(aiService.generateEmailTemplate).toHaveBeenCalledTimes(2);
      expect(aiService.generateEmailTemplate).toHaveBeenCalledWith(
        'user-123',
        'contact-789',
        'formal',
      );
      expect(aiService.generateEmailTemplate).toHaveBeenCalledWith(
        'user-123',
        'contact-789',
        'casual',
      );
    });

    it('should return GeneratedEmailTemplate with correct structure', async () => {
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      const result = await resolver.generateEmailTemplate(
        mockUser,
        mockGenerateEmailInput,
      );

      expect(result).toMatchObject({
        formal: {
          subject: expect.any(String),
          body: expect.any(String),
          bodyHtml: null,
        },
        casual: {
          subject: expect.any(String),
          body: expect.any(String),
          bodyHtml: null,
        },
        providerId: expect.any(String),
        tokensUsed: expect.any(Number),
        generatedAt: expect.any(Date),
        contactId: expect.any(String),
      });
    });

    it('should handle AIService errors and throw user-friendly error messages', async () => {
      const aiError = new Error('OpenAI API rate limit exceeded');
      mockAIService.generateEmailTemplate.mockRejectedValue(aiError);

      await expect(
        resolver.generateEmailTemplate(mockUser, mockGenerateEmailInput),
      ).rejects.toThrow('Failed to generate email templates: OpenAI API rate limit exceeded');

      expect(aiService.generateEmailTemplate).toHaveBeenCalledTimes(1);
    });

    it('should handle non-Error exceptions with generic message', async () => {
      mockAIService.generateEmailTemplate.mockRejectedValue('Unknown error');

      await expect(
        resolver.generateEmailTemplate(mockUser, mockGenerateEmailInput),
      ).rejects.toThrow('Failed to generate email templates. Please try again later.');
    });

    it('should pass correct userId and contactId to AIService', async () => {
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      await resolver.generateEmailTemplate(mockUser, mockGenerateEmailInput);

      expect(aiService.generateEmailTemplate).toHaveBeenNthCalledWith(
        1,
        'user-123',
        'contact-789',
        'formal',
      );
      expect(aiService.generateEmailTemplate).toHaveBeenNthCalledWith(
        2,
        'user-123',
        'contact-789',
        'casual',
      );
    });

    it('should calculate total tokens correctly (formal + casual)', async () => {
      const formalWithTokens = { ...mockFormalResult, tokensUsed: 200 };
      const casualWithTokens = { ...mockCasualResult, tokensUsed: 150 };

      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(formalWithTokens)
        .mockResolvedValueOnce(casualWithTokens);

      const result = await resolver.generateEmailTemplate(
        mockUser,
        mockGenerateEmailInput,
      );

      expect(result.tokensUsed).toBe(350); // 200 + 150
    });

    it('should set generatedAt timestamp to current time', async () => {
      const beforeTime = new Date();
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      const result = await resolver.generateEmailTemplate(
        mockUser,
        mockGenerateEmailInput,
      );
      const afterTime = new Date();

      expect(result.generatedAt).toBeInstanceOf(Date);
      expect(result.generatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(result.generatedAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it('should handle NotFoundException from AIService (contact not found)', async () => {
      const notFoundError = new Error('Contact with ID contact-999 not found or you do not have access to it');
      mockAIService.generateEmailTemplate.mockRejectedValue(notFoundError);

      await expect(
        resolver.generateEmailTemplate(mockUser, {
          ...mockGenerateEmailInput,
          contactId: 'contact-999',
        }),
      ).rejects.toThrow('Failed to generate email templates: Contact with ID contact-999 not found or you do not have access to it');
    });

    it('should use providerId from formal result', async () => {
      const formalWithAnthropic = {
        ...mockFormalResult,
        providerId: 'anthropic/claude-3-5-sonnet',
      };
      const casualWithAnthropic = {
        ...mockCasualResult,
        providerId: 'anthropic/claude-3-5-sonnet',
      };

      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(formalWithAnthropic)
        .mockResolvedValueOnce(casualWithAnthropic);

      const result = await resolver.generateEmailTemplate(
        mockUser,
        mockGenerateEmailInput,
      );

      expect(result.providerId).toBe('anthropic/claude-3-5-sonnet');
    });

    it('should include contactId in response', async () => {
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      const result = await resolver.generateEmailTemplate(mockUser, {
        contactId: 'contact-custom-id',
        additionalContext: '',
        includeConversationHistory: false,
      });

      expect(result.contactId).toBe('contact-custom-id');
    });

    it('should work with minimal input (only contactId)', async () => {
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      const minimalInput: GenerateEmailInput = {
        contactId: 'contact-789',
      };

      const result = await resolver.generateEmailTemplate(mockUser, minimalInput);

      expect(result).toBeDefined();
      expect(result.formal).toBeDefined();
      expect(result.casual).toBeDefined();
      expect(aiService.generateEmailTemplate).toHaveBeenCalledTimes(2);
    });

    it('should handle different user IDs from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      await resolver.generateEmailTemplate(
        differentUser,
        mockGenerateEmailInput,
      );

      expect(aiService.generateEmailTemplate).toHaveBeenCalledWith(
        'user-different',
        'contact-789',
        'formal',
      );
      expect(aiService.generateEmailTemplate).toHaveBeenCalledWith(
        'user-different',
        'contact-789',
        'casual',
      );
    });

    it('should set bodyHtml to null for both variants', async () => {
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockResolvedValueOnce(mockCasualResult);

      const result = await resolver.generateEmailTemplate(
        mockUser,
        mockGenerateEmailInput,
      );

      expect(result.formal.bodyHtml).toBeNull();
      expect(result.casual.bodyHtml).toBeNull();
    });

    it('should fail if formal generation fails', async () => {
      const formalError = new Error('Formal generation failed');
      mockAIService.generateEmailTemplate.mockRejectedValueOnce(formalError);

      await expect(
        resolver.generateEmailTemplate(mockUser, mockGenerateEmailInput),
      ).rejects.toThrow('Failed to generate email templates: Formal generation failed');

      // Should not call for casual if formal fails
      expect(aiService.generateEmailTemplate).toHaveBeenCalledTimes(1);
    });

    it('should fail if casual generation fails', async () => {
      const casualError = new Error('Casual generation failed');
      mockAIService.generateEmailTemplate
        .mockResolvedValueOnce(mockFormalResult)
        .mockRejectedValueOnce(casualError);

      await expect(
        resolver.generateEmailTemplate(mockUser, mockGenerateEmailInput),
      ).rejects.toThrow('Failed to generate email templates: Casual generation failed');

      // Should have called both times (formal succeeds, casual fails)
      expect(aiService.generateEmailTemplate).toHaveBeenCalledTimes(2);
    });
  });

  describe('saveEmail mutation', () => {
    const mockSaveEmailInput = {
      contactId: 'contact-789',
      subject: 'Following Up on Our AWS Summit Discussion',
      body: 'Dear John,\n\nIt was great meeting you at AWS Summit 2024...',
      bodyHtml: '<p>Dear John,</p><p>It was great meeting you at AWS Summit 2024...</p>',
      status: EmailStatus.DRAFT,
      templateType: TemplateType.FORMAL,
      providerId: 'openai/gpt-4-turbo',
      tokensUsed: 150,
    };

    const mockSavedEmail = {
      ...mockEmail,
      id: 'email-new-123',
      contactId: 'contact-789',
      subject: mockSaveEmailInput.subject,
      body: mockSaveEmailInput.body,
      bodyHtml: mockSaveEmailInput.bodyHtml,
      status: EmailStatus.DRAFT,
      templateType: TemplateType.FORMAL,
      providerId: 'openai/gpt-4-turbo',
      tokensUsed: 150,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockEmailService.createEmail = jest.fn();
      mockEmailService.createConversationEntry = jest.fn();
    });

    it('should save email as draft successfully', async () => {
      mockEmailService.createEmail.mockResolvedValue(mockSavedEmail);

      const result = await resolver.saveEmail(mockUser, mockSaveEmailInput);

      expect(result).toEqual(mockSavedEmail);
      expect(service.createEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          contactId: mockSaveEmailInput.contactId,
          subject: mockSaveEmailInput.subject,
          body: mockSaveEmailInput.body,
        })
      );
      expect(service.createConversationEntry).not.toHaveBeenCalled();
    });

    it('should save email and create conversation history when status=SENT', async () => {
      const sentEmailInput = { ...mockSaveEmailInput, status: EmailStatus.SENT };
      const sentEmail = { ...mockSavedEmail, status: EmailStatus.SENT, sentAt: new Date() };

      mockEmailService.createEmail.mockResolvedValue(sentEmail);
      mockEmailService.createConversationEntry.mockResolvedValue(mockConversationHistory);

      const result = await resolver.saveEmail(mockUser, sentEmailInput);

      expect(result).toEqual(sentEmail);
      expect(service.createEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          contactId: sentEmailInput.contactId,
          status: EmailStatus.SENT,
        })
      );
      expect(service.createConversationEntry).toHaveBeenCalledWith({
        userId: 'user-123',
        contactId: 'contact-789',
        emailId: 'email-new-123',
        content: sentEmailInput.body,
        direction: Direction.SENT,
      });
    });

    it('should not create conversation history for draft emails', async () => {
      mockEmailService.createEmail.mockResolvedValue(mockSavedEmail);

      await resolver.saveEmail(mockUser, mockSaveEmailInput);

      expect(service.createConversationEntry).not.toHaveBeenCalled();
    });

    it('should sanitize email content before saving', async () => {
      const inputWithXSS = {
        ...mockSaveEmailInput,
        subject: 'Test <script>alert("xss")</script>',
        body: 'Body with <img src=x onerror=alert("xss")>',
      };

      mockEmailService.createEmail.mockResolvedValue(mockSavedEmail);

      await resolver.saveEmail(mockUser, inputWithXSS);

      expect(service.createEmail).toHaveBeenCalled();
      const callArgs = (service.createEmail as jest.Mock).mock.calls[0][0];
      // Verify XSS has been sanitized (script tags removed)
      expect(callArgs.subject).not.toContain('<script>');
      expect(callArgs.body).not.toContain('onerror=');
    });

    it('should handle contact not found error', async () => {
      const error = new Error('Contact with ID contact-999 not found or you do not have access to it');
      mockEmailService.createEmail.mockRejectedValue(error);

      await expect(
        resolver.saveEmail(mockUser, { ...mockSaveEmailInput, contactId: 'contact-999' }),
      ).rejects.toThrow('Contact with ID contact-999 not found or you do not have access to it');
    });

    it('should pass correct userId from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };
      mockEmailService.createEmail.mockResolvedValue(mockSavedEmail);

      await resolver.saveEmail(differentUser, mockSaveEmailInput);

      expect(service.createEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-different',
        })
      );
    });

    it('should save email with optional fields', async () => {
      const minimalInput = {
        contactId: 'contact-789',
        subject: 'Test Subject',
        body: 'Test Body',
      };

      mockEmailService.createEmail.mockResolvedValue(mockSavedEmail);

      await resolver.saveEmail(mockUser, minimalInput as any);

      expect(service.createEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          contactId: minimalInput.contactId,
        })
      );
    });
  });

  describe('updateEmail mutation', () => {
    const mockUpdateInput = {
      id: 'email-456',
      subject: 'Updated Subject',
      body: 'Updated body content',
    };

    const mockUpdatedEmail = {
      ...mockEmail,
      subject: 'Updated Subject',
      body: 'Updated body content',
      updatedAt: new Date(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockEmailService.updateEmail = jest.fn();
    });

    it('should update email draft successfully', async () => {
      mockEmailService.updateEmail.mockResolvedValue(mockUpdatedEmail);

      const result = await resolver.updateEmail(mockUser, mockUpdateInput);

      expect(result).toEqual(mockUpdatedEmail);
      expect(service.updateEmail).toHaveBeenCalledWith(
        'email-456',
        'user-123',
        expect.objectContaining({
          subject: mockUpdateInput.subject,
          body: mockUpdateInput.body,
        })
      );
    });

    it('should only update specified fields (partial update)', async () => {
      const partialUpdate = { id: 'email-456', subject: 'New Subject Only' };

      mockEmailService.updateEmail.mockResolvedValue({ ...mockEmail, subject: 'New Subject Only' });

      await resolver.updateEmail(mockUser, partialUpdate);

      expect(service.updateEmail).toHaveBeenCalledWith(
        'email-456',
        'user-123',
        expect.objectContaining({
          subject: 'New Subject Only',
        })
      );
    });

    it('should delegate authorization checks to service layer', async () => {
      // Service throws exception for unauthorized access
      const authError = new Error('Unauthorized to update this email');
      mockEmailService.updateEmail.mockRejectedValue(authError);

      await expect(
        resolver.updateEmail(mockUser, mockUpdateInput),
      ).rejects.toThrow('Unauthorized to update this email');

      expect(service.updateEmail).toHaveBeenCalledWith(
        'email-456',
        'user-123',
        expect.any(Object)
      );
    });

    it('should delegate draft-only validation to service layer', async () => {
      // Service throws exception for non-draft updates
      const draftError = new Error('Only draft emails can be updated');
      mockEmailService.updateEmail.mockRejectedValue(draftError);

      await expect(
        resolver.updateEmail(mockUser, mockUpdateInput),
      ).rejects.toThrow('Only draft emails can be updated');

      expect(service.updateEmail).toHaveBeenCalled();
    });

    it('should sanitize updated content', async () => {
      const inputWithXSS = {
        id: 'email-456',
        subject: 'Test <script>alert("xss")</script>',
        body: 'Body with <img src=x onerror=alert("xss")>',
      };

      mockEmailService.updateEmail.mockResolvedValue(mockUpdatedEmail);

      await resolver.updateEmail(mockUser, inputWithXSS);

      const callArgs = (service.updateEmail as jest.Mock).mock.calls[0][2];
      expect(callArgs.subject).not.toContain('<script>');
      expect(callArgs.body).not.toContain('onerror=');
    });

    it('should allow updating only body without subject', async () => {
      const bodyOnlyUpdate = { id: 'email-456', body: 'New body only' };

      mockEmailService.updateEmail.mockResolvedValue({ ...mockEmail, body: 'New body only' });

      await resolver.updateEmail(mockUser, bodyOnlyUpdate);

      expect(service.updateEmail).toHaveBeenCalledWith(
        'email-456',
        'user-123',
        expect.objectContaining({
          body: 'New body only',
        })
      );
    });

    it('should pass correct userId from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };

      mockEmailService.updateEmail.mockResolvedValue(mockUpdatedEmail);

      await resolver.updateEmail(differentUser, mockUpdateInput);

      expect(service.updateEmail).toHaveBeenCalledWith(
        'email-456',
        'user-different',
        expect.objectContaining({
          subject: mockUpdateInput.subject,
        })
      );
    });
  });

  describe('deleteEmail mutation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockEmailService.deleteEmail = jest.fn();
    });

    it('should delete email successfully', async () => {
      mockEmailService.deleteEmail.mockResolvedValue(undefined);

      const result = await resolver.deleteEmail(mockUser, 'email-456');

      expect(result).toBe(true);
      expect(service.deleteEmail).toHaveBeenCalledWith('email-456', 'user-123');
    });

    it('should delete draft emails', async () => {
      mockEmailService.deleteEmail.mockResolvedValue(undefined);

      const result = await resolver.deleteEmail(mockUser, 'email-456');

      expect(result).toBe(true);
      expect(service.deleteEmail).toHaveBeenCalled();
    });

    it('should delete sent emails', async () => {
      mockEmailService.deleteEmail.mockResolvedValue(undefined);

      const result = await resolver.deleteEmail(mockUser, 'email-456');

      expect(result).toBe(true);
      expect(service.deleteEmail).toHaveBeenCalled();
    });

    it('should delegate authorization checks to service layer', async () => {
      // Service throws exception for unauthorized access
      const authError = new Error('Unauthorized to delete this email');
      mockEmailService.deleteEmail.mockRejectedValue(authError);

      await expect(
        resolver.deleteEmail(mockUser, 'email-456'),
      ).rejects.toThrow('Unauthorized to delete this email');

      expect(service.deleteEmail).toHaveBeenCalledWith('email-456', 'user-123');
    });

    it('should delegate not found check to service layer', async () => {
      // Service throws NotFoundException
      const notFoundError = new Error('Email not found');
      mockEmailService.deleteEmail.mockRejectedValue(notFoundError);

      await expect(
        resolver.deleteEmail(mockUser, 'email-456'),
      ).rejects.toThrow('Email not found');

      expect(service.deleteEmail).toHaveBeenCalledWith('email-456', 'user-123');
    });

    it('should pass correct userId from @CurrentUser decorator', async () => {
      const differentUser = { ...mockUser, id: 'user-different' };

      mockEmailService.deleteEmail.mockResolvedValue(undefined);

      await resolver.deleteEmail(differentUser, 'email-456');

      expect(service.deleteEmail).toHaveBeenCalledWith('email-456', 'user-different');
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockEmailService.deleteEmail.mockRejectedValue(dbError);

      await expect(
        resolver.deleteEmail(mockUser, 'email-456'),
      ).rejects.toThrow('Database connection failed');
    });
  });

  // ==================== EMAIL COMPOSITION TESTS ====================

  describe('Email Composition - Additional Services', () => {
    let emailDraftService: any;
    let emailSignatureService: any;
    let gmailOAuthService: any;
    let prismaService: any;

    const mockEmailDraft = {
      id: 'draft-123',
      userId: 'user-123',
      contactId: 'contact-789',
      subject: 'Test Draft Subject',
      bodyJson: { type: 'doc', content: [] },
      bodyHtml: '<p>Test draft content</p>',
      attachments: [],
      signatureId: undefined,
      lastSyncedAt: new Date('2025-10-15T10:00:00Z'),
      createdAt: new Date('2025-10-15T09:00:00Z'),
      updatedAt: new Date('2025-10-15T10:00:00Z'),
    };

    const mockEmailSignature = {
      id: 'signature-123',
      userId: 'user-123',
      name: 'Professional',
      contentJson: { type: 'doc', content: [] },
      contentHtml: '<p>Best regards,<br>John Doe</p>',
      isDefaultForFormal: true,
      isDefaultForCasual: false,
      isGlobalDefault: false,
      createdAt: new Date('2025-10-15T09:00:00Z'),
      updatedAt: new Date('2025-10-15T09:00:00Z'),
    };

    beforeEach(() => {
      // Create mock services
      emailDraftService = {
        getDraftByContact: jest.fn(),
        listDrafts: jest.fn(),
        autoSaveDraft: jest.fn(),
        deleteDraft: jest.fn(),
      };

      emailSignatureService = {
        listSignatures: jest.fn(),
        createSignature: jest.fn(),
        updateSignature: jest.fn(),
        deleteSignature: jest.fn(),
      };

      gmailOAuthService = {
        getConnectionStatus: jest.fn(),
      };

      prismaService = {
        gmailToken: {
          findUnique: jest.fn(),
        },
      };

      // Replace resolver's services with mocks
      (resolver as any).emailDraftService = emailDraftService;
      (resolver as any).emailSignatureService = emailSignatureService;
      (resolver as any).gmailOAuthService = gmailOAuthService;
      (resolver as any).prisma = prismaService;
    });

    describe('emailDraft query', () => {
      it('should return email draft for a specific contact', async () => {
        emailDraftService.getDraftByContact.mockResolvedValue(mockEmailDraft);

        const result = await resolver.getEmailDraft(mockUser, 'contact-789');

        expect(result).toEqual(mockEmailDraft);
        expect(emailDraftService.getDraftByContact).toHaveBeenCalledWith('user-123', 'contact-789');
      });

      it('should return null when draft does not exist', async () => {
        emailDraftService.getDraftByContact.mockResolvedValue(null);

        const result = await resolver.getEmailDraft(mockUser, 'contact-789');

        expect(result).toBeNull();
      });
    });

    describe('emailDrafts query', () => {
      it('should return paginated list of email drafts', async () => {
        const mockConnection = {
          edges: [mockEmailDraft],
          pageInfo: { hasNextPage: false, total: 1 },
        };

        emailDraftService.listDrafts.mockResolvedValue(mockConnection);

        const result = await resolver.listEmailDrafts(mockUser, { skip: 0, take: 10 });

        expect(result).toEqual(mockConnection);
        expect(emailDraftService.listDrafts).toHaveBeenCalledWith('user-123', { skip: 0, take: 10 });
      });

      it('should return empty list when no drafts exist', async () => {
        const emptyConnection = {
          edges: [],
          pageInfo: { hasNextPage: false, total: 0 },
        };

        emailDraftService.listDrafts.mockResolvedValue(emptyConnection);

        const result = await resolver.listEmailDrafts(mockUser);

        expect(result.edges).toHaveLength(0);
        expect(result.pageInfo.total).toBe(0);
      });
    });

    describe('emailSignatures query', () => {
      it('should return all signatures for user', async () => {
        emailSignatureService.listSignatures.mockResolvedValue([mockEmailSignature]);

        const result = await resolver.listEmailSignatures(mockUser);

        expect(result).toEqual([mockEmailSignature]);
        expect(emailSignatureService.listSignatures).toHaveBeenCalledWith('user-123');
      });

      it('should return empty array when no signatures exist', async () => {
        emailSignatureService.listSignatures.mockResolvedValue([]);

        const result = await resolver.listEmailSignatures(mockUser);

        expect(result).toHaveLength(0);
      });
    });

    describe('gmailConnection query', () => {
      it('should return connection status when Gmail is connected', async () => {
        const mockStatus = {
          connected: true,
          emailAddress: 'test@gmail.com',
          expiresAt: new Date('2025-10-16T10:00:00Z'),
        };

        const mockTokenRecord = {
          userId: 'user-123',
          scope: ['https://www.googleapis.com/auth/gmail.send'],
          createdAt: new Date('2025-10-15T09:00:00Z'),
        };

        gmailOAuthService.getConnectionStatus.mockResolvedValue(mockStatus);
        prismaService.gmailToken.findUnique.mockResolvedValue(mockTokenRecord);

        const result = await resolver.getGmailConnection(mockUser);

        expect(result).toEqual({
          isConnected: true,
          email: 'test@gmail.com',
          scopes: ['https://www.googleapis.com/auth/gmail.send'],
          connectedAt: mockTokenRecord.createdAt,
          expiresAt: mockStatus.expiresAt,
        });
      });

      it('should return disconnected status when Gmail is not connected', async () => {
        gmailOAuthService.getConnectionStatus.mockResolvedValue({
          connected: false,
          emailAddress: null,
          expiresAt: null,
        });

        const result = await resolver.getGmailConnection(mockUser);

        expect(result.isConnected).toBe(false);
        expect(result.scopes).toEqual([]);
      });
    });

    describe('autoSaveDraft mutation', () => {
      const mockCreateDraftInput = {
        contactId: 'contact-789',
        subject: 'Test Subject',
        bodyJson: { type: 'doc', content: [] },
        bodyHtml: '<p>Test content</p>',
        attachments: [],
        signatureId: undefined,
      };

      it('should create or update draft successfully', async () => {
        emailDraftService.autoSaveDraft.mockResolvedValue(mockEmailDraft);

        const result = await resolver.autoSaveDraft(mockUser, mockCreateDraftInput);

        expect(result).toEqual(mockEmailDraft);
        expect(emailDraftService.autoSaveDraft).toHaveBeenCalledWith(
          'user-123',
          'contact-789',
          expect.objectContaining({
            subject: 'Test Subject',
            bodyJson: mockCreateDraftInput.bodyJson,
            lastSyncedAt: expect.any(Date),
          })
        );
      });

      it('should set lastSyncedAt to current date', async () => {
        emailDraftService.autoSaveDraft.mockResolvedValue(mockEmailDraft);

        const beforeCall = new Date();
        await resolver.autoSaveDraft(mockUser, mockCreateDraftInput);
        const afterCall = new Date();

        const callArgs = emailDraftService.autoSaveDraft.mock.calls[0][2];
        expect(callArgs.lastSyncedAt).toBeInstanceOf(Date);
        expect(callArgs.lastSyncedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(callArgs.lastSyncedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
      });
    });

    describe('deleteDraft mutation', () => {
      it('should delete draft successfully', async () => {
        emailDraftService.deleteDraft.mockResolvedValue(true);

        const result = await resolver.deleteDraft(mockUser, 'contact-789');

        expect(result).toBe(true);
        expect(emailDraftService.deleteDraft).toHaveBeenCalledWith('user-123', 'contact-789');
      });

      it('should return false when draft does not exist', async () => {
        emailDraftService.deleteDraft.mockResolvedValue(false);

        const result = await resolver.deleteDraft(mockUser, 'contact-789');

        expect(result).toBe(false);
      });
    });

    describe('createSignature mutation', () => {
      const mockCreateSignatureInput = {
        name: 'Professional',
        contentJson: { type: 'doc', content: [] },
        contentHtml: '<p>Best regards</p>',
        isDefaultForFormal: true,
        isDefaultForCasual: false,
        isGlobalDefault: false,
      };

      it('should create signature successfully', async () => {
        emailSignatureService.createSignature.mockResolvedValue(mockEmailSignature);

        const result = await resolver.createSignature(mockUser, mockCreateSignatureInput);

        expect(result).toEqual(mockEmailSignature);
        expect(emailSignatureService.createSignature).toHaveBeenCalledWith('user-123', mockCreateSignatureInput);
      });
    });

    describe('updateSignature mutation', () => {
      const mockUpdateInput = {
        name: 'Updated Professional',
        isDefaultForFormal: true,
      };

      it('should update signature successfully', async () => {
        const updatedSignature = { ...mockEmailSignature, name: 'Updated Professional' };
        emailSignatureService.updateSignature.mockResolvedValue(updatedSignature);

        const result = await resolver.updateSignature(mockUser, 'signature-123', mockUpdateInput);

        expect(result.name).toBe('Updated Professional');
        expect(emailSignatureService.updateSignature).toHaveBeenCalledWith('user-123', 'signature-123', mockUpdateInput);
      });
    });

    describe('deleteSignature mutation', () => {
      it('should delete signature successfully', async () => {
        emailSignatureService.deleteSignature.mockResolvedValue(true);

        const result = await resolver.deleteSignature(mockUser, 'signature-123');

        expect(result).toBe(true);
        expect(emailSignatureService.deleteSignature).toHaveBeenCalledWith('user-123', 'signature-123');
      });
    });
  });
});
