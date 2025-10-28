# Product Roadmap

> Last Updated: 2025-10-15
> Version: 1.2.0
> Status: Phase 1 Complete | Phase 2 In Progress (29%)

## Phase 1: Foundation & Core MVP (8-10 weeks)

**Goal:** Establish foundational infrastructure and deliver core contact management functionality that allows users to add, view, and organize contacts with basic AI-powered features.

**Success Criteria:**
- ✅ Users can register, authenticate, and manage their profile
- ✅ Users can perform CRUD operations on contacts with rich context
- ✅ Basic AI email generation working with at least one LLM provider
- ✅ PostgreSQL database deployed with Prisma ORM
- ✅ Next.js + NestJS monorepo structure established

**Current Progress:** 7/7 Must-Have Features Complete (100%) + 3/3 Should-Have Features Complete (100%)

### Must-Have Features

- [x] User Authentication & Authorization - Implement Supabase with social login (Google, GitHub) and session management `M` ✅ **COMPLETED** (Spec: 2025-10-04-user-authentication)
  - ⚠️ **Pending Items** (deferred to later phase):
    - LinkedIn OAuth provider setup (Task 2.4)
    - E2E test environment setup with Supabase test instance (Tasks 6.8, 7.5, 7.7, 8.7, 9.7)
    - Manual testing of complete registration → login → dashboard → logout flow (Task 12.3)
    - GraphQL API manual testing with JWT tokens in Postman/Insomnia (Task 4.6)
- [x] Contact CRUD Operations - Create, read, update, delete contacts with fields (name, email, phone, LinkedIn, notes, priority, birthday, gender, company, industry, role) `L` ✅ **COMPLETED** (Spec: 2025-10-06-contact-crud-operations)
  - ✅ Backend: DTOs, Service Layer, GraphQL Resolvers, Authorization
  - ✅ Frontend: Components, Forms, Validation, TanStack Query Hooks
  - ✅ Security: Semgrep scan passed, authorization checks, input validation
  - ✅ Testing: 246 backend tests, 220 frontend tests, E2E test suite ready
  - ✅ Documentation: API docs, setup guide, usage documentation
- [x] Database Schema & Migrations - Design PostgreSQL schema with Prisma, implement migrations, seed data for testing `M` ✅ **COMPLETED** (Spec: 2025-10-04-project-setup-database-schema)
- [x] Basic Dashboard - Landing page showing contact count, recent contacts, and quick add button `M` ✅ **COMPLETED** (Implemented as part of contact CRUD)
- [x] Contact List View - Paginated table/grid view of all contacts with basic sorting `S` ✅ **COMPLETED** (Cursor-based pagination, responsive grid)
- [x] Contact Detail View - Individual contact page displaying all stored information `S` ✅ **COMPLETED** (Full detail view with edit/delete actions)
- [x] Priority System - Ability to assign High/Medium/Low priority to contacts `S` ✅ **COMPLETED** (Priority enum with filtering)

### Should-Have Features

- [ ] Profile Picture Upload - Manual profile picture upload for contacts `S` 🎯 **NEXT PRIORITY** (Deferred to Phase 3 - requires S3 integration)
- [x] Responsive Design - Mobile-friendly layouts for all core pages using Tailwind CSS `M` ✅ **COMPLETED** (Mobile-first, WCAG 2.1 AA compliant)
- [x] Basic Search - Simple text search across contact names and emails `S` ✅ **COMPLETED** (Advanced search with debouncing, filters by priority/company/industry)

### Dependencies

- ✅ Supabase account configuration (Google OAuth configured)
- ⏳ LinkedIn OAuth provider setup (deferred)
- ✅ GitHub repository and CI/CD pipeline setup
- ✅ Development environment standardization (Docker Compose)
- ⏳ Supabase test environment for E2E testing (deferred)
- ⏳ AWS account setup for RDS PostgreSQL and S3 (for production deployment)

### Notes

**Authentication Pending Tasks**: While core authentication is functional, the following tasks from the user-authentication spec were deferred and should be completed before production:
- Set up LinkedIn OIDC OAuth provider
- Configure Supabase test environment for automated E2E tests
- Complete manual end-to-end testing flow
- Test GraphQL API with JWT tokens using Postman/Insomnia

These items are tracked in the spec at `.agent-os/specs/2025-10-04-user-authentication/tasks.md`

---

## Phase 2: AI Integration & Email Composition (6-8 weeks)

**Goal:** Integrate LLM capabilities for AI-powered email generation and establish email composition workflow with external provider integration.

**Success Criteria:**
- ✅ AI generates personalized email templates based on contact context
- ⏳ Users can compose emails with AI assistance (A/B templates, polish draft)
- ⏳ Gmail and Outlook OAuth integration working
- ⏳ Emails successfully sent through external providers
- ⏳ Basic email tracking implemented

**Current Progress:** 3/7 Must-Have Features Complete (43%) - Backend Infrastructure Ready

### Must-Have Features

- [x] LangChain Integration - Set up LangChain with OpenRouter/OpenAI/Anthropic/Gemini API support, prompt template management `L` ✅ **COMPLETED** (Spec: 2025-10-10-langchain-ai-email-generation)
  - ✅ OpenRouter (primary), Gemini, OpenAI, Anthropic providers configured
  - ✅ Prompt engineering with XML-style delimiters for security
  - ✅ Redis caching (1-hour TTL) for cost reduction
  - ✅ Prometheus metrics tracking (15+ metrics)
  - ✅ Rate limiting (10 req/min for AI generation)
  - ✅ 300+ unit tests, 15 integration tests, 18/19 E2E tests passing
  - ✅ Comprehensive documentation (README, METRICS, PERFORMANCE guides)
- [x] AI Email Template Generation - Generate formal and casual email templates based on contact notes and relationship context `XL` ✅ **COMPLETED** (Spec: 2025-10-10-langchain-ai-email-generation)
  - ✅ Formal and casual style variants with A/B testing
  - ✅ Contact context injection (notes, relationship data)
  - ✅ Conversation history tracking for context
  - ✅ XSS prevention and prompt injection protection
  - ✅ GraphQL API with full CRUD operations
  - ✅ Token usage tracking and provider fallback
  - ✅ Database schema with Prisma ORM
- [x] Email Composition Backend Infrastructure - GraphQL API, draft management, signatures, S3 attachments `XL` ✅ **COMPLETED** (PR #34: Spec: 2025-10-15-email-composition-gmail-integration)
  - ✅ Email draft auto-save with cursor-based pagination
  - ✅ Email signature CRUD with default handling
  - ✅ AWS S3 attachment service with presigned URLs (15-min expiry)
  - ✅ Gmail OAuth integration and send service
  - ✅ GraphQL API: 4 queries, 5 mutations (+ 3 documented stubs)
  - ✅ Optimistic locking for draft concurrency control
  - ✅ Transaction-based signature operations
  - ✅ Comprehensive error handling and security scans
  - ✅ 91 backend tests passing
  - ✅ Documentation: S3 setup, testing guides, API docs
- [ ] Email Composition Interface - Rich text editor with formatting, attachments, and signature support `L` ⏳ **IN PROGRESS** (Frontend work starting)
- [ ] Gmail OAuth Integration - Authenticate with Gmail API and send emails through user's Gmail account `L`
- [ ] Outlook OAuth Integration - Authenticate with Microsoft Graph API and send emails through Outlook `L`
- [ ] Polish Draft Feature - AI refinement of user-written emails with four style options (Formal, Casual, Elaborate, Concise) `M`
- [ ] Conversation History Storage - Store all sent emails with timestamps and content for context building `M`

### Should-Have Features

- [ ] Resume Attachment Feature - Upload resume during profile setup and attach to emails via checkbox `S`
- [ ] Email Templates Library - Save and reuse custom email templates `M`
- [ ] Draft Auto-Save - Automatically save email drafts while composing `S`

### Dependencies

- ✅ LLM API keys (OpenRouter configured, Gemini/OpenAI/Anthropic optional)
- ✅ Redis setup for caching (configured in Docker Compose)
- [ ] Gmail API project and OAuth credentials
- [ ] Microsoft Azure app registration for Graph API
- [ ] BullMQ setup for email queuing

---

## Phase 3: Automation & Follow-Up System (6-8 weeks)

**Goal:** Implement intelligent follow-up automation, reminder system, and advanced contact management features including import/export and LinkedIn integration.

**Success Criteria:**
- Automated follow-up reminders based on priority levels
- Birthday automation working
- Contact import achieving 90%+ accuracy
- LinkedIn profile scraping functional
- Advanced search and filtering operational

### Must-Have Features

- [ ] Follow-Up Reminder System - Generate reminders based on priority (monthly/quarterly/semi-annually) and last contact date `L`
- [ ] Birthday Automation - AI-generated birthday messages with one-click send `M`
- [ ] Contact Import - Parse CSV/Excel files and auto-populate contact fields with 95% accuracy using AI `L`
- [ ] Contact Export - Export all contacts to CSV/Excel with customizable field selection `M`
- [ ] LinkedIn Profile Scraping - Extract profile picture and enrichment data from LinkedIn URLs `L`
- [ ] Advanced Search & Filtering - Filter by company, industry, priority, role, gender, birthday month with Google-level precision `L`
- [ ] Contact History Tracking - Version control for contact field changes (Git-like tracking) `M`

### Should-Have Features

- [ ] Bulk Contact Operations - Select multiple contacts for bulk priority assignment, deletion, or export `M`
- [ ] Contact Deduplication - Detect and merge duplicate contact entries `M`
- [ ] Quick Add from Dashboard - Lightweight modal for rapid contact creation with minimal fields `S`

### Dependencies

- Background job queue (BullMQ) fully configured
- LinkedIn scraping solution (Puppeteer or third-party API)
- AI service for intelligent file parsing
- Notification system infrastructure

---

## Phase 4: Calendar, Analytics & Email Tracking (5-7 weeks)

**Goal:** Deliver comprehensive analytics dashboard, email tracking capabilities, and bidirectional calendar synchronization to complete the core feature set.

**Success Criteria:**
- Email open/read tracking working with 95%+ accuracy
- Analytics dashboard displaying key networking metrics
- Google Calendar and Outlook bidirectional sync operational
- Users can visualize networking growth trends
- Todo management system functional

### Must-Have Features

- [ ] Email Tracking Implementation - Pixel tracking for email opens and link tracking for clicks `L`
- [ ] Analytics Dashboard - Display total contacts, emails sent, open rate, response rate with trend graphs `L`
- [ ] Growth Trend Visualization - Line graphs for contacts, open rates, response rates filterable by time range (weekly/monthly/yearly) `M`
- [ ] Google Calendar Integration - Bidirectional sync with OAuth 2.0, display events on dashboard `L`
- [ ] Outlook Calendar Integration - Bidirectional sync with Microsoft Graph API `L`
- [ ] Event Display Card - Show upcoming meetings and calendar events on dashboard `M`
- [ ] Notification System - Action items card for pending follow-ups, unanswered emails, and approaching deadlines `L`
- [ ] Recent Activity Feed - Timeline of recent platform activities with click-through analytics `M`
- [ ] Todo Management - Add, edit, complete todos with reminder functionality `M`

### Should-Have Features

- [ ] Custom Date Range Analytics - Analyze metrics for any custom date range `S`
- [ ] Email Template Performance - Track which email templates/styles perform best `M`
- [ ] Contact Engagement Scoring - Score contacts based on email response rate and recency `M`

### Dependencies

- Email tracking service setup (custom pixel tracking infrastructure)
- Calendar API OAuth credentials (Google and Microsoft)
- Real-time notification infrastructure (WebSockets or Server-Sent Events)
- Data visualization library (Recharts or Chart.js)

---

## Phase 5: Enterprise Features & Scale (8-10 weeks)

**Goal:** Implement advanced AI features, self-hosted LLM options, enterprise security, and performance optimizations to prepare for production launch and scaling.

**Success Criteria:**
- Vector database operational for semantic search
- Self-hosted LLM deployment option available
- Security audit completed with all critical issues resolved
- Load testing confirms system handles 10,000+ concurrent users
- Performance optimizations reduce API response times by 50%

### Must-Have Features

- [ ] Vector Database Integration - Implement Pinecone/Weaviate for contact embeddings and semantic search `L`
- [ ] Semantic Contact Search - Find similar contacts based on conversation topics and context `L`
- [ ] Self-Hosted LLM Deployment - Deploy Ollama + vLLM with Llama 3/Gemma models for cost-effective inference `XL`
- [ ] LLM Provider Flexibility - Allow users to choose between OpenAI, Anthropic, Grok, or self-hosted models `M`
- [ ] Advanced AI Personalization - Learn user's writing style and preferences over time for better email suggestions `L`
- [ ] Security Hardening - Implement rate limiting, DDoS protection, comprehensive input validation `M`
- [ ] Performance Optimization - Database query optimization, caching strategies, CDN configuration `L`
- [ ] Kubernetes Deployment - Production deployment on Amazon EKS with auto-scaling and self-healing `XL`

### Should-Have Features

- [ ] Multi-Language Support - Internationalization for email templates and UI (i18n) `L`
- [ ] Team Features - Share contacts and email templates within organization `L`
- [ ] Advanced Permissions - Role-based access control for team features `M`
- [ ] Webhook System - Allow third-party integrations via webhooks `M`
- [ ] API for External Access - Public API for programmatic access to platform features `L`

### Dependencies

- Vector database account setup (Pinecone or Weaviate)
- GPU infrastructure for self-hosted LLM inference
- Kubernetes cluster provisioning (Amazon EKS)
- Security audit partner engagement
- Load testing infrastructure and tools
- Terraform infrastructure code

---

## Post-Launch: Continuous Improvement

**Ongoing Priorities:**
- User feedback incorporation and feature refinement
- AI model fine-tuning based on usage patterns
- Performance monitoring and optimization
- Security updates and dependency management
- Scale infrastructure based on user growth
- A/B testing for feature optimization
- Integration with additional third-party services (Calendly, Salesforce, etc.)
