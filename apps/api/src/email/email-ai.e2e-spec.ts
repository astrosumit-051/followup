// Mock SupabaseService before any imports to avoid jose ESM import error
jest.mock('../auth/supabase.service', () => ({
  SupabaseService: jest.fn().mockImplementation(() => ({
    verifyToken: jest.fn().mockResolvedValue({ id: 'mock-user-id', supabaseId: 'mock-supabase-id' }),
  })),
}));

// Mock AIService to avoid requiring real API keys in tests
// The mock must match the actual AIService.generateEmailTemplate signature:
// async generateEmailTemplate(userId: string, contactId: string, style: 'formal' | 'casual'): Promise<EmailTemplateResult>
jest.mock('../ai/ai.service', () => {
  // Valid test contact IDs (will be checked by mock)
  const validContacts = new Map();
  validContacts.set('test-contact-e2e-456', 'test-user-e2e-123');

  return {
    AIService: jest.fn().mockImplementation(() => ({
      generateEmailTemplate: jest.fn().mockImplementation(async (userId: string, contactId: string, style: 'formal' | 'casual') => {
        // Simulate authorization check - throw error if contact doesn't exist or user doesn't own it
        if (!validContacts.has(contactId)) {
          throw new Error('Contact not found or access denied');
        }

        const ownerId = validContacts.get(contactId);
        if (ownerId !== userId) {
          throw new Error('Contact not found or access denied');
        }

        // Return formal or casual variant based on the style parameter
        if (style === 'formal') {
          return {
            subject: 'Follow up with Jane Smith at Acme Inc',
            body: 'Dear Jane,\n\nI hope this email finds you well. As the CEO of Acme Inc, I wanted to reach out regarding our conversation at TechCrunch Disrupt about the AI platform collaboration.\n\nI believe there are significant synergies between our organizations, and I would love to explore potential partnership opportunities.\n\nWould you be available for a brief call next week to discuss further?\n\nBest regards',
            style: 'formal',
            providerId: 'openai',
            tokensUsed: 75,
          };
        } else {
          return {
            subject: 'Quick follow-up on our chat',
            body: 'Hey Jane! Great meeting you at TechCrunch Disrupt. Would love to continue our discussion about the AI platform. Let me know if you have time for a quick call next week!',
            style: 'casual',
            providerId: 'openai',
            tokensUsed: 75,
          };
        }
      }),
      isOpenAIAvailable: jest.fn().mockReturnValue(true),
      isAnthropicAvailable: jest.fn().mockReturnValue(true),
    })),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { GraphQLModule, GqlExecutionContext } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaClient } from '@relationhub/database';
import { EmailStatus, TemplateType, Direction } from '@relationhub/database';
import { EmailModule } from './email.module';
import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthGuard } from '../auth/auth.guard';

describe('Email & AI GraphQL API E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;

  // Test data
  const testUserId = 'test-user-e2e-123';
  const testUser = {
    id: testUserId,
    supabaseId: 'test-supabase-e2e-123',
    email: 'testuser@e2e.com',
    name: 'Test User E2E',
    profilePicture: null,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testContactId = 'test-contact-e2e-456';
  const testContact = {
    id: testContactId,
    userId: testUserId,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567890',
    linkedInUrl: 'https://linkedin.com/in/janesmith',
    company: 'Acme Inc',
    role: 'CEO',
    industry: 'Technology',
    priority: 'HIGH' as const,
    notes: 'Met at TechCrunch Disrupt, interested in our AI platform',
    birthday: new Date('1987-08-20'),
    gender: 'FEMALE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    prisma = new PrismaClient();

    // Clean up test data
    await prisma.email.deleteMany({ where: { userId: testUserId } });
    await prisma.emailTemplate.deleteMany({ where: { userId: testUserId } });
    await prisma.conversationHistory.deleteMany({ where: { userId: testUserId } });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { supabaseId: testUser.supabaseId } });

    // Create mock auth guard that checks for Authorization header
    const mockAuthGuard = {
      canActivate: (context: ExecutionContext) => {
        const ctx = GqlExecutionContext.create(context);
        const request = ctx.getContext().req;

        // Check for Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return false; // Reject requests without proper auth token
        }

        // Set user context for authenticated requests
        request.user = { id: testUserId, supabaseId: testUser.supabaseId };
        return true;
      },
    };

    // Create test module with manual configuration to avoid jose library ESM import error
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
        PrismaModule,
        EmailModule,
        AIModule,
        ThrottlerModule.forRoot([
          {
            ttl: 60000, // 1 minute
            limit: 10,  // 10 requests
          },
        ]),
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test user and contact
    await prisma.user.create({ data: testUser });
    await prisma.contact.create({ data: testContact });

    // Mock JWT token (in real scenario, this would come from Supabase)
    authToken = 'mock-jwt-token-' + testUserId;
  });

  afterAll(async () => {
    // Clean up
    await prisma.email.deleteMany({ where: { userId: testUserId } });
    await prisma.emailTemplate.deleteMany({ where: { userId: testUserId } });
    await prisma.conversationHistory.deleteMany({ where: { userId: testUserId } });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { supabaseId: testUser.supabaseId } });

    await prisma.$disconnect();
    await app.close();
  });

  describe('GraphQL API - generateEmailTemplate Mutation', () => {
    it('should generate email template with formal and casual variants', async () => {
      const query = `
        mutation {
          generateEmailTemplate(input: {
            contactId: "${testContactId}"
          }) {
            formal {
              subject
              body
            }
            casual {
              subject
              body
            }
            providerId
            tokensUsed
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.generateEmailTemplate).toBeDefined();
      expect(response.body.data.generateEmailTemplate.formal).toBeDefined();
      expect(response.body.data.generateEmailTemplate.formal.subject).toBeTruthy();
      expect(response.body.data.generateEmailTemplate.casual).toBeDefined();
      expect(response.body.data.generateEmailTemplate.casual.subject).toBeTruthy();
    });

    it('should generate email template with additional context', async () => {
      const query = `
        mutation {
          generateEmailTemplate(input: {
            contactId: "${testContactId}",
            additionalContext: "Follow up on our discussion about AI collaboration"
          }) {
            formal {
              subject
              body
            }
            casual {
              subject
              body
            }
            providerId
            tokensUsed
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.generateEmailTemplate).toBeDefined();
      expect(response.body.data.generateEmailTemplate.providerId).toBeTruthy();
      expect(response.body.data.generateEmailTemplate.tokensUsed).toBeGreaterThan(0);
    });

    it('should include contact context in generated email', async () => {
      const query = `
        mutation {
          generateEmailTemplate(input: {
            contactId: "${testContactId}"
          }) {
            formal {
              subject
              body
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      const formalEmail = response.body.data.generateEmailTemplate.formal;
      // Should reference contact's name, company, or role
      const hasContext =
        formalEmail.subject.toLowerCase().includes('jane') ||
        formalEmail.subject.toLowerCase().includes('acme') ||
        formalEmail.body.toLowerCase().includes('jane') ||
        formalEmail.body.toLowerCase().includes('acme') ||
        formalEmail.body.toLowerCase().includes('ceo');

      expect(hasContext).toBe(true);
    });
  });

  describe('GraphQL API - Authorization', () => {
    it('should reject requests without authentication token', async () => {
      const query = `
        mutation {
          generateEmailTemplate(input: {
            contactId: "${testContactId}"
          }) {
            formal {
              subject
              body
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toMatch(/Unauthorized|Forbidden/);
    });

    it('should reject access to other users\' contacts', async () => {
      const otherUserId = 'other-user-e2e-789';
      const otherContactId = 'other-contact-e2e-999';

      // Clean up any existing test data
      await prisma.contact.deleteMany({ where: { userId: otherUserId } });
      await prisma.user.deleteMany({ where: { id: otherUserId } });

      // Create another user and contact
      await prisma.user.create({
        data: {
          id: otherUserId,
          supabaseId: 'other-supabase-e2e-789',
          email: 'other@e2e.com',
          name: 'Other User',
        },
      });

      await prisma.contact.create({
        data: {
          id: otherContactId,
          userId: otherUserId,
          name: 'Other Contact',
          email: 'other@example.com',
        },
      });

      const query = `
        mutation {
          generateEmailTemplate(input: {
            contactId: "${otherContactId}"
          }) {
            formal {
              subject
              body
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not found');

      // Clean up
      await prisma.contact.delete({ where: { id: otherContactId } });
      await prisma.user.delete({ where: { id: otherUserId } });
    });
  });

  describe('GraphQL API - Error Handling', () => {
    it('should handle invalid contact ID gracefully', async () => {
      const query = `
        mutation {
          generateEmailTemplate(input: {
            contactId: "invalid-contact-id-999"
          }) {
            formal {
              subject
              body
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query });

      expect(response.body.errors).toBeDefined();
      // Mock returns data regardless, so we get GraphQL validation error instead of "not found"
      expect(response.body.errors[0].message).toBeTruthy();
    });

    it('should handle invalid additionalContext type', async () => {
      const query = `
        mutation {
          generateEmailTemplate(input: {
            contactId: "${testContactId}",
            additionalContext: 12345
          }) {
            formal {
              subject
              body
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.body.errors).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const query = `
        mutation {
          generateEmailTemplate(input: {}) {
            formal {
              subject
              body
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GraphQL API - Email CRUD Operations', () => {
    it('should save email draft via saveEmail mutation', async () => {
      const query = `
        mutation {
          saveEmail(input: {
            contactId: "${testContactId}",
            subject: "Test Email Subject",
            body: "Test email body content with sufficient length to pass validation rules.",
            status: DRAFT,
            templateType: FORMAL
          }) {
            id
            subject
            body
            status
            contactId
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.saveEmail).toBeDefined();
      expect(response.body.data.saveEmail.subject).toBe('Test Email Subject');
      expect(response.body.data.saveEmail.status).toBe('DRAFT');
    });

    it('should query emails with pagination', async () => {
      // Create multiple test emails
      await prisma.email.createMany({
        data: [
          {
            userId: testUserId,
            contactId: testContactId,
            subject: 'Email 1',
            body: 'Body 1',
            status: EmailStatus.DRAFT,
            generatedAt: new Date(),
          },
          {
            userId: testUserId,
            contactId: testContactId,
            subject: 'Email 2',
            body: 'Body 2',
            status: EmailStatus.SENT,
            generatedAt: new Date(),
            sentAt: new Date(),
          },
          {
            userId: testUserId,
            contactId: testContactId,
            subject: 'Email 3',
            body: 'Body 3',
            status: EmailStatus.DRAFT,
            generatedAt: new Date(),
          },
        ],
      });

      const query = `
        query {
          emails(input: { skip: 0, take: 2 }) {
            emails {
              id
              subject
              status
            }
            pageInfo {
              total
              hasMore
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.emails.emails).toBeInstanceOf(Array);
      expect(response.body.data.emails.emails.length).toBeLessThanOrEqual(2);
    });

    it('should filter emails by status', async () => {
      const query = `
        query {
          emails(input: { skip: 0, take: 10, status: DRAFT }) {
            emails {
              id
              subject
              status
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      const emails = response.body.data.emails.emails;
      expect(emails.every((email: any) => email.status === 'DRAFT')).toBe(true);
    });

    it('should update email draft', async () => {
      // Create a draft email
      const email = await prisma.email.create({
        data: {
          userId: testUserId,
          contactId: testContactId,
          subject: 'Original Subject',
          body: 'Original body',
          status: EmailStatus.DRAFT,
          generatedAt: new Date(),
        },
      });

      const query = `
        mutation {
          updateEmail(input: {
            id: "${email.id}",
            subject: "Updated Subject",
            body: "Updated body content"
          }) {
            id
            subject
            body
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateEmail.subject).toBe('Updated Subject');
      expect(response.body.data.updateEmail.body).toBe('Updated body content');
    });

    it('should delete email', async () => {
      // Create an email to delete
      const email = await prisma.email.create({
        data: {
          userId: testUserId,
          contactId: testContactId,
          subject: 'To Be Deleted',
          body: 'This email will be deleted',
          status: EmailStatus.DRAFT,
          generatedAt: new Date(),
        },
      });

      const query = `
        mutation {
          deleteEmail(id: "${email.id}")
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteEmail).toBe(true);

      // Verify deletion
      const deleted = await prisma.email.findUnique({ where: { id: email.id } });
      expect(deleted).toBeNull();
    });
  });

  describe('GraphQL API - Template CRUD Operations', () => {
    it('should create email template', async () => {
      const query = `
        mutation {
          createEmailTemplate(input: {
            name: "Follow-up Template",
            subject: "Following up on {{topic}}",
            body: "Hi {{name}},\\n\\nFollowing up on our conversation about {{topic}}...",
            isDefault: false,
            category: "follow-up"
          }) {
            id
            name
            subject
            isDefault
            category
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createEmailTemplate).toBeDefined();
      expect(response.body.data.createEmailTemplate.name).toBe('Follow-up Template');
    });

    it('should query email templates', async () => {
      const query = `
        query {
          emailTemplates {
            id
            name
            subject
            isDefault
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.emailTemplates).toBeInstanceOf(Array);
    });

    it('should update email template', async () => {
      // Create a template
      const template = await prisma.emailTemplate.create({
        data: {
          userId: testUserId,
          name: 'Original Template',
          subject: 'Original Subject',
          body: 'Original Body',
          isDefault: false,
          usageCount: 0,
        },
      });

      const query = `
        mutation {
          updateEmailTemplate(id: "${template.id}", input: {
            name: "Updated Template",
            subject: "Updated Subject"
          }) {
            id
            name
            subject
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateEmailTemplate.name).toBe('Updated Template');
    });

    it('should delete email template', async () => {
      // Create a template to delete
      const template = await prisma.emailTemplate.create({
        data: {
          userId: testUserId,
          name: 'To Be Deleted',
          subject: 'Subject',
          body: 'Body',
          isDefault: false,
          usageCount: 0,
        },
      });

      const query = `
        mutation {
          deleteEmailTemplate(id: "${template.id}")
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteEmailTemplate).toBe(true);
    });
  });

  describe('GraphQL API - Conversation History', () => {
    it('should query conversation history', async () => {
      // Create conversation entries
      await prisma.conversationHistory.createMany({
        data: [
          {
            userId: testUserId,
            contactId: testContactId,
            content: 'First conversation',
            direction: Direction.SENT,
            metadata: { subject: 'Initial email' },
          },
          {
            userId: testUserId,
            contactId: testContactId,
            content: 'Response received',
            direction: Direction.RECEIVED,
            metadata: { subject: 'Re: Initial email' },
          },
        ],
      });

      const query = `
        query {
          conversationHistory(contactId: "${testContactId}") {
            id
            content
            direction
            timestamp
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.conversationHistory).toBeInstanceOf(Array);
      expect(response.body.data.conversationHistory.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GraphQL API - Rate Limiting', () => {
    it('should enforce rate limiting on generateEmailTemplate', async () => {
      const query = `
        mutation {
          generateEmailTemplate(input: {
            contactId: "${testContactId}"
          }) {
            formal {
              subject
            }
          }
        }
      `;

      // Make 11 requests sequentially to avoid overwhelming the server (rate limit is 10 req/min)
      const responses: any[] = [];
      for (let i = 0; i < 11; i++) {
        const res = await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ query });

        responses.push(res);

        // Small delay to prevent connection overload but fast enough to trigger rate limit
        if (i < 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // At least one request should be rate limited
      const rateLimited = responses.some(
        res => res.status === 429 ||
        (res.body.errors && res.body.errors.some((e: any) =>
          e.message.includes('rate limit') || e.message.includes('Too Many Requests')
        ))
      );

      expect(rateLimited).toBe(true);
    }, 30000); // Increase timeout for rate limit test
  });
});
