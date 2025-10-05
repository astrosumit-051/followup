# Spec Requirements Document

> Spec: Project Setup & Database Schema
> Created: 2025-10-04
> Status: Planning

## Overview

Establish the foundational Next.js + NestJS monorepo structure with PostgreSQL database, Prisma ORM integration, and complete database schema for the RelationHub platform. This is the critical first step in Phase 1 that enables all subsequent features.

## User Stories

### Monorepo Foundation

As a developer, I want a properly structured Next.js + NestJS monorepo with TypeScript, so that I can build both frontend and backend features with shared type definitions and a consistent development experience.

**Workflow:**
- Initialize Next.js 14+ with App Router in `/apps/web` directory
- Set up NestJS 10+ in `/apps/api` directory
- Configure shared TypeScript packages in `/packages` for common types and utilities
- Set up Turborepo or pnpm workspaces for efficient builds
- Configure environment variable management for development and production

### Database Schema & ORM

As a developer, I want a complete PostgreSQL database schema with Prisma ORM, so that I can store and manage all contact information, user authentication data, and relationship metadata with full type safety.

**Workflow:**
- Define Prisma schema for User, Contact, Email, Activity, and Tag models
- Set up database connection with PostgreSQL (local Docker for development)
- Generate and run initial migrations
- Create seed data for development and testing
- Verify all relationships and constraints work correctly

### Development Environment

As a developer, I want a containerized development environment with Docker Compose, so that I can run the entire stack locally including PostgreSQL, Redis, and both applications without manual configuration.

**Workflow:**
- Create Docker Compose configuration for local development
- Include services: PostgreSQL, Redis, Next.js dev server, NestJS dev server
- Set up hot reload for both frontend and backend
- Configure networking between containers
- Document setup instructions in README

## Spec Scope

1. **Monorepo Structure** - Initialize Next.js + NestJS monorepo with Turborepo/pnpm workspaces, TypeScript configuration, and shared packages
2. **Prisma Schema** - Complete database schema with User, Contact, Email, Activity, Tag, Reminder, and relationship models
3. **Database Migrations** - Initial migration files, seed data generation, and migration scripts
4. **Docker Development Environment** - Docker Compose configuration for PostgreSQL, Redis, Next.js, NestJS with hot reload
5. **Environment Configuration** - .env templates, environment variable validation, secrets management setup

## Out of Scope

- Authentication implementation (separate feature in Phase 1)
- Frontend UI components (separate feature)
- AI/LLM integration (Phase 2)
- Email sending functionality (Phase 2)
- Production deployment configuration (handled later in Phase 1)

## Expected Deliverable

1. Monorepo with Next.js and NestJS successfully running on `http://localhost:3000` (web) and `http://localhost:3001` (api)
2. PostgreSQL database accessible and seeded with test data
3. Prisma Studio accessible at `http://localhost:5555` showing all tables with proper relationships
4. Docker Compose stack starts with single command: `docker-compose up`
5. All migrations run successfully and database schema matches Prisma schema
6. Developer can create/read/update/delete contacts via Prisma Client (tested via seed script)

## Spec Documentation

- Tasks: @.agent-os/specs/2025-10-04-project-setup-database-schema/tasks.md
- Technical Specification: @.agent-os/specs/2025-10-04-project-setup-database-schema/sub-specs/technical-spec.md
- Database Schema: @.agent-os/specs/2025-10-04-project-setup-database-schema/sub-specs/database-schema.md
- Tests Specification: @.agent-os/specs/2025-10-04-project-setup-database-schema/sub-specs/tests.md
