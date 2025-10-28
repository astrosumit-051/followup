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

### Quick Reference - 7 MCP Servers Available

| # | Server | Primary Purpose | Key Tools |
|---|--------|-----------------|-----------|
| 1 | **Ref** | Token-efficient documentation search (USE FIRST) | `ref_search_documentation`, `ref_read_url` |
| 2 | **Playwright** | Broad E2E testing & workflow validation | 20 tools for navigation, interaction, testing |
| 3 | **Chrome DevTools** | Deep performance profiling & debugging | 25+ tools for performance, network, emulation |
| 4 | **Semgrep** | Security scanning & static analysis | 7 tools for vulnerability detection |
| 5 | **GitHub** | Repository management & PR automation | 30+ tools for code, issues, PRs, workflows |
| 6 | **Sequential Thinking** | Complex multi-step problem solving | `sequentialthinking` |
| 7 | **shadcn** | UI component registry & installation | Browse/search/install components, examples |

### Priority Rules

**ALWAYS start with Ref** for any technical documentation lookup - never hallucinate API signatures.

**For every feature:**
1. 🔍 **Research**: Ref → Sequential Thinking → GitHub Issues (check existing issues)
2. 🎨 **UI Components**: shadcn for pre-built components
3. 🛠️ **Implement**: Follow tech-stack.md with continuous Ref lookups
4. 🔒 **Security**: Semgrep scan on auth/database/API code
5. 🧪 **Testing**: Playwright E2E tests (broad validation)
6. ⚡ **Performance**: Chrome DevTools profiling (deep analysis)
7. 📋 **Track**: GitHub Issues to update status and document decisions
8. 🚀 **Deploy**: GitHub PR creation linked to issue

**📚 See `/context/mcp-instructions.md` for:**
- Complete tool lists for each server
- Detailed usage examples and when to trigger
- Tool chaining workflows and patterns
- Security scanning requirements
- Best practices and integration strategies

### Auto-Approved MCP Tools

The following MCP tools can be used without requiring user approval for automated testing and development workflows:

**Playwright MCP:**
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Capture page snapshots
- `mcp__playwright__browser_take_screenshot` - Take screenshots
- `mcp__playwright__browser_click` - Click elements
- `mcp__playwright__browser_fill` - Fill form fields
- `mcp__playwright__browser_type` - Type text
- `mcp__playwright__browser_console_messages` - Get console messages
- `mcp__playwright__browser_wait_for` - Wait for conditions
- `mcp__playwright__browser_install` - Install browser

**Chrome DevTools MCP:**
- `mcp__chrome-devtools__navigate_page` - Navigate to URLs
- `mcp__chrome-devtools__take_screenshot` - Take screenshots
- `mcp__chrome-devtools__resize_page` - Resize viewport
- `mcp__chrome-devtools__list_console_messages` - Get console messages
- `mcp__chrome-devtools__list_network_requests` - Get network requests
- `mcp__chrome-devtools__list_pages` - List open pages
- `mcp__chrome-devtools__performance_start_trace` - Start performance trace
- `mcp__chrome-devtools__performance_stop_trace` - Stop performance trace
- `mcp__chrome-devtools__performance_analyze_insight` - Analyze performance

**Ref MCP:**
- `mcp__Ref__ref_search_documentation` - Search documentation
- `mcp__Ref__ref_read_url` - Read documentation URLs

**shadcn MCP:**
- `mcp__shadcn__get_project_registries` - Get configured registries
- `mcp__shadcn__list_items_in_registries` - List components
- `mcp__shadcn__search_items_in_registries` - Search components
- `mcp__shadcn__view_items_in_registries` - View component details
- `mcp__shadcn__get_item_examples_from_registries` - Get usage examples
- `mcp__shadcn__get_add_command_for_items` - Get install command
- `mcp__shadcn__get_audit_checklist` - Post-install checklist

**Sequential Thinking MCP:**
- `mcp__sequential-thinking__sequentialthinking` - Complex problem solving

**Semgrep MCP:**
- `mcp__semgrep__semgrep_scan` - Security scanning
- `mcp__semgrep__semgrep_findings` - Get security findings
- `mcp__semgrep__semgrep_scan_with_custom_rule` - Custom rule scanning

**Note:** These tools are pre-approved for automated workflows. For destructive operations or changes to production systems, explicit user approval is still required.

---

## Development Workflow

### Standard Feature Implementation Flow

#### Step 1: Research & Planning
```
1. Check .agent-os/product/roadmap.md for current priorities
2. Check GitHub Issues for existing issues and feature specs
3. Use Ref to research required APIs and frameworks
4. Use Sequential Thinking for complex feature planning
5. Use shadcn to find UI components for the feature
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
GitHub (check issues) → Ref (Prisma) → Sequential Thinking →
shadcn (forms/tables) → Ref (Next.js) → Implement →
Semgrep → Playwright → Chrome DevTools → GitHub (update issue)
```

#### AI Email Generation Features
```
GitHub (check issues) → Sequential Thinking → Ref (LangChain + OpenAI) →
shadcn (email editor components) → Implement →
Semgrep (prompt injection) → Playwright →
Chrome DevTools (performance testing) → GitHub (update issue)
```

#### Calendar Integration Features
```
GitHub (check issues) → Sequential Thinking → Ref (Calendar APIs + OAuth) →
shadcn (calendar UI) → Implement → Semgrep (OAuth) →
Playwright → Chrome DevTools → GitHub (update issue)
```

#### Dashboard & Analytics Features
```
GitHub (check issues) → Ref (Recharts + TanStack Query) →
shadcn (charts/cards) → Implement →
Playwright → Chrome DevTools (Core Web Vitals) → GitHub (update issue)
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
- Use **shadcn** to find UI components before building from scratch
- Verify with **Ref** before implementing any API/library
- Track work with **GitHub Issues** and link to PRs
- Use **Playwright + Chrome DevTools** together for comprehensive testing

❌ **NEVER:**
- Hallucinate API signatures, methods, or configurations
- Skip security scanning on auth or data handling code
- Implement features without E2E tests
- Build custom UI components before checking shadcn registry
- Skip performance profiling for user-facing features
- Make assumptions about library usage without checking Ref
- Forget to link GitHub Issues to PRs

**🚨 CRITICAL: When Stuck or Encountering Problems**

**You MUST use the appropriate MCP server BEFORE attempting to proceed when you encounter:**

1. **Stuck on implementation** → **Sequential Thinking** (break down problem)
2. **Unsure about API usage** → **Ref** (look up exact documentation)
3. **Debugging errors** → **Ref** (error messages) + **Sequential Thinking** (root cause)
4. **Need UI component** → **shadcn** (find existing components)
5. **Database issues** → **Prisma CLI** (inspect schema with `prisma db pull`, `prisma studio`)
6. **Security concerns** → **Semgrep** (scan for vulnerabilities)
7. **Performance problems** → **Chrome DevTools** (profile performance)
8. **Code examples needed** → **Ref** → **GitHub** (search code)
9. **Project context unclear** → **GitHub Issues** (check related issues)
10. **Testing approach unclear** → **Sequential Thinking** (plan test strategy)

**Never guess, assume, or hallucinate solutions when an MCP server can provide accurate information.**

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
3. Check GitHub Issues for existing issues
4. Find UI components with shadcn
5. Implement with continuous Ref lookups (never hallucinate)
6. Scan with Semgrep (security-critical code)
7. Test with Playwright (E2E user flows - broad validation)
8. Profile with Chrome DevTools (performance - deep analysis)
9. Update GitHub Issue with status and decisions
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

### Contact Management (CRUD Operations)
```
# Create a new contact
1. Navigate to /contacts
2. Click "Create Contact" button
3. Fill in required fields (name, email)
4. Add optional fields (phone, LinkedIn, company, industry, role, priority)
5. Submit form

# View and search contacts
1. Navigate to /contacts
2. Use search bar for text search (debounced)
3. Apply filters (priority, company, industry)
4. Sort by name, priority, or creation date
5. Load more contacts with pagination

# Edit a contact
1. Click on contact card to view details
2. Click "Edit" button
3. Modify fields
4. Save changes (with optimistic UI updates)

# Delete a contact
1. View contact detail page
2. Click "Delete" button
3. Confirm deletion in dialog
4. Contact removed with redirect to list

# GraphQL API Access
- Endpoint: http://localhost:4000/graphql
- Authentication: JWT token required (from Supabase session)
- Query: contact(id: String!): Contact
- Query: contacts(filters, pagination, sortBy, sortOrder): ContactConnection
- Mutation: createContact(input: CreateContactInput!): Contact
- Mutation: updateContact(id: String!, input: UpdateContactInput!): Contact
- Mutation: deleteContact(id: String!): Boolean
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
- **Complete tool lists** for all 7 MCP servers (75+ tools total)
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

### Testing
- **E2E Testing Guide**: `/context/e2e-testing-guide.md`
  - shadcn/ui component testing best practices
  - Common test failure patterns and solutions
  - Selector strategies for accessible components
  - Data loading and async handling
  - Debugging failing tests
  - Prevention strategies for UI refactors

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
