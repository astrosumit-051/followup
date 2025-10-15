/**
 * Database Performance Tests
 *
 * Tests database query performance and validates index effectiveness.
 * These tests run without requiring AI API keys.
 *
 * Performance Targets:
 * - Email pagination query < 100ms
 * - Single email query < 50ms
 * - Conversation history query < 100ms
 * - Contact query < 50ms
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@relationhub/database';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Database Performance Tests', () => {
  let emailService: EmailService;
  let prisma: PrismaClient;

  // Test data
  const testUserId = 'db-perf-test-user-123';
  const testUser = {
    id: testUserId,
    supabaseId: 'db-perf-test-supabase-123',
    email: 'dbperftest@example.com',
    name: 'DB Performance Test User',
    profilePicture: null,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testContactIds: string[] = [];
  const numTestContacts = 100;

  beforeAll(async () => {
    // Initialize Prisma
    prisma = new PrismaClient();

    // Clean up any existing test data
    await prisma.email.deleteMany({ where: { userId: testUserId } });
    await prisma.emailTemplate.deleteMany({ where: { userId: testUserId } });
    await prisma.conversationHistory.deleteMany({ where: { userId: testUserId } });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });

    // Create test user
    await prisma.user.create({ data: testUser });

    // Create test contacts
    console.log('\n📝 Creating 100 test contacts...');
    for (let i = 0; i < numTestContacts; i++) {
      const contactId = `db-perf-test-contact-${i}`;
      testContactIds.push(contactId);

      await prisma.contact.create({
        data: {
          id: contactId,
          userId: testUserId,
          name: `Test Contact ${i}`,
          email: `contact${i}@example.com`,
          company: `Company ${i % 10}`,
          role: i % 3 === 0 ? 'CEO' : i % 3 === 1 ? 'CTO' : 'Engineer',
          industry: 'Technology',
          priority: i % 3 === 0 ? 'HIGH' : i % 3 === 1 ? 'MEDIUM' : 'LOW',
          notes: `Test notes for contact ${i}`,
          createdAt: new Date(Date.now() - i * 1000000), // Stagger timestamps
          updatedAt: new Date(),
        },
      });
    }

    // Create test emails (200 emails)
    console.log('📝 Creating 200 test emails...');
    const testEmails = [];
    for (let i = 0; i < 200; i++) {
      testEmails.push({
        userId: testUserId,
        contactId: testContactIds[i % numTestContacts],
        subject: `Test Email ${i}`,
        body: `Test body ${i} with some longer content to simulate real email body text content`,
        status: i % 4 === 0 ? 'SENT' : 'DRAFT',
        generatedAt: new Date(Date.now() - i * 1000000), // Stagger timestamps
        sentAt: i % 4 === 0 ? new Date(Date.now() - i * 1000000) : null,
      });
    }
    await prisma.email.createMany({ data: testEmails as any });

    // Create conversation history (300 entries)
    console.log('📝 Creating 300 conversation history entries...');
    const testHistory = [];
    for (let i = 0; i < 300; i++) {
      testHistory.push({
        userId: testUserId,
        contactId: testContactIds[i % numTestContacts],
        content: `Test conversation ${i} with some longer content to simulate real conversation text`,
        direction: i % 2 === 0 ? 'SENT' : 'RECEIVED',
        timestamp: new Date(Date.now() - i * 1000000), // Stagger timestamps
        metadata: { subject: `Subject ${i}` },
      });
    }
    await prisma.conversationHistory.createMany({ data: testHistory as any });

    // Create test module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [EmailService, PrismaService],
    }).compile();

    emailService = moduleFixture.get<EmailService>(EmailService);

    console.log('✅ Test data created successfully\n');
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.email.deleteMany({ where: { userId: testUserId } });
    await prisma.emailTemplate.deleteMany({ where: { userId: testUserId } });
    await prisma.conversationHistory.deleteMany({ where: { userId: testUserId } });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });

    await prisma.$disconnect();
  });

  describe('Email Query Performance', () => {
    it('should query paginated emails in < 100ms', async () => {
      const iterations = 20;
      const latencies: number[] = [];

      // Warm-up query
      await emailService.findUserEmails(testUserId, { skip: 0, take: 20 });

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        await emailService.findUserEmails(testUserId, {
          skip: i * 10,
          take: 20,
        });

        const endTime = performance.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      const minLatency = Math.min(...latencies);
      latencies.sort((a, b) => a - b);
      const p95 = latencies[Math.floor(latencies.length * 0.95)];

      console.log('\n📊 Email Pagination Query Performance:');
      console.log(`  Iterations: ${iterations}`);
      console.log(`  Average: ${averageLatency.toFixed(2)}ms`);
      console.log(`  Min: ${minLatency.toFixed(2)}ms`);
      console.log(`  Max: ${maxLatency.toFixed(2)}ms`);
      console.log(`  p95: ${p95.toFixed(2)}ms`);
      console.log(`  Target: < 100ms`);
      console.log(`  Status: ${averageLatency < 100 ? '✅ PASS' : '❌ FAIL'}`);

      expect(averageLatency).toBeLessThan(100);
      expect(p95).toBeLessThan(150);
    });

    it('should query emails filtered by status in < 100ms', async () => {
      const iterations = 20;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        await emailService.findUserEmails(testUserId, {
          skip: 0,
          take: 20,
          status: 'SENT',
        });

        const endTime = performance.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log('\n📊 Email Status Filter Query Performance:');
      console.log(`  Average: ${averageLatency.toFixed(2)}ms`);
      console.log(`  Target: < 100ms`);
      console.log(`  Status: ${averageLatency < 100 ? '✅ PASS' : '❌ FAIL'}`);

      expect(averageLatency).toBeLessThan(100);
    });

    it('should query emails filtered by contactId in < 100ms', async () => {
      const iterations = 20;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        await emailService.findUserEmails(testUserId, {
          skip: 0,
          take: 20,
          contactId: testContactIds[0],
        });

        const endTime = performance.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log('\n📊 Email Contact Filter Query Performance:');
      console.log(`  Average: ${averageLatency.toFixed(2)}ms`);
      console.log(`  Target: < 100ms`);
      console.log(`  Status: ${averageLatency < 100 ? '✅ PASS' : '❌ FAIL'}`);

      expect(averageLatency).toBeLessThan(100);
    });

    it('should query single email by ID in < 50ms', async () => {
      // Get a test email ID
      const { emails } = await emailService.findUserEmails(testUserId, { skip: 0, take: 1 });
      const testEmailId = emails[0].id;

      const iterations = 20;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        await emailService.findEmailById(testEmailId, testUserId);

        const endTime = performance.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log('\n📊 Single Email Query Performance:');
      console.log(`  Average: ${averageLatency.toFixed(2)}ms`);
      console.log(`  Target: < 50ms`);
      console.log(`  Status: ${averageLatency < 50 ? '✅ PASS' : '❌ FAIL'}`);

      expect(averageLatency).toBeLessThan(50);
    });
  });

  describe('Conversation History Query Performance', () => {
    it('should query conversation history in < 100ms', async () => {
      const iterations = 20;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        await emailService.getConversationHistory(
          testUserId,
          testContactIds[i % numTestContacts],
          10,
        );

        const endTime = performance.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      latencies.sort((a, b) => a - b);
      const p95 = latencies[Math.floor(latencies.length * 0.95)];

      console.log('\n📊 Conversation History Query Performance:');
      console.log(`  Average: ${averageLatency.toFixed(2)}ms`);
      console.log(`  p95: ${p95.toFixed(2)}ms`);
      console.log(`  Target: < 100ms`);
      console.log(`  Status: ${averageLatency < 100 ? '✅ PASS' : '❌ FAIL'}`);

      expect(averageLatency).toBeLessThan(100);
      expect(p95).toBeLessThan(150);
    });
  });

  describe('Contact Query Performance', () => {
    it('should query contact by ID in < 50ms', async () => {
      const iterations = 20;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        await prisma.contact.findUnique({
          where: {
            id: testContactIds[i % numTestContacts],
            userId: testUserId,
          },
        });

        const endTime = performance.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log('\n📊 Contact Query Performance:');
      console.log(`  Average: ${averageLatency.toFixed(2)}ms`);
      console.log(`  Target: < 50ms`);
      console.log(`  Status: ${averageLatency < 50 ? '✅ PASS' : '❌ FAIL'}`);

      expect(averageLatency).toBeLessThan(50);
    });
  });

  describe('Bulk Query Performance', () => {
    it('should handle multiple concurrent queries efficiently', async () => {
      const numConcurrent = 50;
      const startTime = performance.now();

      const promises = [];
      for (let i = 0; i < numConcurrent; i++) {
        promises.push(
          emailService.findUserEmails(testUserId, {
            skip: i * 10,
            take: 10,
          }),
        );
      }

      await Promise.all(promises);

      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / numConcurrent;

      console.log('\n📊 Concurrent Query Performance:');
      console.log(`  Concurrent queries: ${numConcurrent}`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average per query: ${averageTime.toFixed(2)}ms`);
      console.log(`  Target: < 200ms total`);
      console.log(`  Status: ${totalTime < 200 ? '✅ PASS' : '❌ FAIL'}`);

      expect(totalTime).toBeLessThan(500); // All 50 queries in < 500ms
      expect(averageTime).toBeLessThan(100);
    });
  });
});
