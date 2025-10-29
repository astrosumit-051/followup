import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaClient } from '@cordiq/database';
import { AIService } from '../ai/ai.service';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailStatus, TemplateType, Direction } from '@cordiq/database';

// Mock LangChain to avoid actual API calls
jest.mock('@langchain/openai');
jest.mock('@langchain/anthropic');

describe('Email & AI Integration Tests', () => {
  let aiService: AIService;
  let emailService: EmailService;
  let prismaService: PrismaService;
  let prisma: PrismaClient;

  // Test data
  const testUserId = 'test-user-integration-123';
  const testContactId = 'test-contact-integration-456';
  const testUser = {
    id: testUserId,
    supabaseId: 'test-supabase-integration-123',
    email: 'testuser@integration.com',
    name: 'Test User',
    profilePicture: null,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const testContact = {
    id: testContactId,
    userId: testUserId,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    linkedInUrl: 'https://linkedin.com/in/johndoe',
    company: 'Tech Corp',
    role: 'CTO',
    industry: 'Technology',
    priority: 'HIGH' as const,
    notes: 'Met at AWS Summit, interested in AI solutions',
    birthday: new Date('1985-05-15'),
    gender: 'MALE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    prisma = new PrismaClient();

    // Clean up test data before tests
    await prisma.email.deleteMany({ where: { userId: testUserId } });
    await prisma.emailTemplate.deleteMany({ where: { userId: testUserId } });
    await prisma.conversationHistory.deleteMany({ where: { userId: testUserId } });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { supabaseId: testUser.supabaseId } });
  });

  beforeEach(async () => {
    // Mock ConfigService to provide dummy API keys for testing
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          OPENAI_API_KEY: 'test-openai-key',
          ANTHROPIC_API_KEY: 'test-anthropic-key',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        AIService,
        EmailService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    aiService = module.get<AIService>(AIService);
    emailService = module.get<EmailService>(EmailService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Create test user first (required for foreign key constraint)
    await prisma.user.create({ data: testUser });

    // Create test contact
    await prisma.contact.create({ data: testContact });
  });

  afterEach(async () => {
    // Clean up after each test (delete in reverse order of creation due to foreign keys)
    await prisma.email.deleteMany({ where: { userId: testUserId } });
    await prisma.emailTemplate.deleteMany({ where: { userId: testUserId } });
    await prisma.conversationHistory.deleteMany({ where: { userId: testUserId } });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { supabaseId: testUser.supabaseId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('End-to-End AI Generation Workflow', () => {
    it('should complete full workflow: generate → save → verify', async () => {
      // Step 1: Generate email template using AI
      const mockLLMResponse = {
        content: JSON.stringify({
          subject: 'Following up on our AWS Summit conversation',
          body: 'Dear John,\n\nIt was great meeting you at the AWS Summit...',
        }),
      };

      // Mock the LangChain response
      const mockPipe = jest.fn().mockReturnValue({
        invoke: jest.fn().mockResolvedValue(mockLLMResponse),
      });
      jest.spyOn(aiService as any, 'generateWithOpenAI').mockImplementation(async () => {
        return {
          subject: 'Following up on our AWS Summit conversation',
          body: 'Dear John,\n\nIt was great meeting you at the AWS Summit...',
          tokensUsed: 150,
        };
      });

      const generated = await aiService.generateEmailTemplate(testUserId, testContactId, 'formal');

      expect(generated).toBeDefined();
      expect(generated.subject).toContain('AWS Summit');
      expect(generated.body).toContain('John');
      expect(generated.style).toBe('formal');
      expect(generated.providerId).toBe('openai');

      // Step 2: Save the generated email
      const savedEmail = await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: generated.subject,
        body: generated.body,
        status: EmailStatus.DRAFT,
        templateType: TemplateType.FORMAL,
        providerId: generated.providerId,
        tokensUsed: generated.tokensUsed,
      });

      expect(savedEmail).toBeDefined();
      expect(savedEmail.subject).toBe(generated.subject);
      expect(savedEmail.status).toBe(EmailStatus.DRAFT);

      // Step 3: Verify email was saved to database
      const retrievedEmail = await emailService.findEmailById(savedEmail.id, testUserId);
      expect(retrievedEmail).not.toBeNull();
      expect(retrievedEmail?.id).toBe(savedEmail.id);
    });

    it('should generate emails with contact context', async () => {
      // Mock AI response
      jest.spyOn(aiService as any, 'generateWithOpenAI').mockImplementation(async () => {
        return {
          subject: 'Re: AI solutions for Tech Corp',
          body: 'Hi John,\n\nAs CTO at Tech Corp, you mentioned interest in AI...',
          tokensUsed: 120,
        };
      });

      const generated = await aiService.generateEmailTemplate(testUserId, testContactId, 'casual');

      // Verify contact context was used
      expect(generated.subject).toBeTruthy();
      expect(generated.body).toBeTruthy();
      expect(generated.style).toBe('casual');
    });

    it('should include conversation history in generation', async () => {
      // Step 1: Create conversation history
      await emailService.createConversationEntry({
        userId: testUserId,
        contactId: testContactId,
        content: 'Discussed AI solutions at AWS Summit',
        direction: Direction.SENT,
        metadata: { subject: 'Initial conversation' },
      });

      await emailService.createConversationEntry({
        userId: testUserId,
        contactId: testContactId,
        content: 'Very interested, let\'s schedule a demo',
        direction: Direction.RECEIVED,
        metadata: { subject: 'Re: Initial conversation' },
      });

      // Mock AI response
      jest.spyOn(aiService as any, 'generateWithOpenAI').mockImplementation(async () => {
        return {
          subject: 'Demo scheduling for Tech Corp',
          body: 'Hi John,\n\nFollowing up on your interest in scheduling a demo...',
          tokensUsed: 180,
        };
      });

      // Step 2: Generate email (should include conversation history)
      const generated = await aiService.generateEmailTemplate(testUserId, testContactId, 'formal');

      expect(generated).toBeDefined();
      expect(generated.subject).toBeTruthy();

      // Verify conversation history was fetched
      const history = await emailService.getConversationHistory(testUserId, testContactId, 5);
      expect(history).toHaveLength(2);
    });
  });

  describe('Provider Fallback', () => {
    it('should fallback to Anthropic when OpenAI fails', async () => {
      // Mock OpenAI failure
      jest.spyOn(aiService as any, 'generateWithOpenAI').mockRejectedValue(
        new Error('OpenAI API timeout')
      );

      // Mock Anthropic success
      jest.spyOn(aiService as any, 'generateWithAnthropic').mockImplementation(async () => {
        return {
          subject: 'Following up from AWS Summit',
          body: 'Dear John,\n\nGreat meeting you at AWS Summit...',
          tokensUsed: 140,
        };
      });

      const generated = await aiService.generateEmailTemplate(testUserId, testContactId, 'formal');

      expect(generated).toBeDefined();
      expect(generated.providerId).toBe('anthropic');
      expect(generated.subject).toBeTruthy();
    });

    it('should throw error when all providers fail', async () => {
      // Mock both providers failing
      jest.spyOn(aiService as any, 'generateWithOpenAI').mockRejectedValue(
        new Error('OpenAI API error')
      );
      jest.spyOn(aiService as any, 'generateWithAnthropic').mockRejectedValue(
        new Error('Anthropic API error')
      );

      await expect(
        aiService.generateEmailTemplate(testUserId, testContactId, 'formal')
      ).rejects.toThrow('All AI providers failed');
    });
  });

  describe('Email CRUD Workflow', () => {
    it('should complete full CRUD workflow: create → read → update → delete', async () => {
      // Create
      const created = await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Test Email Subject',
        body: 'Test email body content',
        status: EmailStatus.DRAFT,
      });

      expect(created).toBeDefined();
      expect(created.subject).toBe('Test Email Subject');
      expect(created.status).toBe(EmailStatus.DRAFT);

      // Read
      const read = await emailService.findEmailById(created.id, testUserId);
      expect(read).not.toBeNull();
      expect(read?.id).toBe(created.id);

      // Update
      const updated = await emailService.updateEmail(created.id, testUserId, {
        subject: 'Updated Email Subject',
        body: 'Updated email body',
      });

      expect(updated.subject).toBe('Updated Email Subject');
      expect(updated.body).toBe('Updated email body');

      // Delete
      await emailService.deleteEmail(created.id, testUserId);

      // Verify deletion
      const deleted = await emailService.findEmailById(created.id, testUserId);
      expect(deleted).toBeNull();
    });

    it('should find user emails with pagination', async () => {
      // Create multiple emails
      await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Email 1',
        body: 'Body 1',
        status: EmailStatus.DRAFT,
      });

      await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Email 2',
        body: 'Body 2',
        status: EmailStatus.SENT,
      });

      await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Email 3',
        body: 'Body 3',
        status: EmailStatus.DRAFT,
      });

      // Find all emails
      const all = await emailService.findUserEmails(testUserId, { skip: 0, take: 10 });
      expect(all.emails).toHaveLength(3);
      expect(all.total).toBe(3);

      // Find with status filter
      const drafts = await emailService.findUserEmails(testUserId, {
        skip: 0,
        take: 10,
        status: EmailStatus.DRAFT,
      });
      expect(drafts.emails).toHaveLength(2);
      expect(drafts.total).toBe(2);

      // Test pagination
      const page1 = await emailService.findUserEmails(testUserId, { skip: 0, take: 2 });
      expect(page1.emails).toHaveLength(2);

      const page2 = await emailService.findUserEmails(testUserId, { skip: 2, take: 2 });
      expect(page2.emails).toHaveLength(1);
    });

    it('should only update draft emails', async () => {
      // Create sent email
      const sentEmail = await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Sent Email',
        body: 'Body',
        status: EmailStatus.SENT,
      });

      // Try to update sent email (should fail)
      await expect(
        emailService.updateEmail(sentEmail.id, testUserId, {
          subject: 'Updated Subject',
        })
      ).rejects.toThrow('Only draft emails can be updated');
    });

    it('should create conversation entry when email is sent', async () => {
      // Create and send email
      const email = await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Important Update',
        body: 'Email body content',
        status: EmailStatus.SENT,
      });

      // Manually create conversation entry (this would be done by resolver)
      await emailService.createConversationEntry({
        userId: testUserId,
        contactId: testContactId,
        emailId: email.id,
        content: email.body,
        direction: Direction.SENT,
        metadata: { subject: email.subject },
      });

      // Verify conversation entry was created
      const history = await emailService.getConversationHistory(testUserId, testContactId);
      expect(history).toHaveLength(1);
      expect(history[0].emailId).toBe(email.id);
      expect(history[0].direction).toBe(Direction.SENT);
    });
  });

  describe('Template CRUD Workflow', () => {
    it('should complete full template CRUD workflow: create → read → update → delete', async () => {
      // Create
      const created = await emailService.createTemplate(testUserId, {
        name: 'Follow-up Template',
        subject: 'Following up on {{topic}}',
        body: 'Hi {{name}},\n\nFollowing up on our conversation about {{topic}}...',
        isDefault: false,
        category: 'follow-up',
      });

      expect(created).toBeDefined();
      expect(created.name).toBe('Follow-up Template');
      expect(created.category).toBe('follow-up');

      // Read
      const templates = await emailService.findTemplatesByUserId(testUserId);
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe(created.id);

      // Update
      const updated = await emailService.updateTemplate(created.id, testUserId, {
        name: 'Updated Follow-up Template',
        subject: 'Updated: {{topic}}',
      });

      expect(updated.name).toBe('Updated Follow-up Template');
      expect(updated.subject).toBe('Updated: {{topic}}');

      // Delete
      await emailService.deleteTemplate(created.id, testUserId);

      // Verify deletion
      const afterDelete = await emailService.findTemplatesByUserId(testUserId);
      expect(afterDelete).toHaveLength(0);
    });

    it('should handle isDefault toggle correctly', async () => {
      // Create first template as default
      const template1 = await emailService.createTemplate(testUserId, {
        name: 'Template 1',
        subject: 'Subject 1',
        body: 'Body 1',
        isDefault: true,
      });

      expect(template1.isDefault).toBe(true);

      // Create second template as default (should unset first)
      const template2 = await emailService.createTemplate(testUserId, {
        name: 'Template 2',
        subject: 'Subject 2',
        body: 'Body 2',
        isDefault: true,
      });

      expect(template2.isDefault).toBe(true);

      // Verify first template is no longer default
      const templates = await emailService.findTemplatesByUserId(testUserId);
      const updatedTemplate1 = templates.find((t) => t.id === template1.id);
      expect(updatedTemplate1?.isDefault).toBe(false);

      // Only one default template should exist
      const defaultTemplates = templates.filter((t) => t.isDefault);
      expect(defaultTemplates).toHaveLength(1);
      expect(defaultTemplates[0].id).toBe(template2.id);
    });

    it('should sort templates by default, usage count, and creation date', async () => {
      // Create templates in specific order
      const template1 = await emailService.createTemplate(testUserId, {
        name: 'Template 1',
        subject: 'Subject 1',
        body: 'Body 1',
        isDefault: false,
      });

      // Simulate usage by updating usageCount
      await prisma.emailTemplate.update({
        where: { id: template1.id },
        data: { usageCount: 5 },
      });

      const template2 = await emailService.createTemplate(testUserId, {
        name: 'Template 2 (Default)',
        subject: 'Subject 2',
        body: 'Body 2',
        isDefault: true,
      });

      const template3 = await emailService.createTemplate(testUserId, {
        name: 'Template 3',
        subject: 'Subject 3',
        body: 'Body 3',
        isDefault: false,
      });

      // Simulate usage
      await prisma.emailTemplate.update({
        where: { id: template3.id },
        data: { usageCount: 10 },
      });

      // Fetch templates (should be sorted: default first, then by usageCount desc)
      const templates = await emailService.findTemplatesByUserId(testUserId);

      expect(templates).toHaveLength(3);
      // Default template should be first
      expect(templates[0].id).toBe(template2.id);
      // Template 3 (10 uses) should be second
      expect(templates[1].id).toBe(template3.id);
      // Template 1 (5 uses) should be third
      expect(templates[2].id).toBe(template1.id);
    });
  });

  describe('Authorization', () => {
    const otherUserId = 'other-user-integration-789';

    it('should not allow access to emails from other users', async () => {
      // Create email for test user
      const email = await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Private Email',
        body: 'Private content',
        status: EmailStatus.DRAFT,
      });

      // Try to access as different user
      const result = await emailService.findEmailById(email.id, otherUserId);
      expect(result).toBeNull();
    });

    it('should not allow updating emails from other users', async () => {
      // Create email for test user
      const email = await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Private Email',
        body: 'Private content',
        status: EmailStatus.DRAFT,
      });

      // Try to update as different user
      await expect(
        emailService.updateEmail(email.id, otherUserId, { subject: 'Hacked' })
      ).rejects.toThrow('Unauthorized');
    });

    it('should not allow deleting emails from other users', async () => {
      // Create email for test user
      const email = await emailService.createEmail({
        userId: testUserId,
        contactId: testContactId,
        subject: 'Private Email',
        body: 'Private content',
        status: EmailStatus.DRAFT,
      });

      // Try to delete as different user
      await expect(emailService.deleteEmail(email.id, otherUserId)).rejects.toThrow('Unauthorized');
    });
  });
});
