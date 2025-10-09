# Claude Code MCP Server Integration Guide

## Purpose
This file instructs Claude Code to leverage specific MCP (Model Context Protocol) servers throughout the webapp development lifecycle. These servers provide specialized capabilities that enhance code generation, testing, security, design implementation, and problem-solving.

---

## Core Philosophy

**Always consider which MCP server best serves the current task.** Don't reinvent capabilities that MCP servers already provide. Use these tools proactively to:
- Gather current information
- Validate security
- Automate testing
- Access design context
- Structure complex problem-solving

---

## Available MCP Servers & When to Use Them

### 1. **Ref** (`ref`)
**Purpose:** Token-efficient documentation search to stop hallucinations with accurate, up-to-date technical documentation

**Tools Available:**
- `mcp__Ref__ref_search_documentation`: Search through 1000s of technical docs (APIs, frameworks, libraries, services)
- `mcp__Ref__ref_read_url`: Read full web page content with smart chunking

**Key Features:**
- **Token Efficiency**: Returns only the most relevant 200-5000 tokens instead of entire pages (e.g., Figma API is 80k tokens, Ref returns just the ~200 you need)
- **Smart Chunking**: Pre-chunks documentation to avoid context bloat
- **Session Awareness**: Never returns duplicate results in the same session
- **Deep Linking**: Provides exact documentation section links for verification
- **Documentation-Optimized**: Loads all code tabs, syntax examples, and interactive elements
- **Covers 1000s of Sources**: Public GitHub repos, official docs sites, and all major platforms/libraries

**Use Cases:**
- Looking up API parameters and methods
- Finding framework-specific patterns and best practices
- Checking library versions and breaking changes
- Understanding service configuration and setup
- Getting exact syntax for unfamiliar APIs
- Validating implementation approaches
- Reading README files and getting started guides

**When to Trigger:**
- Working with any external API, library, or framework
- User asks "how do I use X"
- Need to check API documentation
- Implementing features with unfamiliar tools
- Debugging API integration issues
- Before making assumptions about API behavior

**Why Ref Over General Search:**
```
Context Efficiency:
- Standard web fetch: 20k+ tokens (mostly irrelevant)
- Ref: 200-5000 tokens (highly relevant)
- Cost savings: ~$0.09 per step with Opus
- Less context = smarter model responses

Accuracy Benefits:
- Documentation-specific crawler
- Always up-to-date information
- Deep links to exact sections
- No hallucinated API signatures
```

**Best Practice:**
```
1. Use Ref FIRST before implementing any external API integration
2. Search for specific endpoints/methods, not general topics
3. Read returned URLs for detailed implementation examples
4. Use Brave Search for real-world code examples from production projects

CRITICAL: Always use Ref instead of relying on memory for:
- API signatures and parameters
- Configuration options
- Framework-specific patterns
- Library methods and classes
```

**Example Prompts:**
```
"Search Ref for Stripe subscription creation API documentation"
"Look up Next.js 15 server actions best practices in the docs"
"Get the exact parameters for Figma's REST API comment endpoint"
"Search Vercel Edge Functions rate limits and configuration"
"How do I configure tRPC with Next.js App Router?"
"What are the Prisma schema syntax for relations?"
```

---

### 2. **Linear** (`linear-server`)
**Purpose:** Issue tracking and project management integration with Linear's API

**Tools Available:**
- Issue Management: Create, update, delete, search issues
- Project Management: Create projects, get project info, associate issues
- Team Operations: Get team information, workflow states, labels
- Comments: Create and read issue comments (including threaded)
- Batch Operations: Bulk issue creation and deletion
- Relationships: Create parent/child issue hierarchies

**Key Features:**
- **Rich Text Support**: Proper handling of Linear's document content format
- **Batch Processing**: Parallel operations for better performance
- **Team Integration**: Access to workflow states and team configurations
- **Type Safety**: Full TypeScript support across all operations
- **API Key Auth**: Secure authentication with Personal API keys

**Use Cases:**
- Creating Linear issues from code TODOs or bug reports
- Tracking feature implementation progress
- Managing sprint planning and project workflows
- Linking code changes to Linear issues
- Automating issue status updates
- Searching and filtering issues by team, project, or state
- Creating issue hierarchies for epic tracking

**When to Trigger:**
- User mentions "issue", "Linear", "ticket", or "task"
- Creating work items from conversations or code analysis
- Need to track implementation progress
- Sprint planning or project management activities
- Linking development work to project tracking
- Searching for existing issues or projects
- Updating issue status or priority

**Best Practice:**
```
Use Linear for project management workflow:
1. Create issues for planned features from specs
2. Link commits/PRs to Linear issues
3. Update issue status as work progresses
4. Use batch operations for bulk updates
5. Maintain issue hierarchies for epics
```

**Example Prompts:**
```
"Create a Linear issue for implementing user authentication"
"Search for open issues in the frontend team"
"Update issue status to 'In Progress' for AUTH-123"
"Create a project for Q1 2025 roadmap items"
"Show me all high priority issues assigned to me"
"Create parent issue for email generation feature with subtasks"
```

---

### 3. **Playwright** (`playwright`)
**Purpose:** Broad browser automation and end-to-end testing (use for high-level E2E tests and workflow validation)

**Tools Available:**
- `mcp__playwright__browser_navigate`: Navigate to a URL
- `mcp__playwright__browser_navigate_back`: Go back to previous page
- `mcp__playwright__browser_click`: Click on elements
- `mcp__playwright__browser_type`: Type text into input fields
- `mcp__playwright__browser_press_key`: Press keyboard keys
- `mcp__playwright__browser_hover`: Hover over elements
- `mcp__playwright__browser_select_option`: Select dropdown options
- `mcp__playwright__browser_drag`: Drag and drop elements
- `mcp__playwright__browser_fill_form`: Fill multiple form fields
- `mcp__playwright__browser_take_screenshot`: Capture screenshots
- `mcp__playwright__browser_snapshot`: Get accessibility tree snapshot
- `mcp__playwright__browser_console_messages`: Get console logs
- `mcp__playwright__browser_evaluate`: Execute JavaScript
- `mcp__playwright__browser_wait_for`: Wait for conditions
- `mcp__playwright__browser_resize`: Resize browser window
- `mcp__playwright__browser_close`: Close browser
- `mcp__playwright__browser_tabs`: Manage browser tabs
- `mcp__playwright__browser_handle_dialog`: Handle alerts/dialogs
- `mcp__playwright__browser_file_upload`: Upload files
- `mcp__playwright__browser_network_requests`: Monitor network activity

**Capabilities:**
- Navigate web pages and interact with elements
- Take screenshots and compare visual states
- Generate test code from browser interactions
- Validate UI behavior and accessibility
- Extract content from web pages
- **Broad diagnosis**: High-level workflow validation

**Use Cases:**
- Creating E2E tests for critical user flows
- Visual regression testing
- Automating form submissions and user interactions
- Testing responsive designs across viewports
- Validating accessibility tree structure
- Web scraping and data extraction
- High-level feature verification before deep performance analysis

**When to Trigger:**
- User mentions "test", "e2e", "end-to-end", or "integration test"
- Need to validate multi-step user workflows
- Implementing visual testing or screenshot comparisons
- Automating browser-based tasks
- Need broad user flow validation (use before Chrome DevTools for detailed profiling)

**Example Prompts:**
```
"Generate Playwright tests for the user registration flow"
"Create a test that validates the shopping cart checkout process"
"Take screenshots of the dashboard at mobile and desktop sizes"
"Test that the login form shows proper validation errors"
"Verify the contact creation workflow works end-to-end"
```

---

### 4. **Chrome DevTools** (`chrome-devtools`)
**Purpose:** Deep Chrome-specific diagnostics and performance analysis (use for detailed debugging)

**Complementary Relationship with Playwright:**
```
Playwright = Broad Diagnosis (E2E tests, user flows, visual testing)
Chrome DevTools = Deep Diagnosis (performance profiling, network analysis, precise debugging)

Use Together:
1. Playwright: Validate feature works end-to-end
2. Chrome DevTools: Profile performance, analyze Core Web Vitals, inspect network requests
```

**Tools Available:**

**Performance Tools:**
- `mcp__chrome-devtools__performance_analyze_insight`: Analyze performance traces for Core Web Vitals
- `mcp__chrome-devtools__performance_start_trace`: Start recording performance trace
- `mcp__chrome-devtools__performance_stop_trace`: Stop recording and get trace data

**Input Automation:**
- `mcp__chrome-devtools__click`: Click on elements (selector-driven)
- `mcp__chrome-devtools__drag`: Drag and drop elements
- `mcp__chrome-devtools__fill`: Fill input fields
- `mcp__chrome-devtools__fill_form`: Fill multiple form fields
- `mcp__chrome-devtools__handle_dialog`: Handle browser dialogs
- `mcp__chrome-devtools__hover`: Hover over elements
- `mcp__chrome-devtools__upload_file`: Upload files

**Navigation:**
- `mcp__chrome-devtools__close_page`: Close current page
- `mcp__chrome-devtools__list_pages`: List all open pages
- `mcp__chrome-devtools__navigate_page`: Navigate to URL
- `mcp__chrome-devtools__navigate_page_history`: Navigate history (back/forward)
- `mcp__chrome-devtools__new_page`: Open new page
- `mcp__chrome-devtools__select_page`: Switch to specific page
- `mcp__chrome-devtools__wait_for`: Wait for conditions

**Emulation:**
- `mcp__chrome-devtools__emulate_cpu`: Throttle CPU to simulate slow devices
- `mcp__chrome-devtools__emulate_network`: Throttle network (3G, 4G, offline)
- `mcp__chrome-devtools__resize_page`: Resize viewport

**Network:**
- `mcp__chrome-devtools__get_network_request`: Get specific network request details
- `mcp__chrome-devtools__list_network_requests`: List all network requests

**Debugging:**
- `mcp__chrome-devtools__evaluate_script`: Execute JavaScript in page context
- `mcp__chrome-devtools__list_console_messages`: Get console logs/errors
- `mcp__chrome-devtools__take_screenshot`: Capture screenshots
- `mcp__chrome-devtools__take_snapshot`: Get accessibility tree snapshot

**Key Features:**
- **Performance Profiling**: "Lighthouse-style" Core Web Vitals analysis in real-time
- **Device Emulation**: Precise CPU and network throttling
- **Interactive Debugging**: Iterative performance improvement cycles
- **Network Inspection**: Detailed request/response analysis
- **Chrome-Specific**: Deep integration with Chrome DevTools Protocol

**Use Cases:**
- **Performance optimization**: Analyzing LCP, CLS, FID, TTFB
- **Slow device testing**: Emulating low-end devices with CPU throttling
- **Network debugging**: Testing on 3G/4G, analyzing request waterfalls
- **Core Web Vitals**: Iterative performance improvements
- **Detailed network inspection**: Analyzing specific API calls
- **Interactive debugging**: Step-by-step performance profiling

**When to Trigger:**
- User mentions "performance", "slow", "Core Web Vitals", or "optimization"
- Need to profile page load performance
- Debugging network requests or API calls
- Testing on slow networks or devices
- Need detailed Chrome DevTools diagnostics
- Analyzing rendering performance
- After Playwright tests pass but performance needs improvement

**Best Practice:**
```
Complementary Usage Pattern:
1. Playwright: Verify feature works (E2E tests)
2. Chrome DevTools: Profile and optimize (performance analysis)

Example Workflow:
1. Use Playwright to test checkout flow works
2. Use Chrome DevTools to profile checkout performance
3. Emulate slow 3G network with Chrome DevTools
4. Analyze Core Web Vitals with Chrome DevTools
5. Optimize based on insights
6. Re-run Playwright tests to verify functionality still works
```

**Example Prompts:**
```
"Profile the dashboard page load performance with Chrome DevTools"
"Analyze Core Web Vitals for the contact list page"
"Test the email composition flow on a slow 3G network"
"Emulate low-end device with 4x CPU slowdown and measure performance"
"Inspect the network request for the contact creation API call"
"Start performance trace, navigate to dashboard, stop trace and analyze"
"Check console errors when submitting the email form"
```

**Selector Strategy:**
Use `take_snapshot` to get accessibility tree with element identifiers:
```
1. Navigate to page
2. take_snapshot to get element refs
3. Use refs in click, fill, hover operations
```

---

### 5. **Semgrep** (`semgrep`)
**Purpose:** Static code analysis for security vulnerabilities and code quality

**Tools Available:**
- `mcp__semgrep__semgrep_scan`: Scan local code files for vulnerabilities
- `mcp__semgrep__semgrep_scan_with_custom_rule`: Scan with custom Semgrep rules
- `mcp__semgrep__semgrep_scan_supply_chain`: Scan for third-party vulnerabilities
- `mcp__semgrep__semgrep_findings`: Fetch findings from Semgrep AppSec Platform
- `mcp__semgrep__get_abstract_syntax_tree`: Get AST for code analysis
- `mcp__semgrep__get_supported_languages`: List supported programming languages
- `mcp__semgrep__semgrep_rule_schema`: Get schema for writing Semgrep rules

**Use Cases:**
- Scanning generated code for security vulnerabilities
- Detecting SQL injection, XSS, and CSRF vulnerabilities
- Finding hardcoded secrets and credentials
- Identifying insecure dependencies
- Enforcing code quality standards
- Custom security rule creation

**When to Trigger:**
- After generating authentication/authorization code
- When handling user input or database queries
- Before committing code to version control
- User mentions "security", "vulnerability", or "scan"
- Working with sensitive data (passwords, API keys, PII)

**Best Practice:**
```
Always scan security-critical code with Semgrep before finalizing:
- Authentication & authorization logic
- Database query construction
- API endpoint handlers
- File upload functionality
- Environment variable usage
```

**Example Prompts:**
```
"Scan the authentication module for security vulnerabilities"
"Check this API endpoint for SQL injection risks"
"Create a custom Semgrep rule to detect missing input validation"
"Analyze this code for hardcoded secrets"
```

---

### 6. **GitHub** (`github`)
**Purpose:** Repository management, PR automation, and CI/CD integration

**Tools Available:**
- `mcp__github__search_repositories`: Search for repositories
- `mcp__github__search_code`: Search code across GitHub
- `mcp__github__search_issues`: Search issues
- `mcp__github__search_pull_requests`: Search pull requests
- `mcp__github__search_users`: Find GitHub users
- `mcp__github__search_orgs`: Find organizations
- `mcp__github__get_file_contents`: Read file/directory contents
- `mcp__github__create_or_update_file`: Create or update files
- `mcp__github__delete_file`: Delete files
- `mcp__github__push_files`: Push multiple files in one commit
- `mcp__github__create_repository`: Create new repository
- `mcp__github__get_issue`: Get issue details
- `mcp__github__create_issue`: Create new issue
- `mcp__github__update_issue`: Update existing issue
- `mcp__github__add_issue_comment`: Comment on issues
- `mcp__github__list_issues`: List repository issues
- `mcp__github__create_pull_request`: Create new PR
- `mcp__github__update_pull_request`: Update PR details
- `mcp__github__get_pull_request`: Get PR details
- `mcp__github__list_pull_requests`: List repository PRs
- `mcp__github__merge_pull_request`: Merge a PR
- `mcp__github__create_branch`: Create new branch
- `mcp__github__list_branches`: List repository branches
- `mcp__github__list_commits`: Get commit history
- `mcp__github__get_commit`: Get commit details
- `mcp__github__list_workflows`: List GitHub Actions workflows
- `mcp__github__list_workflow_runs`: List workflow run history
- `mcp__github__get_workflow_run`: Get workflow run details
- `mcp__github__list_workflow_jobs`: List jobs in a workflow run
- `mcp__github__get_job_logs`: Get job logs
- `mcp__github__fork_repository`: Fork a repository
- `mcp__github__create_gist`: Create GitHub gist
- And 50+ more GitHub API operations...

**Capabilities:**
- Browse and search code across repositories
- Create, update, and manage issues and pull requests
- Analyze commits and repository structure
- Monitor GitHub Actions workflows
- Manage releases and deployments
- Access discussions and team activity

**Use Cases:**
- Creating PRs with generated code changes
- Analyzing repository structure and dependencies
- Automating issue creation from bugs
- Checking CI/CD workflow status
- Code search across organization repos
- Managing project boards and milestones

**When to Trigger:**
- User wants to create a pull request
- Need to understand existing codebase structure
- Implementing features from GitHub issues
- Checking build/deployment status
- Need to reference existing code patterns in the repo

**Example Prompts:**
```
"Create a PR with these authentication changes"
"Search the repo for similar implementations of this feature"
"Check the latest CI/CD run status for the main branch"
"Analyze the issue ENG-4521 and implement the requested feature"
```

---

### 7. **Sequential Thinking** (`sequential-thinking`)
**Purpose:** Structured, step-by-step problem-solving and complex reasoning

**Tools Available:**
- `mcp__sequential-thinking__sequentialthinking`: Execute structured multi-step reasoning with the ability to revise, branch, and adjust thinking dynamically

**Capabilities:**
- Break down complex problems into manageable steps
- Revise and refine thoughts as understanding deepens
- Branch into alternative solution paths
- Dynamically adjust reasoning depth
- Maintain context across multi-step processes

**Use Cases:**
- Architecting complex features or systems
- Planning database schema migrations
- Debugging multi-layered issues
- Refactoring large codebases
- Designing API architectures
- Performance optimization strategies

**When to Trigger:**
- User presents a complex, multi-faceted problem
- Need to explore trade-offs between solutions
- Planning major architectural changes
- Debugging issues with multiple potential causes
- User mentions "plan", "architect", or "design"

**Best Practice:**
```
Use sequential thinking for problems that require:
1. Multiple interconnected decisions
2. Consideration of trade-offs
3. Step-by-step validation
4. Alternative approach exploration
```

**Example Prompts:**
```
"Use sequential thinking to plan the database migration strategy"
"Break down the architecture for implementing real-time notifications"
"Plan the refactoring approach for the authentication system"
"Analyze the root cause of this performance issue step-by-step"
```

---

### 8. **PostgreSQL** (`postgres`)
**Purpose:** Direct read-only database query execution for debugging, analysis, and schema verification

**Tools Available:**
- `mcp__postgres__query`: Execute read-only SQL queries on the PostgreSQL database

**Key Features:**
- **Read-Only Safety**: Cannot execute INSERT, UPDATE, DELETE, or DROP operations
- **Direct Database Access**: Query production or development databases without ORM layer
- **Schema Inspection**: Analyze table structures, indexes, and constraints
- **Performance Analysis**: Run EXPLAIN queries to diagnose slow queries
- **Data Validation**: Verify data integrity and relationships

**Use Cases:**
- Debugging database schema issues
- Verifying Prisma migrations applied correctly
- Analyzing query performance with EXPLAIN
- Checking data integrity and foreign key relationships
- Testing complex JOIN queries before implementing in code
- Monitoring table sizes and index usage
- Validating database constraints

**When to Trigger:**
- After running Prisma migrations (verify schema changes)
- When debugging data-related issues
- Need to analyze query performance
- Validating relationships between tables
- Checking for orphaned records or data inconsistencies
- Before implementing complex database queries

**Security & Safety:**
```
CRITICAL RULES:
- This tool is READ-ONLY - use Prisma for data modifications
- Never run destructive queries (DROP, TRUNCATE, DELETE)
- Always use LIMIT for potentially large result sets
- Test queries on development database first
- No write operations - Prisma handles all data changes
```

**Best Practice:**
```
1. Use for inspection and analysis only
2. Always include LIMIT clause for data queries
3. Use EXPLAIN ANALYZE for performance debugging
4. Verify schema after migrations
5. Check indexes on frequently queried columns
6. Use for debugging, not for application logic
```

**Example Prompts:**
```
"Check the contacts table schema in PostgreSQL"
"Verify email conversation history is storing correctly"
"Analyze performance of slow contact search query with EXPLAIN"
"Count total contacts by priority level"
"Check for orphaned records in emails table"
"Verify indexes exist on user_id columns"
"Show table sizes in the database"
```

---

### 9. **shadcn** (`shadcn`)
**Purpose:** UI component registry for browsing, searching, and installing shadcn/ui components and blocks

**Tools Available:**
- `mcp__shadcn__get_project_registries`: Get configured registry names from components.json
- `mcp__shadcn__list_items_in_registries`: List all components, blocks, templates from registries
- `mcp__shadcn__search_items_in_registries`: Fuzzy search for components by name/description
- `mcp__shadcn__view_items_in_registries`: View detailed component information and files
- `mcp__shadcn__get_item_examples_from_registries`: Find usage examples and demos with code
- `mcp__shadcn__get_add_command_for_items`: Get CLI command to install components
- `mcp__shadcn__get_audit_checklist`: Post-installation verification checklist

**Key Features:**
- **Registry Support**: Works with shadcn/ui, third-party, and private registries
- **Natural Language**: Install components using conversational prompts
- **Fuzzy Search**: Find components even with approximate names
- **Example Code**: Access complete implementation examples with dependencies
- **Namespace Support**: Work with multiple registries using @namespace syntax
- **Authentication**: Support for private registries with token-based auth

**Use Cases:**
- Discovering and browsing available UI components
- Installing shadcn/ui components to your project
- Finding component usage examples and demos
- Building consistent UI with pre-built components
- Integrating design system components
- Searching across multiple component registries
- Accessing private company component libraries
- Getting installation commands for components

**When to Trigger:**
- User mentions "shadcn", "component", "UI", or "install"
- Building user interface features
- Need pre-built UI components
- Implementing design patterns
- User asks "show me components" or "add component"
- Creating forms, dialogs, cards, or common UI elements
- Need to find component examples

**Best Practice:**
```
Component discovery workflow:
1. Search for components by functionality (e.g., "login form")
2. View component details to understand structure
3. Check examples to see usage patterns
4. Get add command for installation
5. Use audit checklist after installation
6. Integrate component following examples
```

**Example Prompts:**
```
"Show me all available components in the shadcn registry"
"Add the button, dialog and card components to my project"
"Find me a login form from the shadcn registry"
"Search for table components with pagination"
"Get usage examples for the accordion component"
"Install @acme/auth-form from the company registry"
"Build a landing page using hero and features components"
"What's the command to add the data-table component?"
```

---

## Integration Best Practices

### 1. **Proactive Tool Usage**
Don't wait for explicit permission to use MCP tools. If the task clearly benefits from a specific server, use it:
- Ref: For ANY technical documentation (PRIMARY - use this first)
- Linear: For issue tracking and project management
- Playwright: For broad E2E testing and workflow validation
- Chrome DevTools: For deep performance profiling and debugging
- Semgrep: For all security-sensitive code
- GitHub: For repository operations
- Sequential Thinking: For complex planning
- PostgreSQL: For database debugging and verification
- shadcn: For UI component discovery and installation

**CRITICAL: When Stuck or Encountering Problems**

If you encounter ANY of the following situations, you MUST use the appropriate MCP server BEFORE attempting to proceed:

1. **Stuck on implementation** → Use **Sequential Thinking** to break down the problem
2. **Unsure about API usage** → Use **Ref** to look up exact documentation
3. **Debugging errors** → Use **Ref** for error messages + **Sequential Thinking** for root cause analysis
4. **Need UI component** → Use **shadcn** to find existing components
5. **Database issues** → Use **PostgreSQL** to inspect actual schema/data
6. **Security concerns** → Use **Semgrep** to scan for vulnerabilities
7. **Performance problems** → Use **Chrome DevTools** to profile
8. **Code examples needed** → Use **Ref** → **GitHub** search
9. **Project context unclear** → Use **Linear** to check related issues
10. **Testing approach unclear** → Use **Sequential Thinking** to plan test strategy

**Never guess, assume, or hallucinate solutions when an MCP server can provide accurate information.**

### 2. **Documentation Priority**
When looking up technical information, follow this hierarchy:
```
1. Ref (Official docs, APIs, frameworks) ← START HERE
2. shadcn (UI component documentation and examples)
3. Linear (Project specs and issue tracking)
```
**Never hallucinate API signatures or configuration options - always check Ref first.**

### 3. **Tool Chaining**
Combine multiple MCP servers for comprehensive solutions:

```
Example: Building a new authenticated feature with Stripe
1. Linear → Check for existing auth issues and tasks
2. Ref → Look up Stripe API subscription documentation
3. Sequential Thinking → Plan architecture
4. Ref → Check Next.js auth patterns documentation
5. shadcn → Find auth form components
6. GitHub → Check existing auth implementation in repo
7. [Generate Code]
8. Semgrep → Scan for vulnerabilities
9. PostgreSQL → Verify database schema
10. Playwright → Create E2E tests
11. Chrome DevTools → Profile performance and Core Web Vitals
12. Linear → Update issue status and document decisions
```

### 4. **Context Preservation**
When using Sequential Thinking or complex workflows:
- Document intermediate decisions
- Explain reasoning for tool choices
- Maintain state across tool calls
- Reference previous analysis when making decisions

### 5. **Security & Performance-First Approach**
```
ALWAYS run Semgrep on:
- Authentication/authorization code
- Database query construction
- API endpoints handling user input
- File upload/download functionality
- Any code dealing with secrets or credentials

ALWAYS verify with PostgreSQL after:
- Running database migrations
- Schema changes
- Adding indexes or constraints

ALWAYS profile with Chrome DevTools for:
- Performance-critical pages (dashboards, lists)
- After implementing new features
- Core Web Vitals optimization
- Slow device/network testing
```

### 6. **Design System Consistency**
When Figma MCP is available:
- Always extract design tokens before coding
- Use Code Connect mappings when available
- Reference existing components from design system
- Validate implementations match design specifications

### 7. **Database Operations**
```
For database work:
1. Use Prisma for schema definitions and migrations
2. Use PostgreSQL MCP for verification and debugging
3. Never use PostgreSQL MCP for writes - use Prisma only
```

---

## Workflow Patterns

### Pattern 1: New Feature Development
```
1. Linear: Check for existing issues and feature specs
2. Ref: Look up relevant API documentation
3. Sequential Thinking: Plan feature architecture
4. shadcn: Find UI components for the feature
5. GitHub: Check for similar features in current codebase
6. [Generate Implementation]
7. PostgreSQL: Verify database schema if DB changes
8. Semgrep: Security scan
9. Playwright: E2E tests (broad validation)
10. Chrome DevTools: Performance profiling (deep analysis)
11. Linear: Update issue status and document decisions
12. GitHub: Create PR and link to Linear issue
```

### Pattern 2: Bug Investigation & Performance Debugging
```
1. Linear: Search for existing bug reports or related issues
2. Chrome DevTools: Profile page performance and inspect network
3. PostgreSQL: Check database state if data-related
4. Ref: Search official docs for expected behavior
5. GitHub: Analyze recent commits and related code
6. Sequential Thinking: Reason through root cause
7. [Implement Fix]
8. Playwright: Add regression test
9. Chrome DevTools: Verify performance improvements
10. Linear: Update bug issue with root cause and fix details
11. GitHub: Create PR with fix and link to Linear issue
```

### Pattern 3: UI Component Implementation
```
1. shadcn: Search for existing components that match design
2. shadcn: View component examples and usage patterns
3. Ref: Look up component library documentation
4. shadcn: Install required components
5. [Customize and Integrate Components]
6. Playwright: Visual regression tests
7. Chrome DevTools: Test responsive design at various viewports
8. Chrome DevTools: Profile rendering performance
9. GitHub: Create PR
```

### Pattern 4: Security Review
```
1. Semgrep: Scan codebase for vulnerabilities
2. Sequential Thinking: Analyze findings and prioritize
3. Ref: Research secure implementation patterns
4. [Implement Fixes]
5. Semgrep: Verify fixes resolved issues
6. GitHub: Document security improvements
```

### Pattern 5: API Integration
```
1. Linear: Check for existing API integration issues
2. Ref: Search for API documentation (PRIMARY)
3. Ref: Read specific endpoint documentation
4. Sequential Thinking: Plan integration architecture
5. [Generate Integration Code]
6. Semgrep: Scan for security issues
7. Playwright: Create integration tests
8. Linear: Document API integration details and close issue
```

### Pattern 6: Database Migration
```
1. Linear: Check migration issues and plans
2. Sequential Thinking: Plan migration strategy
3. Ref: Look up Prisma migration documentation
4. [Generate Migration]
5. PostgreSQL: Verify schema changes in development
6. Semgrep: Scan migration code for security issues
7. Playwright: Test affected features after migration
8. PostgreSQL: Verify production schema after deployment
9. Linear: Update migration issue with completion details
```

---

## Environment Configuration

Ensure these MCP servers are configured in `.claude.json`:

```json
{
  "mcpServers": {
    "ref": {
      "type": "http",
      "url": "https://api.ref.tools/mcp?apiKey=${REF_API_KEY}"
    },
    "linear-server": {
      "type": "sse",
      "url": "https://mcp.linear.app/sse",
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    },
    "semgrep": {
      "command": "uvx",
      "args": ["semgrep-mcp"],
      "env": {
        "SEMGREP_APP_TOKEN": "${SEMGREP_APP_TOKEN}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"]
    },
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@latest", "mcp"]
    }
  }
}
```

**Get API Keys:**
- Ref: Sign up at https://ref.tools
- Linear: Get Personal API key from Linear Settings → Security & access
- Semgrep: https://semgrep.dev/
- GitHub: https://github.com/settings/tokens
- PostgreSQL: Use connection string from your database provider
- shadcn: No API key needed (uses project's components.json)

---

## Quick Reference

| Need to... | Use Server | Tool |
|------------|------------|------|
| Look up API documentation | **Ref** | mcp__Ref__ref_search_documentation |
| Research current best practices | Ref | mcp__Ref__ref_search_documentation |
| Find code examples | Ref → GitHub | mcp__Ref__ref_search_documentation, mcp__github__search_code |
| Find UI components | shadcn | mcp__shadcn__search_items_in_registries |
| Install UI components | shadcn | mcp__shadcn__get_add_command_for_items |
| Scan for security issues | Semgrep | mcp__semgrep__semgrep_scan |
| Test user flows (broad) | Playwright | mcp__playwright__browser_* |
| Profile performance (deep) | Chrome DevTools | mcp__chrome-devtools__performance_* |
| Analyze Core Web Vitals | Chrome DevTools | mcp__chrome-devtools__performance_analyze_insight |
| Test slow network/device | Chrome DevTools | mcp__chrome-devtools__emulate_* |
| Debug network requests | Chrome DevTools | mcp__chrome-devtools__list_network_requests |
| Manage repository | GitHub | mcp__github__* |
| Track issues/tasks | Linear | mcp__linear__create_issue, mcp__linear__search_issues |
| Update project status | Linear | mcp__linear__update_issue |
| Plan complex feature | Sequential Thinking | mcp__sequential-thinking__sequentialthinking |
| Read documentation page | Ref | mcp__Ref__ref_read_url |
| Create PR | GitHub | mcp__github__create_pull_request |
| Generate tests | Playwright | mcp__playwright__browser_snapshot |
| Analyze vulnerabilities | Semgrep | mcp__semgrep__semgrep_scan |
| Check library syntax | **Ref** | mcp__Ref__ref_search_documentation |
| Query database | PostgreSQL | mcp__postgres__query |
| Browse components | shadcn | mcp__shadcn__list_items_in_registries |
| View component details | shadcn | mcp__shadcn__view_items_in_registries |

---

## Remember

✅ **DO:**
- **Use Ref FIRST for all technical documentation and API references**
- Use MCP servers proactively without asking
- Chain multiple servers for comprehensive solutions
- Always scan security-critical code with Semgrep
- Use Sequential Thinking for complex planning
- Use shadcn to find and install UI components before building from scratch
- Create E2E tests with Playwright for critical flows (broad validation)
- Profile with Chrome DevTools for performance optimization (deep analysis)
- Use Playwright + Chrome DevTools together for comprehensive testing
- Track work with Linear issues and link to PRs
- Verify documentation with Ref before making assumptions

❌ **DON'T:**
- Hallucinate API signatures or parameters (check Ref first)
- Skip security scanning for auth code
- Build custom UI components before checking shadcn registry
- Make assumptions about libraries without searching Ref
- Forget to create tests for critical user flows
- Ignore existing code patterns in the repository
- Use outdated documentation (Ref always has latest)
- Skip performance profiling for user-facing features
- Forget to link Linear issues to PRs

---

*This guide ensures Claude Code leverages the full power of MCP servers throughout development, resulting in secure, well-tested, design-consistent, and accurately documented code.*
