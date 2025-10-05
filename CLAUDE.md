# RelationHub - AI-Powered Professional Relationship Management Platform

## Project Overview

RelationHub is an intelligent, agentic relationship management platform designed to revolutionize professional networking. This file serves as the central configuration and workflow guide for Claude Code development on this project.

---

## Agent OS Integration

### Product Documentation Structure

**Mission & Vision**
Reference: `.agent-os/product/mission.md`

**Technical Architecture** 
Reference: `.agent-os/product/tech-stack.md`

**Development Roadmap**
Reference: `.agent-os/product/roadmap.md`

**Decision History**
Reference: `.agent-os/product/decisions.md`

### Development Standards

**Code Style Guidelines**
Reference: `~/.agent-os/standards/code-style.md`

**Best Practices**
Reference: `~/.agent-os/standards/best-practices.md`

### Project Management

**Active Specifications**
Location: `.agent-os/specs/`

**Specification Creation**
Guide: `~/.agent-os/instructions/create-spec.md`

**Task Execution**
Guide: `~/.agent-os/instructions/execute-tasks.md`

---

## MCP Server Configuration & Usage

### Primary MCP Instructions

**CRITICAL: All MCP server usage must follow the comprehensive guide located at:**

```
/context/mcp-instructions.md
```

**This guide contains:**
- Detailed capabilities of each MCP server
- When to trigger specific servers
- Tool chaining workflows
- Best practices and examples
- Security scanning requirements
- Testing strategies

**Before using any MCP server, consult `/context/mcp-instructions.md` for proper usage patterns.**

---

## MCP Servers for RelationHub
Reference: `/context/mcp-instructions.md` for full details
### Priority Hierarchy

#### 1. Ref (PRIMARY - Use First)
**Purpose:** Token-efficient documentation search for all technical APIs and frameworks

**When to Use:**
- ANY Next.js, React, TypeScript documentation lookup
- NestJS, Prisma, GraphQL API references
- LangChain, LlamaIndex, OpenAI documentation
- Supabase Auth, BullMQ, Redis configuration
- TanStack Query, React Hook Form, Zod schemas
- Before implementing ANY external library or API

**Critical Rule:** Never hallucinate API signatures, configurations, or methods. Always check Ref first.

**Examples:**
```
"Use Ref to look up Prisma schema syntax for one-to-many relationships"
"Search Ref for Next.js 14 App Router server actions documentation"
"Find LangChain prompt template documentation in Ref"
```

#### 2. Semgrep (Security - Always Scan)
**Purpose:** Static code analysis for security vulnerabilities

**Mandatory Scans:**
- All authentication and authorization code
- Database query construction (Prisma, raw SQL)
- API endpoint handlers (GraphQL resolvers, REST routes)
- File upload/download functionality
- Environment variable usage
- OAuth integration code
- Email sending with user data
- AI/LLM prompt injection prevention

**When to Use:**
- After implementing any auth/security feature
- Before committing database interaction code
- When handling user input or PII
- After integrating external APIs

**Examples:**
```
"Scan the authentication middleware with Semgrep for security issues"
"Run Semgrep on the contact CRUD API endpoints"
"Check this OAuth flow for vulnerabilities using Semgrep"
```

#### 3. Playwright (Testing - Critical Flows)
**Purpose:** E2E testing for user workflows

**Required Tests:**
- Contact Management: Add/Edit/Delete/Search/Filter flows
- Email Composition: Template generation, A/B testing, sending
- Dashboard: Quick Add, analytics visualization, action items
- Authentication: Login/logout, OAuth providers
- Calendar Integration: Event sync, reminder creation
- AI Features: Email generation, follow-up automation

**When to Use:**
- After completing any user-facing feature
- Before marking features as "done"
- When refactoring critical paths
- For regression testing

**Examples:**
```
"Create Playwright E2E test for the contact creation flow"
"Generate Playwright tests for email composition with AI templates"
"Test the dashboard Quick Add feature with Playwright"
```

#### 4. Sequential Thinking (Complex Planning)
**Purpose:** Structured problem-solving for multi-step features

**When to Use:**
- Planning AI email generation architecture
- Designing calendar bidirectional sync logic
- Architecting contact history tracking system
- Planning LinkedIn profile scraping strategy
- Designing email tracking implementation
- Structuring LLM context management

**Examples:**
```
"Use Sequential Thinking to plan the AI email template generation system"
"Break down the calendar OAuth integration architecture with Sequential Thinking"
"Plan the contact import/export feature using Sequential Thinking"
```

#### 5. Exa (Code Examples)
**Purpose:** Find real-world implementation patterns from production codebases

**When to Use:**
- Looking for Next.js + NestJS integration patterns
- GraphQL subscription implementation examples
- LangChain prompt chaining patterns
- Prisma complex relationship examples
- OAuth 2.0 implementation references

**Examples:**
```
"Use Exa to find Next.js + NestJS monorepo structure examples"
"Search Exa for LangChain email generation implementations"
"Find GraphQL subscription examples with Apollo Server in Exa"
```

#### 6. Brave Search (Broader Research)
**Purpose:** Web search for community content, tutorials, and current information

**When to Use:**
- Researching LLM integration best practices
- Finding tutorials for specific tech combinations
- Looking up error messages and solutions
- Checking for known issues with libraries
- Finding blog posts on architectural patterns

**Note:** Use after Ref when official docs don't provide enough context.

#### 7. GitHub (Repository Management)
**Purpose:** PR automation, code search, and repository operations

**When to Use:**
- Creating pull requests for completed features
- Searching existing codebase patterns
- Analyzing commit history
- Managing issues and project boards

---

## Development Workflow

### Standard Feature Implementation Flow

#### Step 1: Research & Planning
```
1. Check .agent-os/product/roadmap.md for current priorities
2. Use Ref to research required APIs and frameworks
3. Use Sequential Thinking for complex feature planning
4. Use Exa to find real-world implementation examples
```

#### Step 2: Implementation
```
1. Follow tech-stack.md specifications
2. Adhere to code-style.md and best-practices.md
3. Use Ref continuously for API lookups
4. Never hallucinate - always verify with Ref
```

#### Step 3: Security & Testing
```
1. Run Semgrep on all security-critical code
2. Create Playwright E2E tests for user flows
3. Verify test coverage meets 80% minimum
```

#### Step 4: Review & Deploy
```
1. Use GitHub integration for PR creation
2. Document changes in decision history if architectural
3. Update roadmap.md if priorities shift
```

---

## Feature-Specific MCP Workflows

### Contact Management Features
```
1. Ref → Prisma schema documentation
2. Sequential Thinking → Plan CRUD architecture
3. Ref → Next.js form handling patterns
4. [Implement Feature]
5. Semgrep → Scan API routes
6. Playwright → Test contact creation/editing/deletion flows
```

### AI Email Generation Features
```
1. Sequential Thinking → Plan LLM integration architecture
2. Ref → LangChain documentation
3. Ref → OpenAI/Grok API documentation
4. Exa → Find production email generation examples
5. [Implement Feature]
6. Semgrep → Check prompt injection vulnerabilities
7. Playwright → Test email generation and A/B testing
```

### Calendar Integration Features
```
1. Sequential Thinking → Plan bidirectional sync logic
2. Ref → Google Calendar API documentation
3. Ref → OAuth 2.0 flow documentation
4. Exa → Find calendar sync implementation examples
5. [Implement Feature]
6. Semgrep → Scan OAuth implementation
7. Playwright → Test event sync and creation
```

### Dashboard & Analytics Features
```
1. Ref → Recharts/visualization library documentation
2. Ref → TanStack Query data fetching patterns
3. [Implement Feature]
4. Playwright → Test all dashboard cards and interactions
```


---

## Design & Visual Development

### Design Documentation

**Design Principles**
Reference: `/context/design-principles.md`

**Brand Style Guide**
Reference: `/context/style-guide.md`

**CRITICAL:** Always refer to these files when implementing any UI/UX changes.

## Visual Development

### Design Principles
- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@agent-design-review` subagent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

<!-- 
### Visual Verification Workflow

**After EVERY frontend change, perform this verification:**

#### Immediate Visual Check

1. **Identify Changes**
   - Review modified components/pages
   - Note specific visual alterations

2. **Navigate to Affected Pages**
   ```
   Use Playwright: mcp__playwright__browser_navigate
   Visit each changed view in the application
   ```

3. **Verify Design Compliance**
   - Compare against `/context/design-principles.md`
   - Validate against `/context/style-guide.md`
   - Check color usage, typography, spacing, layout

4. **Validate Feature Implementation**
   - Ensure change fulfills user's specific request
   - Check acceptance criteria from requirements
   - Verify functionality works as expected

5. **Capture Evidence**
   ```
   Take full page screenshot at desktop viewport (1440px)
   Document each changed view
   ```

6. **Check for Errors**
   ```
   Use Playwright: mcp__playwright__browser_console_messages
   Verify no console errors or warnings
   ```

#### Comprehensive Design Review

**Invoke the @agent-design-review subagent when:**
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility testing
- Requiring responsiveness validation across viewports -->

---

## Tech Stack Override Notice

**IMPORTANT:** This project uses Next.js + NestJS + TypeScript stack instead of global standards.

**Rationale** (see DEC-002 in `.agent-os/product/decisions.md`):
- AI/LLM integration requirements (LangChain, LlamaIndex)
- Real-time GraphQL subscriptions
- Type-safe frontend/backend communication
- MCP server compatibility
- Modern TypeScript ecosystem benefits

**Tech Stack Reference:** Always consult `.agent-os/product/tech-stack.md` for complete specifications.

---

## Error Resolution & Troubleshooting

**CRITICAL: Before debugging any error, always check the error log first:**

📚 **Error Knowledge Base:** `/context/errors-solved.md`

This comprehensive log contains:
- All previously solved errors with root causes
- Step-by-step solutions
- Prevention strategies
- Quick reference fixes for common issues

**Common Error Categories:**
- Database & Prisma errors (P1010, P1012, connection issues)
- Build & configuration errors (Next.js, Tailwind CSS, TypeScript)
- Docker & container conflicts
- Environment variable issues

**Before spending time debugging, search errors-solved.md for:**
- Error code (e.g., "P1010")
- Error message keywords
- Technology name (e.g., "Prisma", "Docker", "Next.js")

---

## Critical Rules & Standards

### Documentation Priority Order

When conflicts arise, follow this priority hierarchy:

1. **Product-specific files in `.agent-os/product/`** (highest priority)
2. **User's specific instructions** (overrides or amends specs)
3. **Project specs in `.agent-os/specs/`**
4. **Global standards in `~/.agent-os/standards/`**
5. **MCP instructions in `/context/mcp-instructions.md`**
6. **Error solutions in `/context/errors-solved.md`** (for debugging)

### MCP Server Usage Rules

**ALWAYS:**
- Use Ref FIRST for all technical documentation
- Run Semgrep on authentication, database, and API code
- Create Playwright tests for critical user flows
- Use Sequential Thinking for complex feature planning
- Verify with Ref before implementing any API/library

**NEVER:**
- Hallucinate API signatures, methods, or configurations
- Skip security scanning on auth or data handling code
- Implement features without E2E tests
- Make assumptions about library usage without checking Ref

### Security Requirements

**Mandatory for ALL features involving:**
- User authentication or authorization
- Database queries (especially with user input)
- File uploads or downloads
- Email sending with user data
- OAuth integrations
- API key or secret management
- AI/LLM prompt construction with user input

**Action:** Run Semgrep scan and address all findings before committing.

### Testing Requirements

**Minimum Coverage:** 80% across all code

**Required E2E Tests:**
- Contact CRUD operations
- Email composition and sending
- AI template generation
- Dashboard interactions
- Calendar synchronization
- Authentication flows
- Import/export functionality

---

## Quick Reference Commands

### Start New Feature
```
1. Review roadmap: .agent-os/product/roadmap.md
2. Follow: ~/.agent-os/instructions/create-spec.md
3. Use Ref for API research
4. Use Sequential Thinking for planning
```

### Execute Tasks
```
1. Follow: ~/.agent-os/instructions/execute-tasks.md
2. Reference: /context/mcp-instructions.md for MCP workflows
3. Implement with continuous Ref lookups
4. Scan with Semgrep
5. Test with Playwright
```

### Visual Changes
```
1. Implement change
2. Check design-principles.md and style-guide.md
3. Navigate with Playwright
4. Screenshot at 1440px
5. Check console messages
6. Invoke @agent-design-review if significant
```

### Security Scan
```
1. Implement security-sensitive code
2. Run Semgrep with appropriate rules
3. Address all findings
4. Document in decision history if architectural
```

---

## Additional Resources

### MCP Server Documentation
**Primary Guide:** `/context/mcp-instructions.md`
- Complete MCP server capabilities
- Detailed usage examples
- Tool chaining patterns
- Security and testing workflows

### Project Documentation
- Mission: `.agent-os/product/mission.md`
- Tech Stack: `.agent-os/product/tech-stack.md`
- Roadmap: `.agent-os/product/roadmap.md`
- Decisions: `.agent-os/product/decisions.md`

### Standards
- Code Style: `~/.agent-os/standards/code-style.md`
- Best Practices: `~/.agent-os/standards/best-practices.md`

### Design
- Principles: `/context/design-principles.md`
- Style Guide: `/context/style-guide.md`

### Troubleshooting
- **Error Knowledge Base**: `/context/errors-solved.md`
  - Database & Prisma errors (P1010, P1012, connection issues)
  - Build errors (Next.js, Tailwind CSS, TypeScript)
  - Docker & container conflicts
  - Environment variable issues
  - Quick reference fixes

---

## Success Criteria

A feature is considered complete when:

- ✅ Implements requirements from specifications
- ✅ Follows tech-stack.md guidelines
- ✅ Adheres to code-style.md standards
- ✅ All Ref lookups performed (no hallucinated APIs)
- ✅ Semgrep scan passed (security-critical code)
- ✅ Playwright E2E tests created and passing
- ✅ 80%+ test coverage achieved
- ✅ Design principles verified (UI changes)
- ✅ Documentation updated (if architectural)
- ✅ PR created with GitHub integration

---

See @.agent-os/product/roadmap.md for complete phased development plan.

*This claude.md file works in conjunction with /context/mcp-instructions.md to provide comprehensive development guidance for the RelationHub platform.*


