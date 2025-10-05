# Technical Stack

> Last Updated: 2025-10-04
> Version: 1.0.0

## Application Framework

**Framework:** Next.js 14+ (App Router)
- Server-side rendering for SEO and performance optimization
- Built-in API routes for Backend-for-Frontend (BFF) pattern
- Excellent TypeScript support with type-safe routing
- Edge runtime capabilities for globally distributed functions
- Native image optimization and lazy loading

**Version:** 14.2+

**Language:** TypeScript 5.3+
- Full type safety across frontend and backend
- Shared type definitions between client and server
- Enhanced developer experience with autocomplete

## Backend Framework

**Framework:** NestJS 10+
- Enterprise-grade architecture with modular structure
- Built-in dependency injection container
- Decorator-based patterns ideal for AI code generation
- Microservices-ready architecture
- Comprehensive testing utilities

**Runtime:** Node.js 20+ LTS
- Modern JavaScript features
- Enhanced performance and security
- Long-term support

## Database

**Primary Database:** PostgreSQL 16+
- Hosted on Amazon RDS for managed backups and scaling
- ACID compliance for transactional integrity
- Native JSON/JSONB support for flexible contact metadata
- Full-text search capabilities for contact search
- PostGIS extension for future location-based features

**ORM:** Prisma 5+
- Type-safe database queries
- Automatic migration generation
- Database schema visualization
- Perfect TypeScript integration
- Client generation for compile-time safety

**Cache Layer:** Redis 7+ (Amazon ElastiCache)
- Session management and user authentication tokens
- API response caching for performance
- Real-time features (presence, notifications)
- Queue job state management

**Vector Database:** Pinecone or Weaviate
- Contact embeddings for semantic search
- AI context storage for conversation history
- Similarity matching for contact recommendations

## API Layer

**API Type:** GraphQL with Apollo Server 4+
- Type-safe API contracts with schema-first development
- Efficient data fetching with field-level resolution
- Real-time subscriptions for notifications and updates
- Built-in caching and performance optimization
- GraphQL Code Generator for TypeScript types

**Alternative REST Endpoints:** Express.js
- Webhook receivers for email provider callbacks
- OAuth redirect handlers
- File upload endpoints
- Health checks and monitoring

## Frontend Stack

**UI Library:** React 18+
- Component-based architecture
- Server Components for improved performance
- Suspense and concurrent rendering
- Large ecosystem of libraries

**Styling:** Tailwind CSS 4+ with Shadcn/ui
- Utility-first CSS framework
- Pre-built accessible components
- Consistent design system
- Dark mode support
- Responsive design utilities

**State Management:** Zustand + TanStack Query (React Query) 5+
- Zustand for lightweight global state
- TanStack Query for server state and caching
- Optimistic updates for better UX
- Automatic background refetching

**Forms:** React Hook Form 7+ with Zod 3+
- Performant form handling with minimal re-renders
- Schema-based validation
- TypeScript integration
- Native error handling

## AI & LLM Integration

**LLM Gateway:** LangChain 0.1+ with LlamaIndex
- Multiple LLM provider support (OpenAI, Anthropic, Grok)
- Prompt template management and versioning
- Context window optimization
- Chain-of-thought reasoning for email generation
- Memory management for conversation context

**Primary LLM APIs:**
- OpenAI GPT-4/GPT-4 Turbo for premium features
- Anthropic Claude for complex reasoning tasks
- Grok API (when available) for alternative provider
- Fallback provider chain for reliability

**Local LLM Hosting:** Ollama + vLLM
- Self-hosted model deployment for cost optimization
- Privacy-focused processing for sensitive data
- Models: Llama 3, Gemma 2, Mistral
- GPU-accelerated inference

**Embeddings:** OpenAI Ada v2 or Sentence Transformers
- Semantic search capabilities
- Contact similarity matching
- Conversation topic clustering

## Background Jobs & Queues

**Queue System:** BullMQ 5+ with Redis
- Background job processing for email sending
- Scheduled follow-up reminder jobs
- AI email generation tasks
- LinkedIn profile scraping queues
- Retry logic and dead letter queues

**Cron Jobs:** node-cron or Kubernetes CronJobs
- Daily birthday reminder checks
- Weekly relationship health scoring
- Monthly analytics aggregation

## File Storage

**Provider:** Amazon S3
- Resume and document storage
- Contact profile pictures
- Email attachment storage
- Secure presigned URLs for private access
- Lifecycle policies for cost optimization

**CDN:** Amazon CloudFront
- Global content delivery
- Image optimization and resizing
- Edge caching for performance

## Authentication & Security

**Authentication:** Auth0 or Supabase Auth
- Social login (Google, LinkedIn, Microsoft)
- Multi-factor authentication (MFA)
- Session management
- JWT token handling
- Password reset flows

**API Security:**
- Rate limiting: express-rate-limit
- Security headers: helmet.js
- Input validation: Zod schemas at every layer
- API Gateway: Kong or AWS API Gateway
- CORS configuration for cross-origin requests

**Encryption:**
- TLS/SSL for all communications
- AES-256 encryption for sensitive data at rest
- bcrypt for password hashing
- Environment variable management with AWS Secrets Manager

## Email Integration

**Email Service Providers:**
- Gmail API (OAuth 2.0 integration)
- Microsoft Graph API for Outlook
- SMTP fallback for other providers

**Email Tracking:** Custom pixel tracking + link tracking
- Open rate detection
- Click-through tracking
- Time-based engagement analytics

**Email Queue:** BullMQ with retry logic
- Scheduled sending
- Batch processing
- Delivery status tracking

## Calendar Integration

**Providers:**
- Google Calendar API (OAuth 2.0)
- Microsoft Graph API for Outlook Calendar
- Calendly API for meeting scheduling

**Synchronization:**
- Bidirectional real-time sync
- Webhook receivers for external updates
- Conflict resolution for overlapping events

## Testing

**Unit Testing:** Vitest 1+
- Fast test execution
- Native ESM support
- TypeScript support
- Compatible with Jest ecosystem

**Component Testing:** React Testing Library
- User-centric testing approach
- Accessibility testing utilities

**E2E Testing:** Playwright 1.40+
- Cross-browser testing
- Visual regression testing
- API testing capabilities
- Parallel test execution

**Backend Testing:** Jest + Supertest
- API endpoint testing
- Integration testing
- Mock external services

**Minimum Coverage:** 80% across all code

## Infrastructure & DevOps

**Containerization:** Docker + Docker Compose
- Consistent development environments
- Multi-stage builds for optimization
- Docker Compose for local development stack

**Orchestration:** Kubernetes on Amazon EKS
- Auto-scaling based on load
- Self-healing containers
- Rolling updates with zero downtime
- Pod resource management

**CI/CD:** GitHub Actions
- Automated testing on pull requests
- Deployment pipelines for staging and production
- Security scanning (Snyk, npm audit)
- Docker image building and pushing
- Automated database migrations

**Infrastructure as Code:** Terraform
- Version-controlled infrastructure
- Multi-environment management (dev, staging, prod)
- State management with remote backends
- Consistent provisioning

**Monitoring & Observability:**
- APM: Datadog or New Relic for performance monitoring
- Error Tracking: Sentry for exception monitoring
- Logging: CloudWatch Logs or ELK Stack
- Metrics: Prometheus + Grafana
- Uptime monitoring: PagerDuty or Pingdom

## Development Tools

**Package Manager:** npm or pnpm
- Faster installations with pnpm
- Workspace support for monorepo

**Monorepo Structure:** Turborepo or Nx
- Shared packages between frontend and backend
- Incremental builds
- Remote caching

**Code Quality:**
- Linting: ESLint 8+ with TypeScript plugin
- Formatting: Prettier 3+
- Git hooks: Husky + lint-staged
- Commit conventions: Conventional Commits

**API Documentation:**
- GraphQL: GraphiQL or Apollo Studio
- REST: OpenAPI/Swagger
- Auto-generated from code annotations

## Hosting & Deployment

**Application Hosting:** Amazon EKS (Kubernetes)
- Auto-scaling based on CPU/memory
- Multi-availability zone deployment
- Load balancing with Application Load Balancer

**Database Hosting:** Amazon RDS for PostgreSQL
- Multi-AZ deployment for high availability
- Automated backups with point-in-time recovery
- Read replicas for scaling reads

**Environments:**
- Production: main branch, EKS production cluster
- Staging: staging branch, EKS staging cluster
- Development: local Docker Compose

## Code Repository

**Repository URL:** To be determined (GitHub recommended)
- Monorepo structure
- Branch protection rules
- Required PR reviews
- Automated checks before merge
