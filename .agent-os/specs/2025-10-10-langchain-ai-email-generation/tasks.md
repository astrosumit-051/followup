# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-10-10-langchain-ai-email-generation/spec.md

> Created: 2025-10-10
> Status: Ready for Implementation

## Tasks

- [ ] 1. Database Schema & Migrations
  - [ ] 1.1 Write tests for Email model validation
  - [ ] 1.2 Create Prisma schema for `emails`, `email_templates`, and `conversation_history` tables
  - [ ] 1.3 Add enums: `EmailStatus`, `TemplateType`, `Direction`
  - [ ] 1.4 Add relations to `User` and `Contact` models
  - [ ] 1.5 Generate and run Prisma migration
  - [ ] 1.6 Create seed data for development/testing
  - [ ] 1.7 Verify all tests pass

- [ ] 2. LangChain Integration Module
  - [ ] 2.1 Write tests for AIService with mocked LLM responses
  - [ ] 2.2 Install dependencies: `langchain`, `@langchain/openai`, `@langchain/anthropic`, `ioredis`
  - [ ] 2.3 Create `apps/api/src/ai/` module with NestJS CLI
  - [ ] 2.4 Implement AIService with LangChain setup (OpenAI + Anthropic providers)
  - [ ] 2.5 Configure environment variables for API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`)
  - [ ] 2.6 Implement provider fallback chain logic
  - [ ] 2.7 Verify all tests pass

- [ ] 3. Prompt Engineering & Template System
  - [ ] 3.1 Write tests for prompt building with various contact contexts
  - [ ] 3.2 Create system prompt defining AI role as networking assistant
  - [ ] 3.3 Build prompt template with variable substitution (name, company, role, notes, priority)
  - [ ] 3.4 Create few-shot examples for high-quality email generation
  - [ ] 3.5 Implement separate prompts for formal vs casual styles
  - [ ] 3.6 Add conversation history injection into prompts
  - [ ] 3.7 Implement input sanitization for prompt injection protection
  - [ ] 3.8 Verify all tests pass

- [ ] 4. Email Generation Service
  - [ ] 4.1 Write tests for email generation with formal/casual variants
  - [ ] 4.2 Implement `generateEmailTemplate()` method in AIService
  - [ ] 4.3 Fetch contact data from database (Prisma)
  - [ ] 4.4 Fetch conversation history (last 5 entries)
  - [ ] 4.5 Build AI prompt with full context
  - [ ] 4.6 Call LangChain with formal style prompt
  - [ ] 4.7 Call LangChain with casual style prompt
  - [ ] 4.8 Parse LLM responses into structured format
  - [ ] 4.9 Track providerId and tokensUsed
  - [ ] 4.10 Verify all tests pass

- [ ] 5. Redis Caching Layer
  - [ ] 5.1 Write tests for cache hit/miss scenarios
  - [ ] 5.2 Configure Redis connection in app.module.ts
  - [ ] 5.3 Implement cache key generation (hash of userId + contactId + context)
  - [ ] 5.4 Implement cache lookup before LLM call
  - [ ] 5.5 Implement cache storage with 1-hour TTL
  - [ ] 5.6 Implement cache invalidation on contact data change
  - [ ] 5.7 Add cache metrics logging (hit/miss rate)
  - [ ] 5.8 Verify all tests pass

- [ ] 6. Email Module & Service
  - [ ] 6.1 Write tests for EmailService CRUD operations
  - [ ] 6.2 Create `apps/api/src/email/` module with NestJS CLI
  - [ ] 6.3 Implement EmailService with Prisma for database operations
  - [ ] 6.4 Implement `createEmail()` method
  - [ ] 6.5 Implement `findUserEmails()` with pagination
  - [ ] 6.6 Implement `updateEmail()` with validation (drafts only)
  - [ ] 6.7 Implement `deleteEmail()` method
  - [ ] 6.8 Implement `getConversationHistory()` method
  - [ ] 6.9 Implement `createConversationEntry()` method
  - [ ] 6.10 Verify all tests pass

- [ ] 7. GraphQL Schema & Types
  - [ ] 7.1 Write tests for GraphQL type definitions
  - [ ] 7.2 Define `Email` type with all fields
  - [ ] 7.3 Define `EmailTemplate` type
  - [ ] 7.4 Define `ConversationHistory` type
  - [ ] 7.5 Define `GeneratedEmailTemplate` type (with formal/casual variants)
  - [ ] 7.6 Define enums: `EmailStatus`, `TemplateType`, `Direction`
  - [ ] 7.7 Define input types: `GenerateEmailInput`, `SaveEmailInput`, etc.
  - [ ] 7.8 Generate GraphQL schema with NestJS code-first approach
  - [ ] 7.9 Verify all tests pass

- [ ] 8. GraphQL Resolvers - Queries
  - [ ] 8.1 Write tests for all query resolvers
  - [ ] 8.2 Implement `email(id: ID!)` query with authorization
  - [ ] 8.3 Implement `emails()` query with pagination and filters
  - [ ] 8.4 Implement `conversationHistory()` query
  - [ ] 8.5 Implement `emailTemplates()` query
  - [ ] 8.6 Add authorization guards (user must own resources)
  - [ ] 8.7 Verify all tests pass

- [ ] 9. GraphQL Resolvers - Mutations (Core Feature)
  - [ ] 9.1 Write tests for generateEmailTemplate mutation
  - [ ] 9.2 Implement `generateEmailTemplate()` mutation
  - [ ] 9.3 Connect to AIService for template generation
  - [ ] 9.4 Store both formal and casual drafts in database
  - [ ] 9.5 Return GeneratedEmailTemplate response
  - [ ] 9.6 Add rate limiting (10 req/min per user)
  - [ ] 9.7 Add error handling for AI service failures
  - [ ] 9.8 Verify all tests pass

- [ ] 10. GraphQL Resolvers - Email CRUD Mutations
  - [ ] 10.1 Write tests for email CRUD mutations
  - [ ] 10.2 Implement `saveEmail()` mutation
  - [ ] 10.3 Create conversation history entry when status=SENT
  - [ ] 10.4 Implement `updateEmail()` mutation with draft-only validation
  - [ ] 10.5 Implement `deleteEmail()` mutation
  - [ ] 10.6 Add input sanitization (prevent XSS)
  - [ ] 10.7 Verify all tests pass

- [ ] 11. GraphQL Resolvers - Template Mutations
  - [ ] 11.1 Write tests for template CRUD mutations
  - [ ] 11.2 Implement `createEmailTemplate()` mutation
  - [ ] 11.3 Handle isDefault toggle (set others to false)
  - [ ] 11.4 Implement `updateEmailTemplate()` mutation
  - [ ] 11.5 Implement `deleteEmailTemplate()` mutation
  - [ ] 11.6 Verify all tests pass

- [ ] 12. Security Implementation
  - [ ] 12.1 Write security tests for prompt injection scenarios
  - [ ] 12.2 Implement input sanitization for all user inputs
  - [ ] 12.3 Add prompt injection detection patterns
  - [ ] 12.4 Implement rate limiting middleware (10 req/min for AI generation)
  - [ ] 12.5 Add request throttling for other mutations (60 req/min)
  - [ ] 12.6 Configure Semgrep rules for AI code scanning
  - [ ] 12.7 Run Semgrep scan and fix any findings
  - [ ] 12.8 Verify all security tests pass

- [ ] 13. Integration Testing
  - [ ] 13.1 Write end-to-end AI generation workflow test
  - [ ] 13.2 Test email generation with contact context
  - [ ] 13.3 Test conversation history inclusion
  - [ ] 13.4 Test provider fallback (OpenAI → Anthropic)
  - [ ] 13.5 Test caching behavior
  - [ ] 13.6 Test email CRUD workflow
  - [ ] 13.7 Test template CRUD workflow
  - [ ] 13.8 Verify all integration tests pass

- [ ] 14. E2E API Testing
  - [ ] 14.1 Write E2E tests for GraphQL API
  - [ ] 14.2 Test generateEmailTemplate mutation end-to-end
  - [ ] 14.3 Test rate limiting enforcement
  - [ ] 14.4 Test authorization (user must own resources)
  - [ ] 14.5 Test error handling scenarios
  - [ ] 14.6 Test pagination and filtering
  - [ ] 14.7 Verify all E2E tests pass

- [ ] 15. Performance Optimization
  - [ ] 15.1 Write performance tests (load testing)
  - [ ] 15.2 Test 100 concurrent generation requests
  - [ ] 15.3 Measure p95 latency (target: <5 seconds)
  - [ ] 15.4 Optimize database queries (add indexes if needed)
  - [ ] 15.5 Optimize cache hit rate (target: 30%+)
  - [ ] 15.6 Add monitoring metrics (Prometheus/Datadog)
  - [ ] 15.7 Verify performance targets met

- [ ] 16. Documentation & Environment Setup
  - [ ] 16.1 Update `.env.example` with new environment variables
  - [ ] 16.2 Update `apps/api/README.md` with AI feature documentation
  - [ ] 16.3 Create API documentation (GraphQL schema comments)
  - [ ] 16.4 Document prompt engineering decisions
  - [ ] 16.5 Create deployment guide for LLM API keys
  - [ ] 16.6 Update Docker Compose with Redis service (if not already present)
  - [ ] 16.7 Create migration guide for database changes

- [ ] 17. Final Verification & QA
  - [ ] 17.1 Run full test suite and verify 80%+ coverage
  - [ ] 17.2 Manually test AI generation via GraphQL playground
  - [ ] 17.3 Test formal vs casual style output quality
  - [ ] 17.4 Verify provider fallback works correctly
  - [ ] 17.5 Test rate limiting manually (11th request fails)
  - [ ] 17.6 Verify conversation history properly tracked
  - [ ] 17.7 Test caching behavior (identical requests cached)
  - [ ] 17.8 Run Semgrep scan final check
  - [ ] 17.9 All tests passing, ready for PR
