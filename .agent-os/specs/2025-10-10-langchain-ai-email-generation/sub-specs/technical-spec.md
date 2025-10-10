# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-10-langchain-ai-email-generation/spec.md

> Created: 2025-10-10
> Version: 1.0.0

## Technical Requirements

### LangChain Integration
- Install LangChain packages: `langchain`, `@langchain/openai`, `@langchain/anthropic`
- Support multiple LLM providers: OpenAI GPT-4 Turbo (primary), Anthropic Claude Sonnet 3.5 (fallback)
- Implement provider chain with automatic fallback on errors/rate limits
- Configure temperature: 0.7 for creativity while maintaining professionalism
- Set max tokens: 500 for email body generation
- Implement streaming responses for better UX (optional for Phase 2)

### Email Generation AI Service
- Analyze contact context: name, email, company, role, industry, notes, priority, birthday, gender
- Generate two style variants: formal (professional, structured) and casual (friendly, conversational)
- Include personalization elements: reference shared interests, previous conversations, company news
- Respect priority level: high-priority contacts get more elaborate emails
- Response time target: <5 seconds for template generation
- Quality metric: 90%+ user acceptance rate (track edit rate)

### Prompt Engineering
- System prompt: Define AI role as professional networking assistant
- Few-shot examples: Provide 3-5 examples of excellent follow-up emails
- Context injection: Insert contact data, conversation history, relationship strength
- Style modifiers: Formal vs casual tone instructions
- Output format: JSON with subject line and body
- Version control: Store prompt templates in database with versioning

### Conversation History
- Store ALL generated emails with metadata (templateType, providerId, tokensUsed)
- Store sent emails when sending feature is implemented
- Include timestamps (createdAt, sentAt, openedAt, repliedAt)
- Link to contact and user
- Support retrieval for AI context (last 5 interactions per contact)
- Implement pagination for history queries

### Caching Strategy
- Cache key: `email:template:${userId}:${contactId}:${style}:${contextHash}`
- TTL: 1 hour (60 minutes)
- Cache hit rate target: 30%+ for repeat requests
- Invalidation: On contact data change or new conversation entry
- Store in Redis with automatic expiration
- Log cache hit/miss metrics for monitoring

### Security Measures
- Input sanitization: Strip HTML tags, validate field lengths
- Prompt injection protection: Detect and block malicious patterns
- Rate limiting: 10 requests/minute per user (configurable)
- API key encryption: Store LLM API keys in AWS Secrets Manager
- OAuth token encryption: AES-256 for stored email account tokens
- Semgrep scan: Run on all AI-related code before commit

### Error Handling
- Provider fallback: OpenAI → Anthropic → Queue for retry
- Timeout handling: 30-second timeout per provider attempt
- User-friendly errors: "AI temporarily unavailable, try again in 1 minute"
- Logging: Structured logs with provider, latency, tokens used
- Monitoring: Alert on error rate >5% or avg latency >10s
- Retry queue: BullMQ job for failed generation requests

## Approach Options

### Option A: Direct LLM API Integration (Selected)

**Description:**
Use LangChain as abstraction layer with direct OpenAI and Anthropic API integration. Provider selection handled by custom chain with fallback logic.

**Pros:**
- Full control over provider selection and fallback
- Lower latency (direct API calls)
- Easier debugging and monitoring
- Transparent costs per provider
- Simple deployment (no additional services)

**Cons:**
- Manual provider management code
- Need to handle rate limits ourselves
- API key rotation requires code deploy

**Rationale:**
For Phase 2 MVP, direct integration provides fastest time-to-market with full transparency. LangChain's unified interface makes future provider additions trivial. Advanced features like LangSmith monitoring can be added in Phase 5 without architectural changes.

### Option B: LangSmith Hub with Managed Prompts (Deferred to Phase 5)

**Description:**
Use LangSmith Hub for centralized prompt management, A/B testing, and monitoring. Prompts stored in cloud, versioned automatically.

**Pros:**
- No-code prompt updates
- Built-in A/B testing
- Advanced analytics dashboard
- Automatic versioning
- Team collaboration features

**Cons:**
- Additional service dependency
- LangSmith Hub monthly costs ($99+)
- Requires internet connectivity for prompt retrieval
- Learning curve for team
- Vendor lock-in to LangChain ecosystem

**Rationale:**
Deferred to Phase 5 when we have established baseline performance metrics and multiple team members iterating on prompts. Current approach allows us to validate email generation quality before investing in managed infrastructure.

## External Dependencies

### Required NPM Packages

- **langchain** (^0.1.0) - Core LangChain framework for LLM orchestration
  - **Justification:** Industry-standard abstraction layer for LLM integration, supports multiple providers with unified interface, extensive documentation and community support

- **@langchain/openai** (^0.0.20) - Official OpenAI integration for LangChain
  - **Justification:** Native TypeScript support, streaming responses, automatic retry logic, maintained by LangChain team

- **@langchain/anthropic** (^0.1.0) - Official Anthropic Claude integration
  - **Justification:** Seamless fallback provider, high-quality output, strong reasoning capabilities for complex email scenarios

- **ioredis** (^5.3.0) - Redis client for caching (already used for sessions)
  - **Justification:** High-performance Redis client with TypeScript support, connection pooling, cluster support for future scaling

### API Keys and Credentials

- **OpenAI API Key** (`OPENAI_API_KEY`)
  - Model: GPT-4 Turbo (gpt-4-turbo-preview)
  - Usage: Primary email generation
  - Cost: ~$0.01 per email (150-200 tokens avg)
  - Rate limit: 10,000 RPM (Tier 3)

- **Anthropic API Key** (`ANTHROPIC_API_KEY`)
  - Model: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
  - Usage: Fallback provider
  - Cost: ~$0.003 per email (similar token count)
  - Rate limit: 50 requests/minute (Tier 2)

- **Redis Connection** (`REDIS_URL`)
  - Already configured in project
  - Used for caching LLM responses

### Version Requirements

- Node.js: >=20.0.0 (already met)
- TypeScript: ^5.3.3 (already met)
- NestJS: ^10.0.0 (already met)

## Performance Targets

- **Email Generation Latency:** <5 seconds (p95)
- **Cache Hit Rate:** 30%+ within 1 week of launch
- **Provider Fallback Time:** <2 seconds to switch providers
- **Token Usage Efficiency:** <300 tokens per email generation
- **Error Rate:** <2% (excluding user-caused errors)
- **API Cost:** <$0.02 per email generated (blended rate)

## Monitoring and Observability

- **Metrics to Track:**
  - Email generation success rate per provider
  - Average latency per provider
  - Cache hit/miss ratio
  - Tokens used per request
  - API costs per user
  - Style selection distribution (formal vs casual)
  - Template edit rate (indicates quality)

- **Alerts:**
  - Error rate >5% for 5 minutes
  - Latency p95 >10 seconds
  - Provider completely unavailable
  - API costs exceed $100/day
  - Rate limit approaching (80% of quota)
