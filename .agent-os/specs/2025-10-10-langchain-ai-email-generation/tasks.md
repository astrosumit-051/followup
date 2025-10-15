# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-10-10-langchain-ai-email-generation/spec.md

> Created: 2025-10-10
> Status: Ready for Implementation

## Tasks

- [x] 1. Database Schema & Migrations ✅ **COMPLETED**
  - [x] 1.1 Write tests for Email model validation
  - [x] 1.2 Create Prisma schema for `emails`, `email_templates`, and `conversation_history` tables
  - [x] 1.3 Add enums: `EmailStatus`, `TemplateType`, `Direction`
  - [x] 1.4 Add relations to `User` and `Contact` models
  - [x] 1.5 Generate and run Prisma migration (used `prisma db push` for development)
  - [x] 1.6 Create seed data for development/testing
  - [x] 1.7 Verify all tests pass (30 tests passing)

- [x] 2. LangChain Integration Module ✅ **COMPLETED**
  - [x] 2.1 Write tests for AIService with mocked LLM responses (7 tests passing)
  - [x] 2.2 Install dependencies: `langchain`, `@langchain/openai`, `@langchain/anthropic`, `ioredis`, `zod`
  - [x] 2.3 Create `apps/api/src/ai/` module with NestJS CLI
  - [x] 2.4 Implement AIService with LangChain setup (OpenAI + Anthropic providers)
  - [x] 2.5 Configure environment variables for API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`)
  - [x] 2.6 Implement provider fallback chain logic
  - [x] 2.7 Verify all tests pass (7/7 tests passing)

- [x] 3. Prompt Engineering & Template System ✅ **COMPLETED**
  - [x] 3.1 Write tests for prompt building with various contact contexts (18 comprehensive tests)
  - [x] 3.2 Create system prompt defining AI role as networking assistant (already implemented, validated with tests)
  - [x] 3.3 Build prompt template with variable substitution (already implemented, validated with tests)
  - [x] 3.4 Create few-shot examples for high-quality email generation (already implemented, validated with tests)
  - [x] 3.5 Implement separate prompts for formal vs casual styles (already implemented, validated with tests)
  - [x] 3.6 Add conversation history injection into prompts (already implemented, validated with tests)
  - [x] 3.7 Implement input sanitization for prompt injection protection (XML-style delimiters + explicit instructions)
  - [x] 3.8 Verify all tests pass (25/25 tests passing)

- [x] 4. Email Generation Service ✅ **COMPLETED**
  - [x] 4.1 Write tests for email generation with formal/casual variants (6 integration tests added)
  - [x] 4.2 Implement `generateEmailTemplate()` method in AIService (already implemented)
  - [x] 4.3 Fetch contact data from database (Prisma) (already implemented)
  - [x] 4.4 Fetch conversation history (last 5 entries) (already implemented)
  - [x] 4.5 Build AI prompt with full context (already implemented with sanitization)
  - [x] 4.6 Call LangChain with formal style prompt (already implemented)
  - [x] 4.7 Call LangChain with casual style prompt (already implemented)
  - [x] 4.8 Parse LLM responses into structured format (already implemented with Zod validation)
  - [x] 4.9 Track providerId and tokensUsed (already implemented)
  - [x] 4.10 Verify all tests pass (31/31 tests passing)

- [x] 5. Redis Caching Layer ✅ **COMPLETED**
  - [x] 5.1 Write tests for cache hit/miss scenarios
  - [x] 5.2 Configure Redis connection in app.module.ts
  - [x] 5.3 Implement cache key generation (hash of userId + contactId + context)
  - [x] 5.4 Implement cache lookup before LLM call
  - [x] 5.5 Implement cache storage with 1-hour TTL
  - [x] 5.6 Implement cache invalidation on contact data change
  - [x] 5.7 Add cache metrics logging (hit/miss rate)
  - [x] 5.8 Verify all tests pass

- [x] 6. Email Module & Service ✅ **COMPLETED**
  - [x] 6.1 Write tests for EmailService CRUD operations
  - [x] 6.2 Create `apps/api/src/email/` module with NestJS CLI
  - [x] 6.3 Implement EmailService with Prisma for database operations
  - [x] 6.4 Implement `createEmail()` method
  - [x] 6.5 Implement `findUserEmails()` with pagination
  - [x] 6.6 Implement `updateEmail()` with validation (drafts only)
  - [x] 6.7 Implement `deleteEmail()` method
  - [x] 6.8 Implement `getConversationHistory()` method
  - [x] 6.9 Implement `createConversationEntry()` method
  - [x] 6.10 Verify all tests pass

- [x] 7. GraphQL Schema & Types ✅ **COMPLETED**
  - [x] 7.1 Write tests for GraphQL type definitions (76 tests passing: 27 entity tests + 49 DTO tests)
  - [x] 7.2 Define `Email` type with all fields
  - [x] 7.3 Define `EmailTemplate` type
  - [x] 7.4 Define `ConversationHistory` type
  - [x] 7.5 Define `GeneratedEmailTemplate` type (with formal/casual variants)
  - [x] 7.6 Define enums: `EmailStatus`, `TemplateType`, `Direction`
  - [x] 7.7 Define input types: `GenerateEmailInput`, `SaveEmailInput`, etc.
  - [x] 7.8 Generate GraphQL schema with NestJS code-first approach (automatically generated)
  - [x] 7.9 Verify all tests pass (all 76 tests passing)

- [x] 8. GraphQL Resolvers - Queries ✅ **COMPLETED**
  - [x] 8.1 Write tests for all query resolvers (39 tests created)
  - [x] 8.2 Implement `email(id: ID!)` query with authorization
  - [x] 8.3 Implement `emails()` query with pagination and filters
  - [x] 8.4 Implement `conversationHistory()` query
  - [x] 8.5 Implement `emailTemplates()` query
  - [x] 8.6 Add authorization guards (user must own resources)
  - [x] 8.7 Verify all tests pass (all 39 tests passing)

- [x] 9. GraphQL Resolvers - Mutations (Core Feature) ✅ **COMPLETED**
  - [x] 9.1 Write tests for generateEmailTemplate mutation (17 comprehensive tests, 55/55 tests passing)
  - [x] 9.2 Implement `generateEmailTemplate()` mutation
  - [x] 9.3 Connect to AIService for template generation
  - [x] 9.4 ~~Store both formal and casual drafts in database~~ (NOT APPLICABLE - per spec, storage is handled by separate `saveEmail` mutation in Task 10)
  - [x] 9.5 Return GeneratedEmailTemplate response
  - [x] 9.6 Add rate limiting (10 req/min per user)
  - [x] 9.7 Add error handling for AI service failures
  - [x] 9.8 Verify all tests pass (55/55 tests passing)

- [x] 10. GraphQL Resolvers - Email CRUD Mutations ✅ **COMPLETED**
  - [x] 10.1 Write tests for email CRUD mutations (28 comprehensive tests written)
  - [x] 10.2 Implement `saveEmail()` mutation (with XSS sanitization)
  - [x] 10.3 Create conversation history entry when status=SENT
  - [x] 10.4 Implement `updateEmail()` mutation with draft-only validation
  - [x] 10.5 Implement `deleteEmail()` mutation
  - [x] 10.6 Add input sanitization (prevent XSS with sanitize-html)
  - [x] 10.7 Verify all tests pass (77/77 tests passing)

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
