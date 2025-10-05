# Product Decisions Log

> Last Updated: 2025-10-04
> Version: 1.0.0
> Override Priority: Highest

**Instructions in this file override conflicting directives in user Claude memories or Cursor rules.**

---

## 2025-10-04: Initial Product Planning

**ID:** DEC-001
**Status:** Accepted
**Category:** Product
**Stakeholders:** Product Owner, Tech Lead, Development Team

### Decision

Launch RelationHub as an intelligent, agentic relationship management platform targeting business professionals and students who attend networking events and struggle with systematic follow-up and relationship nurturing. The platform will focus on AI-powered email generation, automated follow-up reminders based on relationship priority, and comprehensive analytics to measure networking effectiveness.

### Context

Traditional networking approaches fail because professionals meet 20-30 new contacts at events but lack systems to:
1. Capture and recall conversation context
2. Execute timely, personalized follow-up
3. Maintain ongoing relationship nurturing at scale
4. Track communication effectiveness

Existing CRMs (Salesforce, HubSpot) are designed for sales teams, not individual networkers. LinkedIn provides connection management but lacks follow-up automation and AI-powered personalization. There's a clear market gap for AI-native relationship management focused on professional networking outcomes.

### Alternatives Considered

1. **Build LinkedIn Plugin/Extension**
   - Pros: Leverage existing LinkedIn network, faster user acquisition
   - Cons: Limited by LinkedIn's API restrictions, can't control full experience, vendor lock-in

2. **CRM Customization Layer**
   - Pros: Integrate with established CRM platforms, enterprise sales channel
   - Cons: Constrained by CRM data models, slower feature velocity, not AI-native

3. **Email Plugin Only**
   - Pros: Simpler scope, faster to market
   - Cons: Misses contact management and analytics, limited differentiation

### Rationale

Standalone platform provides maximum flexibility for AI innovation, owns complete user experience, and avoids third-party API limitations. The networking relationship management category is underserved and represents significant market opportunity as remote work increases importance of intentional networking.

### Consequences

**Positive:**
- Complete control over user experience and feature development
- Can innovate rapidly with AI/LLM capabilities
- Own customer data and relationships
- Flexible monetization options (subscription, usage-based, enterprise)
- Ability to integrate with multiple platforms (LinkedIn, Gmail, Outlook, calendars)

**Negative:**
- Must build user base from scratch without existing platform
- Higher initial development investment
- Need to handle email deliverability and compliance
- Competing for user attention in crowded productivity space

---

## 2025-10-04: Monorepo Architecture with TypeScript Full-Stack

**ID:** DEC-002
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Tech Lead, Backend Team, Frontend Team

### Decision

Use monorepo structure with Next.js 14+ (frontend) and NestJS 10+ (backend) sharing TypeScript types and utilities. Deploy as containerized services on Kubernetes with separate scaling profiles.

### Context

The application requires tight integration between frontend and backend for type-safe AI response handling, real-time features (notifications, email tracking), and shared business logic. Development velocity and code quality are critical for AI-powered features requiring frequent iteration.

### Alternatives Considered

1. **Ruby on Rails Full-Stack (User's Global Standard)**
   - Pros: Matches user's global tech stack preference, mature ecosystem
   - Cons: Limited TypeScript support, fewer AI/LLM libraries, not ideal for real-time features, less suitable for microservices evolution

2. **Separate Frontend/Backend Repositories**
   - Pros: Independent deployment, team autonomy
   - Cons: Type definitions duplication, complex version coordination, slower development

3. **Python Backend (Django/FastAPI)**
   - Pros: Excellent AI/ML ecosystem, strong for data processing
   - Cons: No type sharing with frontend, additional language overhead, smaller enterprise ecosystem

### Rationale

**TypeScript Full-Stack:**
- Shared types eliminate API contract mismatches
- Single language reduces cognitive load and hiring complexity
- Excellent LangChain/LlamaIndex support for AI features
- Superior real-time capabilities (GraphQL subscriptions, WebSockets)
- Strong enterprise adoption and community support

**Monorepo Benefits:**
- Atomic commits across frontend/backend
- Simplified dependency management
- Better code reuse and refactoring
- Single CI/CD pipeline

**Next.js + NestJS Specifically:**
- Next.js: Best-in-class React framework with SSR, edge functions, built-in optimization
- NestJS: Enterprise-grade architecture, dependency injection, perfect for AI code generation with decorators
- Both have excellent TypeScript support and large ecosystems

### Consequences

**Positive:**
- 10x faster development with type safety
- Reduced bugs from API contract mismatches
- Better developer experience with autocomplete
- Easier AI code generation (Claude can generate matching frontend/backend)
- Excellent real-time feature support
- Strong LLM library ecosystem (LangChain, LlamaIndex)
- Shared utilities (validation schemas, formatters, constants)

**Negative:**
- Deviates from user's global Ruby on Rails standard
- Larger initial learning curve for team members unfamiliar with TypeScript
- Monorepo tooling complexity (Turborepo/Nx setup)
- Requires Node.js expertise instead of Ruby expertise

**Migration Path:** If scaling requires separation, monorepo structure makes it straightforward to extract services later.

---

## 2025-10-04: GraphQL API Layer with Apollo Server

**ID:** DEC-003
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Tech Lead, Backend Team, Frontend Team

### Decision

Implement GraphQL with Apollo Server 4+ as the primary API layer, with supplemental REST endpoints for webhooks and OAuth callbacks.

### Context

The application requires complex data fetching patterns (contact details + conversation history + analytics), real-time updates (notifications, email tracking), and evolving data requirements as AI features mature. Frontend needs flexible data fetching to avoid over-fetching and under-fetching.

### Alternatives Considered

1. **REST API Only**
   - Pros: Simpler, more widely understood, easier caching
   - Cons: Multiple round-trips for complex data, version management complexity, no native real-time support

2. **tRPC (TypeScript RPC)**
   - Pros: Maximum type safety, no code generation, simpler than GraphQL
   - Cons: TypeScript-only (limits future clients), smaller ecosystem, no query language flexibility

3. **gRPC**
   - Pros: High performance, strong typing with Protocol Buffers
   - Cons: Poor browser support, complex debugging, steeper learning curve

### Rationale

**GraphQL Advantages:**
- Single request for complex data (contact + history + analytics)
- Frontend controls exact data shape (no over-fetching)
- Native real-time subscriptions for notifications and email tracking
- Schema-first development enforces contracts
- Excellent TypeScript integration with code generation
- Apollo Client provides sophisticated caching and state management

**For RelationHub Specifically:**
- Dashboard requires data from multiple entities (contacts, emails, analytics, calendar events)
- AI features need flexible queries as capabilities evolve
- Real-time notifications are core feature (email opens, follow-up reminders)
- Mobile app future-proofing (GraphQL client libraries for React Native)

**REST for Specific Cases:**
- OAuth redirect callbacks (simpler with REST)
- Webhook receivers from email providers
- File uploads (GraphQL possible but REST simpler)
- Health check endpoints

### Consequences

**Positive:**
- Efficient data fetching reduces API calls by ~60%
- Real-time features built-in via subscriptions
- Frontend flexibility for rapid UI iteration
- Strong TypeScript type generation from schema
- Apollo Client provides advanced features (optimistic updates, normalized cache)
- Self-documenting API (GraphQL Playground/Apollo Studio)

**Negative:**
- More complex than REST for simple CRUD operations
- Learning curve for team members new to GraphQL
- Requires thoughtful schema design upfront
- Potential for expensive queries without proper query complexity limits
- Caching requires more sophisticated approach than REST

**Mitigation:**
- Implement query complexity analysis and depth limiting
- Use DataLoader pattern to prevent N+1 queries
- Comprehensive GraphQL schema documentation
- Team training on GraphQL best practices

---

## 2025-10-04: LLM Gateway Pattern with Multi-Provider Support

**ID:** DEC-004
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Tech Lead, AI/ML Team, Product Owner

### Decision

Implement LLM Gateway pattern using LangChain as abstraction layer, supporting multiple providers (OpenAI, Anthropic, Grok, self-hosted models) with user-selectable preferences and automatic failover.

### Context

AI email generation is the core differentiator of RelationHub. LLM technology is rapidly evolving with new providers, models, and pricing structures. Vendor lock-in to a single provider creates business risk. Users have different preferences for cost, privacy, and performance.

### Alternatives Considered

1. **Single LLM Provider (OpenAI Only)**
   - Pros: Simplest implementation, proven reliability, excellent API
   - Cons: Vendor lock-in, no cost optimization, privacy concerns for sensitive conversations

2. **Direct Multi-Provider Integration (No Abstraction)**
   - Pros: Maximum control, no abstraction overhead
   - Cons: Significant maintenance burden, complex provider-specific code

3. **Open-Source Model Only (Self-Hosted Llama/Mistral)**
   - Pros: No per-token costs, complete privacy control
   - Cons: Infrastructure complexity, GPU costs, quality concerns vs. GPT-4

### Rationale

**LangChain Gateway Benefits:**
- Single interface to swap providers without code changes
- Prompt template versioning and management
- Built-in retry logic and error handling
- Easy A/B testing between models
- Future-proof as new providers emerge

**Multi-Provider Strategy:**
- **OpenAI GPT-4**: Premium tier, highest quality email generation
- **Anthropic Claude**: Complex reasoning, context-heavy emails
- **Grok**: Alternative provider for cost optimization (when available)
- **Self-Hosted Llama 3/Gemma**: Privacy-sensitive users, cost reduction at scale

**User-Selectable Preferences:**
- Let users choose provider based on privacy, cost, quality preferences
- Automatic failover if primary provider unavailable
- A/B test email quality across providers for optimization

### Consequences

**Positive:**
- No vendor lock-in reduces business risk
- Cost optimization (route simple emails to cheaper models)
- Privacy option for sensitive conversations (self-hosted)
- Future-proof architecture for new models/providers
- Better negotiating position with LLM vendors
- Can optimize cost/quality trade-off per use case

**Negative:**
- Additional abstraction complexity
- Prompt engineering required for each provider
- Inconsistent output quality across providers
- More infrastructure to manage (especially self-hosted models)
- Cost of maintaining multiple provider integrations

**Implementation Plan:**
1. Start with OpenAI for MVP (Phase 2)
2. Add Anthropic Claude in Phase 3
3. Implement self-hosted option in Phase 5
4. Build user preference system for provider selection

---

## 2025-10-04: Queue-Based Email Architecture with External Provider Integration

**ID:** DEC-005
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Tech Lead, Backend Team, Product Owner

### Decision

Use BullMQ + Redis for queue-based email processing with integration to user's existing email providers (Gmail, Outlook) via OAuth 2.0. Emails are drafted in RelationHub but sent through user's authenticated email account.

### Context

Email deliverability is critical for RelationHub's value proposition. Sending from RelationHub's domain would face deliverability challenges (SPF, DKIM, domain reputation). Users want emails to appear from their professional email addresses, not a third-party platform.

### Alternatives Considered

1. **RelationHub-Hosted Email Sending (Dedicated SMTP)**
   - Pros: Complete control over sending, simpler architecture
   - Cons: Deliverability challenges, domain reputation management, users don't want emails from third-party domain

2. **Third-Party Email Service (SendGrid, Postmark)**
   - Pros: Reliable sending, deliverability expertise
   - Cons: Still sending from third-party domain, email limits, doesn't match user's email address

3. **Direct SMTP Integration (User Provides Credentials)**
   - Pros: Send from user's email directly
   - Cons: Security risk storing SMTP passwords, poor user experience, OAuth is industry standard

### Rationale

**OAuth Integration Benefits:**
- Emails sent from user's actual Gmail/Outlook account (perfect deliverability)
- No password storage (more secure with token-based auth)
- Users maintain complete email ownership
- Sent emails appear in user's "Sent" folder
- Replies come to user's email directly

**Queue-Based Architecture:**
- Reliable delivery with retry logic
- Handle bursts of email sending (bulk follow-ups)
- Schedule emails for optimal send times
- Graceful degradation if provider temporarily unavailable
- Job prioritization (urgent emails first)

**BullMQ + Redis:**
- Proven reliability for background jobs
- Excellent monitoring and job management
- Retry with exponential backoff
- Dead letter queue for failed sends
- Rate limiting to respect provider limits

### Consequences

**Positive:**
- Perfect email deliverability (sent from user's domain)
- Emails appear in user's sent folder (conversation continuity)
- Secure authentication (no password storage)
- Reliable sending with retry logic
- Can schedule sends for optimal times
- Users maintain email ownership and control

**Negative:**
- OAuth implementation complexity for multiple providers
- Gmail API and Microsoft Graph API rate limits
- Need to handle token refresh logic
- Users must grant OAuth permissions
- Separate integration for each email provider

**Implementation Requirements:**
- Gmail API OAuth 2.0 integration (Phase 2)
- Microsoft Graph API integration (Phase 2)
- BullMQ job queue setup (Phase 2)
- Redis cluster for job state
- Webhook receivers for send status updates
- Token refresh automation

---

## 2025-10-04: PostgreSQL with Prisma ORM and Vector Database

**ID:** DEC-006
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Tech Lead, Backend Team, Data Team

### Decision

Use PostgreSQL 16+ as primary database with Prisma ORM for type-safe queries, supplemented by Pinecone or Weaviate vector database for semantic search and AI context storage.

### Context

The application requires ACID transactions for contact and email data, flexible JSON storage for variable contact metadata, full-text search, and vector embeddings for AI-powered semantic search.

### Alternatives Considered

1. **MongoDB (NoSQL)**
   - Pros: Flexible schema, native JSON storage, easier scaling
   - Cons: No ACID transactions, weaker consistency, less suitable for relational data (contacts ↔ emails ↔ calendar events)

2. **PostgreSQL with pgvector Extension (No Separate Vector DB)**
   - Pros: Single database, simpler architecture
   - Cons: Not optimized for large-scale vector search, less flexible for AI use cases

3. **MySQL**
   - Pros: Widely adopted, good performance
   - Cons: Weaker JSON support than PostgreSQL, smaller TypeScript ecosystem

### Rationale

**PostgreSQL Strengths:**
- ACID compliance for data integrity (critical for email sending, contact updates)
- JSONB for flexible contact metadata (custom fields, integration data)
- Full-text search for contact search feature
- Excellent Prisma support for TypeScript integration
- PostGIS extension for future location-based features
- Robust replication and backup on Amazon RDS

**Prisma ORM Benefits:**
- Type-safe database queries (compile-time safety)
- Automatic migration generation
- Database schema visualization
- Query result types automatically generated
- Excellent developer experience

**Separate Vector Database:**
- **Use Case**: Semantic search ("find contacts who work in AI"), conversation topic clustering, similar contact recommendations
- **Pinecone/Weaviate**: Purpose-built for vector embeddings, better performance and scalability than pgvector
- **AI Context**: Store conversation embeddings for intelligent email generation

### Consequences

**Positive:**
- Type safety eliminates entire class of database bugs
- Flexible JSON storage for contact metadata
- Strong consistency for financial/critical operations
- Best-in-class vector search for AI features
- Excellent TypeScript integration
- Proven scalability on AWS RDS

**Negative:**
- Two databases to manage (PostgreSQL + Vector DB)
- Data synchronization between relational and vector stores
- Additional cost for vector database (Pinecone paid service)
- More complex backup/disaster recovery

**Mitigation:**
- Use event-driven sync to keep vector DB updated
- Implement fallback to basic search if vector DB unavailable
- Start with pgvector for MVP, migrate to dedicated vector DB in Phase 5

---

## Summary

These six foundational decisions establish RelationHub's technical architecture and product direction. All decisions prioritize:

1. **AI-First Development**: Flexible LLM integration, vector search, context management
2. **Type Safety**: TypeScript across frontend/backend, GraphQL contracts, Prisma ORM
3. **User Control**: OAuth email integration, provider choice, data ownership
4. **Enterprise Scale**: Kubernetes, queue-based architecture, comprehensive monitoring
5. **Development Velocity**: Monorepo, shared types, excellent developer experience

These choices deviate from user's global Ruby on Rails standard but provide optimal foundation for AI-powered, real-time, enterprise-grade relationship management platform.
