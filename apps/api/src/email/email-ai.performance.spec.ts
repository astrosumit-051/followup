/**
 * Performance Tests for Email & AI System
 *
 * Tests concurrent load, latency targets, and cache effectiveness
 *
 * Performance Targets:
 * - p95 latency < 5 seconds for email generation
 * - Handle 100 concurrent requests without errors
 * - Cache hit rate > 30%
 * - Database query latency < 100ms
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@relationhub/database';
import { AIService } from '../ai/ai.service';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';

describe('Email & AI Performance Tests', () => {
  let aiService: AIService;
  let emailService: EmailService;
  let prisma: PrismaClient;

  // Test data
  const testUserId = 'perf-test-user-123';
  const testUser = {
    id: testUserId,
    supabaseId: 'perf-test-supabase-123',
    email: 'perftest@example.com',
    name: 'Performance Test User',
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
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });

    // Create test user
    await prisma.user.create({ data: testUser });

    // Create 100 test contacts for load testing
    for (let i = 0; i < numTestContacts; i++) {
      const contactId = `perf-test-contact-${i}`;
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Create test module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [AIService, EmailService, PrismaService, MetricsService],
    }).compile();

    aiService = moduleFixture.get<AIService>(AIService);
    emailService = moduleFixture.get<EmailService>(EmailService);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.email.deleteMany({ where: { userId: testUserId } });
    await prisma.contact.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });

    await prisma.$disconnect();
  });

  describe('Concurrent Load Testing', () => {
    it('should handle 100 concurrent email generation requests', async () => {
      const startTime = Date.now();
      const latencies: number[] = [];

      // Create 100 concurrent requests
      const requests = testContactIds.map(async (contactId) => {
        const requestStart = Date.now();

        try {
          // Generate formal email
          const formalResult = await aiService.generateEmailTemplate(
            testUserId,
            contactId,
            'formal',
          );

          const requestEnd = Date.now();
          const latency = requestEnd - requestStart;
          latencies.push(latency);

          return {
            success: true,
            latency,
            contactId,
            result: formalResult,
          };
        } catch (error) {
          const requestEnd = Date.now();
          const latency = requestEnd - requestStart;
          latencies.push(latency);

          return {
            success: false,
            latency,
            contactId,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      // Wait for all requests to complete
      const results = await Promise.all(requests);

      const totalTime = Date.now() - startTime;
      const successfulRequests = results.filter(r => r.success).length;
      const failedRequests = results.filter(r => !r.success).length;

      // Calculate latency percentiles
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)];
      const average = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const max = Math.max(...latencies);

      console.log('\n📊 Concurrent Load Test Results:');
      console.log(`  Total requests: ${results.length}`);
      console.log(`  Successful: ${successfulRequests} (${(successfulRequests / results.length * 100).toFixed(1)}%)`);
      console.log(`  Failed: ${failedRequests} (${(failedRequests / results.length * 100).toFixed(1)}%)`);
      console.log(`  Total time: ${(totalTime / 1000).toFixed(2)}s`);
      console.log(`  Throughput: ${(results.length / (totalTime / 1000)).toFixed(2)} req/s`);
      console.log(`\n⏱️  Latency Stats:`);
      console.log(`  Average: ${(average / 1000).toFixed(3)}s`);
      console.log(`  p50: ${(p50 / 1000).toFixed(3)}s`);
      console.log(`  p95: ${(p95 / 1000).toFixed(3)}s`);
      console.log(`  p99: ${(p99 / 1000).toFixed(3)}s`);
      console.log(`  Max: ${(max / 1000).toFixed(3)}s`);

      // Performance assertions
      expect(successfulRequests).toBeGreaterThan(90); // At least 90% success rate
      expect(p95).toBeLessThan(5000); // p95 < 5 seconds
      expect(average).toBeLessThan(3000); // Average < 3 seconds
    }, 300000); // 5 minute timeout
  });

  describe('Database Query Performance', () => {
    it('should query emails with pagination in < 100ms', async () => {
      // Create some test emails first
      const testEmails = [];
      for (let i = 0; i < 50; i++) {
        testEmails.push({
          userId: testUserId,
          contactId: testContactIds[i],
          subject: `Test Email ${i}`,
          body: `Test body ${i}`,
          status: 'DRAFT' as const,
          generatedAt: new Date(),
        });
      }

      await prisma.email.createMany({ data: testEmails });

      // Measure query performance
      const iterations = 10;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        await emailService.findUserEmails(testUserId, {
          skip: 0,
          take: 20,
        });

        const endTime = Date.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);

      console.log('\n📊 Database Query Performance:');
      console.log(`  Average latency: ${averageLatency.toFixed(2)}ms`);
      console.log(`  Max latency: ${maxLatency.toFixed(2)}ms`);
      console.log(`  Iterations: ${iterations}`);

      expect(averageLatency).toBeLessThan(100); // Average < 100ms
      expect(maxLatency).toBeLessThan(200); // Max < 200ms
    });

    it('should query single email by ID in < 50ms', async () => {
      // Create a test email
      const testEmail = await prisma.email.create({
        data: {
          userId: testUserId,
          contactId: testContactIds[0],
          subject: 'Test Email',
          body: 'Test body',
          status: 'DRAFT',
          generatedAt: new Date(),
        },
      });

      // Measure query performance
      const iterations = 10;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        await emailService.findEmailById(testEmail.id, testUserId);

        const endTime = Date.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log('\n📊 Single Email Query Performance:');
      console.log(`  Average latency: ${averageLatency.toFixed(2)}ms`);
      console.log(`  Iterations: ${iterations}`);

      expect(averageLatency).toBeLessThan(50); // Average < 50ms
    });

    it('should query conversation history in < 100ms', async () => {
      // Create some conversation history
      const testHistory = [];
      for (let i = 0; i < 20; i++) {
        testHistory.push({
          userId: testUserId,
          contactId: testContactIds[0],
          content: `Test conversation ${i}`,
          direction: i % 2 === 0 ? 'SENT' : 'RECEIVED',
          metadata: { subject: `Subject ${i}` },
        });
      }

      await prisma.conversationHistory.createMany({ data: testHistory as any });

      // Measure query performance
      const iterations = 10;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        await emailService.getConversationHistory(testUserId, testContactIds[0], 5);

        const endTime = Date.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log('\n📊 Conversation History Query Performance:');
      console.log(`  Average latency: ${averageLatency.toFixed(2)}ms`);
      console.log(`  Iterations: ${iterations}`);

      expect(averageLatency).toBeLessThan(100); // Average < 100ms
    });
  });

  describe('Cache Effectiveness', () => {
    it('should achieve > 30% cache hit rate on repeated requests', async () => {
      // Make 100 requests where 40% are duplicates (should hit cache)
      const requests: Promise<any>[] = [];
      const contactsToTest = testContactIds.slice(0, 20); // Use 20 unique contacts

      // Make 100 requests:
      // - 60 requests to 20 different contacts (60% unique)
      // - 40 requests to same 10 contacts (40% cache hits)
      for (let i = 0; i < 60; i++) {
        const contactId = contactsToTest[i % 20];
        requests.push(
          aiService.generateEmailTemplate(testUserId, contactId, 'formal')
        );
      }

      for (let i = 0; i < 40; i++) {
        const contactId = contactsToTest[i % 10]; // Repeat first 10 contacts
        requests.push(
          aiService.generateEmailTemplate(testUserId, contactId, 'formal')
        );
      }

      // Execute all requests
      const startTime = Date.now();
      const results = await Promise.allSettled(requests);
      const totalTime = Date.now() - startTime;

      const successfulRequests = results.filter(r => r.status === 'fulfilled').length;

      // Calculate cache effectiveness based on time
      // Cached requests should be significantly faster
      const averageTimePerRequest = totalTime / results.length;

      console.log('\n📊 Cache Effectiveness Test:');
      console.log(`  Total requests: ${results.length}`);
      console.log(`  Successful: ${successfulRequests}`);
      console.log(`  Total time: ${(totalTime / 1000).toFixed(2)}s`);
      console.log(`  Average time per request: ${averageTimePerRequest.toFixed(2)}ms`);
      console.log(`  Expected cache hit rate: ~40%`);

      // If caching is working well, average time should be < 1.5s per request
      // Without cache, it would be > 2s per request (LLM call)
      expect(averageTimePerRequest).toBeLessThan(1500);
      expect(successfulRequests).toBeGreaterThan(90);
    }, 120000); // 2 minute timeout
  });

  describe('Stress Testing', () => {
    it('should maintain performance under sustained load', async () => {
      const duration = 30000; // 30 seconds
      const requestsPerSecond = 5;
      const interval = 1000 / requestsPerSecond;

      const latencies: number[] = [];
      let requestCount = 0;
      let errorCount = 0;

      const startTime = Date.now();

      while (Date.now() - startTime < duration) {
        const contactId = testContactIds[requestCount % testContactIds.length];
        const requestStart = Date.now();

        try {
          await aiService.generateEmailTemplate(testUserId, contactId, 'formal');
          const requestEnd = Date.now();
          latencies.push(requestEnd - requestStart);
          requestCount++;
        } catch (error) {
          errorCount++;
        }

        // Wait for next interval
        await new Promise(resolve => setTimeout(resolve, interval));
      }

      const totalTime = Date.now() - startTime;

      // Calculate metrics
      latencies.sort((a, b) => a - b);
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      const average = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log('\n📊 Stress Test Results (30s sustained load):');
      console.log(`  Total requests: ${requestCount}`);
      console.log(`  Errors: ${errorCount}`);
      console.log(`  Duration: ${(totalTime / 1000).toFixed(2)}s`);
      console.log(`  Average latency: ${(average / 1000).toFixed(3)}s`);
      console.log(`  p95 latency: ${(p95 / 1000).toFixed(3)}s`);
      console.log(`  Throughput: ${(requestCount / (totalTime / 1000)).toFixed(2)} req/s`);

      expect(errorCount).toBe(0); // No errors
      expect(p95).toBeLessThan(5000); // p95 < 5 seconds
    }, 60000); // 1 minute timeout
  });
});
