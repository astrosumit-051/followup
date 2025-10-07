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

**📖 Complete Documentation:** `/context/mcp-instructions.md`

All MCP server details including full tool lists, usage patterns, and workflows are documented in the comprehensive guide. Below is a quick reference of available servers:

### Quick Reference - 9 MCP Servers Available

| # | Server | Primary Purpose | Key Tools |
|---|--------|-----------------|-----------|
| 1 | **Ref** | Token-efficient documentation search (USE FIRST) | `ref_search_documentation`, `ref_read_url` |
| 2 | **Brave Search** | Web search for tutorials, examples, community content | `brave_web_search`, `brave_local_search` |
| 3 | **Playwright** | Broad E2E testing & workflow validation | 20 tools for navigation, interaction, testing |
| 4 | **Chrome DevTools** | Deep performance profiling & debugging | 25+ tools for performance, network, emulation |
| 5 | **Semgrep** | Security scanning & static analysis | 7 tools for vulnerability detection |
| 6 | **GitHub** | Repository management & PR automation | 30+ tools for code, issues, PRs, workflows |
| 7 | **Sequential Thinking** | Complex multi-step problem solving | `sequentialthinking` |
| 8 | **PostgreSQL** | Read-only database queries for debugging | `query` |
| 9 | **Notion** | Documentation & specs management | 14 tools for pages, databases, search |

### Priority Rules

**ALWAYS start with Ref** for any technical documentation lookup - never hallucinate API signatures.

**For every feature:**
1. 🔍 **Research**: Ref → Sequential Thinking → Brave Search
2. 🛠️ **Implement**: Follow tech-stack.md with continuous Ref lookups
3. 🔒 **Security**: Semgrep scan on auth/database/API code
4. 🗄️ **Database**: PostgreSQL to verify schema after migrations
5. 🧪 **Testing**: Playwright E2E tests (broad validation)
6. ⚡ **Performance**: Chrome DevTools profiling (deep analysis)
7. 📝 **Document**: Notion for architectural decisions
8. 🚀 **Deploy**: GitHub PR creation

**📚 See `/context/mcp-instructions.md` for:**
- Complete tool lists for each server
- Detailed usage examples and when to trigger
- Tool chaining workflows and patterns
- Security scanning requirements
- Best practices and integration strategies

---

## Development Workflow

### Standard Feature Implementation Flow

#### Step 1: Research & Planning
```
1. Check .agent-os/product/roadmap.md for current priorities
2. Use Ref to research required APIs and frameworks
3. Use Sequential Thinking for complex feature planning
4. Use Brave Search to find real-world implementation examples
```

#### Step 2: Implementation
```
1. Follow tech-stack.md specifications
2. Adhere to code-style.md and best-practices.md
3. Use Ref continuously for API lookups
4. Never hallucinate - always verify with Ref
```

#### Step 3: Security, Testing & Performance
```
1. Run Semgrep on all security-critical code
2. Create Playwright E2E tests for user flows (broad validation)
3. Profile with Chrome DevTools for performance (deep analysis)
4. Verify test coverage meets 80% minimum
```

#### Step 4: Review & Deploy
```
1. Use GitHub integration for PR creation
2. Document changes in decision history if architectural
3. Update roadmap.md if priorities shift
```

---

## Feature-Specific MCP Workflows

**📖 Detailed workflows:** See `/context/mcp-instructions.md` section "Workflow Patterns"

### Quick Feature Workflow Templates

#### Contact Management Features
```
Ref (Prisma) → Sequential Thinking → Ref (Next.js) → Implement →
Semgrep → PostgreSQL → Playwright → Chrome DevTools
```

#### AI Email Generation Features
```
Sequential Thinking → Ref (LangChain + OpenAI) → Brave Search →
Implement → Semgrep (prompt injection) → PostgreSQL → Playwright →
Chrome DevTools (performance testing)
```

#### Calendar Integration Features
```
Sequential Thinking → Ref (Calendar APIs + OAuth) → Brave Search →
Implement → Semgrep (OAuth) → Playwright → Chrome DevTools
```

#### Dashboard & Analytics Features
```
Ref (Recharts + TanStack Query) → Implement → PostgreSQL (query testing) →
Playwright → Chrome DevTools (Core Web Vitals optimization)
```

**💡 For complete workflows with detailed steps, see the comprehensive workflow patterns in `/context/mcp-instructions.md`**


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

**📖 Complete rules and best practices:** `/context/mcp-instructions.md`

**Golden Rules:**

✅ **ALWAYS:**
- Use **Ref FIRST** for all technical documentation (PRIMARY - never hallucinate APIs)
- Run **Semgrep** on authentication, database, and API code
- Create **Playwright** tests for critical user flows (broad validation, 80% coverage minimum)
- Profile with **Chrome DevTools** for performance optimization (deep analysis)
- Use **Sequential Thinking** for complex feature planning
- Verify with **Ref** before implementing any API/library
- Check **PostgreSQL** schema before and after migrations
- Document architectural decisions in **Notion**
- Use **Playwright + Chrome DevTools** together for comprehensive testing

❌ **NEVER:**
- Hallucinate API signatures, methods, or configurations
- Skip security scanning on auth or data handling code
- Implement features without E2E tests
- Skip performance profiling for user-facing features
- Make assumptions about library usage without checking Ref
- Run destructive queries with PostgreSQL MCP (READ-ONLY - use Prisma for writes)
- Skip documentation of important implementation decisions

**🔗 See `/context/mcp-instructions.md` for detailed usage patterns, tool chaining workflows, and integration best practices**

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

### Testing & Performance Requirements

**Minimum Coverage:** 80% across all code

**Required E2E Tests (Playwright):**
- Contact CRUD operations
- Email composition and sending
- AI template generation
- Dashboard interactions
- Calendar synchronization
- Authentication flows
- Import/export functionality

**Required Performance Profiling (Chrome DevTools):**
- Dashboard page load and Core Web Vitals
- Contact list rendering performance
- Email composition interface responsiveness
- Calendar sync operations
- AI generation response times
- Slow network/device testing (3G, 4G, CPU throttling)

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
2. Reference: /context/mcp-instructions.md for MCP workflows and tool lists
3. Implement with continuous Ref lookups (never hallucinate)
4. Scan with Semgrep (security-critical code)
5. Verify with PostgreSQL (schema changes)
6. Test with Playwright (E2E user flows - broad validation)
7. Profile with Chrome DevTools (performance - deep analysis)
8. Document with Notion (architectural decisions)
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

## Local Development Setup

### First-Time Setup

**📚 Complete Setup Guide:** `SETUP.md`

For new developers setting up the project locally, follow the comprehensive setup guide which includes:
- Prerequisites (Node.js v22+, pnpm v8+, PostgreSQL v17+)
- Supabase project creation and configuration
- Authentication provider setup (Email + Google OAuth)
- Environment variable configuration for both frontend and backend
- Database migrations with Prisma
- Development server startup options
- Authentication flow verification
- Troubleshooting common setup issues

**Quick Setup Steps:**
```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
# Frontend: apps/web/.env.local (see apps/web/.env.local.example)
# Backend: apps/api/.env (see apps/api/.env.example)

# 3. Run database migrations
cd apps/api && pnpm prisma migrate dev

# 4. Start development servers
pnpm dev  # Starts both frontend (3000) and backend (4000)
```

**Environment Variables Required:**

**Frontend** (`apps/web/.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous public key

**Backend** (`apps/api/.env`):
- `SUPABASE_URL` - Your Supabase project URL (same as frontend)
- `SUPABASE_JWT_SECRET` - JWT secret from Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret, bypasses RLS)
- `DATABASE_URL` - PostgreSQL connection string

**Testing Authentication Setup:**
1. Start servers: `pnpm dev`
2. Visit http://localhost:3000
3. Test signup flow: http://localhost:3000/signup
4. Test login flow: http://localhost:3000/login
5. Test Google OAuth if configured
6. Verify dashboard access at http://localhost:3000/dashboard
7. Test logout functionality

**GraphQL Playground:**
- Access at http://localhost:4000/graphql
- Test authenticated queries (requires JWT token from login session)
- Example query: `{ me { id email name profilePicture lastLoginAt } }`

**For detailed troubleshooting and complete setup instructions, see `SETUP.md` in the project root.**

---

## Additional Resources

### MCP Server Documentation
**📖 PRIMARY REFERENCE:** `/context/mcp-instructions.md`

This comprehensive guide contains:
- **Complete tool lists** for all 8 MCP servers (70+ tools total)
- **Detailed usage patterns** and when to trigger each server
- **Tool chaining workflows** for common development patterns
- **Security scanning requirements** and best practices
- **Integration strategies** and proactive tool usage
- **Quick reference table** for rapid tool lookup
- **Workflow patterns** for feature development, bug investigation, API integration, and more

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


