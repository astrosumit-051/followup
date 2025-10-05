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

### 1. **Ref** (`ref`) ⭐ PRIMARY DOCUMENTATION SOURCE
**Purpose:** Token-efficient documentation search to stop hallucinations with accurate, up-to-date technical documentation

**Tools Available:**
- `ref_search_documentation`: Search through 1000s of technical docs (APIs, frameworks, libraries, services)
- `ref_read_url`: Read full web page content with smart chunking
- `ref_search_web`: Fallback web search for broader queries

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
4. Combine with Exa for code examples from real projects

CRITICAL: Always use Ref instead of relying on memory for:
- API signatures and parameters
- Configuration options
- Framework-specific patterns
- Library methods and classes
```

**Example Prompts:**
```
"Search Ref for Stripe subscription creation API documentation"
"Find the latest Supabase auth configuration options"
"Look up Next.js 15 server actions best practices in the docs"
"Get the exact parameters for Figma's REST API comment endpoint"
"Search Vercel Edge Functions rate limits and configuration"
"How do I configure tRPC with Next.js App Router?"
"What are the Prisma schema syntax for relations?"
```

---

### 2. **Brave Search** (`brave-search`)
**Purpose:** Real-time web search for current information, documentation, and technical references

**Use Cases:**
- Finding latest library versions and API documentation
- Researching current best practices and design patterns
- Verifying compatibility between technologies
- Looking up error messages and solutions
- Finding code examples from real-world implementations

**When to Trigger:**
- User asks about "latest", "current", or "recent" information (but Ref can't answer)
- Need to verify framework versions or breaking changes beyond docs
- Looking for blog posts, tutorials, or community solutions
- Debugging issues that require Stack Overflow context
- Finding news, announcements, or release notes

**Note:** Prefer **Ref** for official documentation. Use Brave for broader web search, community content, and real-time information.

**Example Prompts:**
```
"Search for the latest Next.js 15 App Router authentication patterns"
"Find current React Server Components best practices"
"Look up TypeScript 5.4 new features and migration guide"
```

---

### 2. **Exa** (`exa`)
**Purpose:** Semantic search with code context, research capabilities, and deep technical search

**Tools Available:**
- `get_code_context_exa`: Search code snippets, examples, and documentation from GitHub repos
- `web_search_exa`: High-quality web search optimized for technical content
- `company_research`: Deep research on companies and their tech stacks
- `crawling`: Extract content from specific URLs
- `deep_researcher_start/check`: Launch in-depth research projects

**Use Cases:**
- Finding implementation examples from production codebases
- Understanding how open-source projects implement specific features
- Researching API usage patterns from real code
- Deep technical documentation retrieval
- Competitive analysis of similar products

**When to Trigger:**
- Need code examples from actual repositories
- Want to see how popular libraries implement features
- Researching architectural decisions
- Building features similar to existing products

**Example Prompts:**
```
"Use exa-code to find authentication implementations in Next.js SaaS projects"
"Search for Stripe integration examples with TypeScript and Next.js"
"Research how Vercel implements edge middleware patterns"
```

---

### 3. **Playwright** (`playwright`)
**Purpose:** Browser automation and end-to-end testing

**Capabilities:**
- Navigate web pages and interact with elements
- Take screenshots and compare visual states
- Generate test code from browser interactions
- Validate UI behavior and accessibility
- Extract content from web pages

**Use Cases:**
- Creating E2E tests for critical user flows
- Visual regression testing
- Automating form submissions and user interactions
- Testing responsive designs across viewports
- Validating accessibility tree structure
- Web scraping and data extraction

**When to Trigger:**
- User mentions "test", "e2e", "end-to-end", or "integration test"
- Need to validate multi-step user workflows
- Implementing visual testing or screenshot comparisons
- Automating browser-based tasks

**Example Prompts:**
```
"Generate Playwright tests for the user registration flow"
"Create a test that validates the shopping cart checkout process"
"Take screenshots of the dashboard at mobile and desktop sizes"
"Test that the login form shows proper validation errors"
```

---

### 4. **Semgrep** (`semgrep`)
**Purpose:** Static code analysis for security vulnerabilities and code quality

**Tools Available:**
- `security_check`: Scan code for security vulnerabilities
- `semgrep_scan`: Scan files with specific configurations
- `semgrep_scan_with_custom_rule`: Use custom security rules
- `get_abstract_syntax_tree`: Analyze code structure
- `supported_languages`: Check language support
- `semgrep_rule_schema`: Get rule writing documentation

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

### 5. **GitHub** (`github`)
**Purpose:** Repository management, PR automation, and CI/CD integration

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

### 6. **Sequential Thinking** (`sequential-thinking`)
**Purpose:** Structured, step-by-step problem-solving and complex reasoning

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

### 7. **Ref** (`ref`)
**Purpose:** Token-efficient documentation search to stop hallucinations with accurate, up-to-date technical documentation

**Tools Available:**
- `ref_search_documentation`: Search through 1000s of technical docs (APIs, frameworks, libraries, services)
- `ref_read_url`: Read full web page content with smart chunking
- `ref_search_web`: Fallback web search for broader queries

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
4. Combine with Exa for code examples from real projects
```

**Example Prompts:**
```
"Search Ref for Stripe subscription creation API documentation"
"Find the latest Supabase auth configuration options"
"Look up Next.js 15 server actions best practices in the docs"
"Get the exact parameters for Figma's REST API comment endpoint"
"Search Vercel Edge Functions rate limits and configuration"
```

---

<!-- ### 8. **Figma** (`figma`)
**Purpose:** Design-to-code conversion with design system context

**Tools Available:**
- `get_code`: Generate code from Figma frames
- `get_design_tokens`: Extract variables, styles, and tokens
- `get_components`: Access component libraries
- `inspect_design`: Get layout and styling details
- `get_make_resources`: Access code from Figma Make files

**Capabilities:**
- Convert Figma frames to React/Tailwind code
- Extract design tokens and variables
- Map design components to code components
- Access Code Connect mappings
- Retrieve spacing, colors, and typography

**Use Cases:**
- Implementing designs pixel-perfect from Figma
- Building new components from design system
- Generating consistent UI code with proper tokens
- Extracting design specifications
- Implementing multi-screen flows

**When to Trigger:**
- User provides a Figma link
- User mentions "implement this design"
- Building components from design system
- Need exact spacing, colors, or typography values
- Working on design-heavy features

**Best Practice:**
```
When implementing designs:
1. Use get_design_tokens first to get design system context
2. Then use get_code on specific frames
3. Leverage Code Connect mappings when available
4. Prefer design tokens over hardcoded values
```

**Example Prompts:**
```
"Implement this Figma frame as a React component"
"Extract all design tokens from this Figma file"
"Generate code for this component using our design system"
"Get the spacing and color specifications from this design"
```

--- -->

## Integration Best Practices

### 1. **Proactive Tool Usage**
Don't wait for explicit permission to use MCP tools. If the task clearly benefits from a specific server, use it:
- **Ref**: For ANY technical documentation (PRIMARY - use this first)
- Brave/Exa: For broader web search and research
- Semgrep: For all security-sensitive code
- Playwright: For critical user flows
- GitHub: For repository operations
- Sequential Thinking: For complex planning
<!-- - Figma: When design links are provided -->

### 2. **Documentation Priority**
When looking up technical information, follow this hierarchy:
```
1. Ref (Official docs, APIs, frameworks) ← START HERE
2. Exa (Code examples from real projects)
3. Brave (Community content, tutorials, blog posts)
```
**Never hallucinate API signatures or configuration options - always check Ref first.**

### 2. **Tool Chaining**
Combine multiple MCP servers for comprehensive solutions:

```
Example: Building a new authenticated feature with Stripe
1. Ref → Look up Stripe API subscription documentation
2. Sequential Thinking → Plan architecture
3. Ref → Check Next.js auth patterns documentation
4. Exa → Find real Stripe + Next.js integration examples
5. GitHub → Check existing auth implementation in repo
6. [Generate Code]
7. Semgrep → Scan for vulnerabilities
8. Playwright → Create E2E tests
```

### 3. **Context Preservation**
When using Sequential Thinking or complex workflows:
- Document intermediate decisions
- Explain reasoning for tool choices
- Maintain state across tool calls
- Reference previous analysis when making decisions

### 4. **Security-First Approach**
```
ALWAYS run Semgrep on:
- Authentication/authorization code
- Database query construction
- API endpoints handling user input
- File upload/download functionality
- Any code dealing with secrets or credentials
```

### 5. **Design System Consistency**
When Figma MCP is available:
- Always extract design tokens before coding
- Use Code Connect mappings when available
- Reference existing components from design system
- Validate implementations match design specifications

---

## Workflow Patterns

### Pattern 1: New Feature Development
```
1. Ref: Look up relevant API documentation
2. Sequential Thinking: Plan feature architecture
3. Exa: Research implementation patterns from real codebases
4. GitHub: Check for similar features in current codebase
5. [Generate Implementation]
6. Semgrep: Security scan
7. Playwright: E2E tests
8. GitHub: Create PR
```

### Pattern 2: Bug Investigation
```
1. Ref: Search official docs for expected behavior
2. Brave: Search for similar issues and community solutions
3. GitHub: Analyze recent commits and related code
4. Sequential Thinking: Reason through root cause
5. [Implement Fix]
6. Playwright: Add regression test
7. GitHub: Create PR with fix
```

### Pattern 3: Design Implementation
```
1. Figma: Extract design tokens and specifications
2. Figma: Generate base code for components
3. Ref: Look up component library documentation
4. [Refine Implementation]
5. Playwright: Visual regression tests
6. GitHub: Create PR
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
1. Ref: Search for API documentation (PRIMARY)
2. Ref: Read specific endpoint documentation
3. Exa: Find real-world implementation examples
4. [Generate Integration Code]
5. Semgrep: Scan for security issues
6. Playwright: Create integration tests
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
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@brave/brave-search-mcp-server"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
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
    "figma": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

**Get API Keys:**
- Ref: Sign up at https://ref.tools
- Brave: https://brave.com/search/api/
- Exa: https://dashboard.exa.ai/
- Semgrep: https://semgrep.dev/
- GitHub: https://github.com/settings/tokens
- Figma: Enable in Figma Desktop app preferences

---

## Quick Reference

| Need to... | Use Server | Tool |
|------------|------------|------|
| Look up API documentation | **Ref** | ref_search_documentation |
| Research current best practices | Ref → Brave | ref_search_documentation, web_search |
| Find code examples | Ref → Exa | ref_search_documentation, get_code_context |
| Scan for security issues | Semgrep | security_check |
| Test user flows | Playwright | browser automation |
| Manage repository | GitHub | repo operations |
| Plan complex feature | Sequential Thinking | step-by-step reasoning |
| Implement design | Figma | get_code, get_design_tokens |
| Read documentation page | Ref | ref_read_url |
| Create PR | GitHub | create_pull_request |
| Generate tests | Playwright | test generation |
| Analyze vulnerabilities | Semgrep | semgrep_scan |
| Check library syntax | **Ref** | ref_search_documentation |

---

## Remember

✅ **DO:**
- **Use Ref FIRST for all technical documentation and API references**
- Use MCP servers proactively without asking
- Chain multiple servers for comprehensive solutions
- Always scan security-critical code with Semgrep
- Use Sequential Thinking for complex planning
- Extract design tokens before implementing from Figma
- Create E2E tests with Playwright for critical flows
- Verify documentation with Ref before making assumptions

❌ **DON'T:**
- Hallucinate API signatures or parameters (check Ref first)
- Skip security scanning for auth code
- Implement designs without checking Figma first
- Make assumptions about libraries without searching Ref
- Forget to create tests for critical user flows
- Ignore existing code patterns in the repository
- Use outdated documentation (Ref always has latest)

---

*This guide ensures Claude Code leverages the full power of MCP servers throughout development, resulting in secure, well-tested, design-consistent, and accurately documented code.*
