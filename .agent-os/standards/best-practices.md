# Web Application Development Best Practices

> **Context for Claude:** This document defines the mandatory best practices and development philosophies for building our web application. Use this as the authoritative guide for all coding, architectural, and operational decisions.

---

## 1. Foundational Philosophies

### 1.1 Core Coding Principles

**KISS (Keep It Simple, Stupid)**
- Prioritize simplicity above all
- Avoid unnecessary complexity and over-engineering
- The simplest solution that meets current requirements is always the default choice

**DRY (Don't Repeat Yourself)**
- Every piece of logic must have a single, unambiguous representation
- Abstract and centralize repeated logic into reusable components
- Eliminate code duplication

**YAGNI (You Ain't Gonna Need It)**
- Implement functionality only when explicitly required by current specifications
- Do not build features based on speculation about future needs
- Resist the urge to add "nice to have" features

### 1.2 SOLID Principles

**S - Single Responsibility Principle (SRP)**
- A class must have only one reason to change
- Each class should have a single, well-defined responsibility

**O - Open/Closed Principle (OCP)**
- Software entities must be open for extension but closed for modification
- Add new functionality through new code, not by altering existing tested code

**L - Liskov Substitution Principle (LSP)**
- Subclasses must be substitutable for their base classes
- Substitution should not alter program correctness

**I - Interface Segregation Principle (ISP)**
- Clients should not depend on interfaces they don't use
- Prefer many small, client-specific interfaces over one large general-purpose interface

**D - Dependency Inversion Principle (DIP)**
- High-level modules should not depend on low-level modules
- Both should depend on abstractions
- Abstractions should not depend on details

### 1.3 Test-Driven Development (TDD)

All development must follow the TDD methodology using the **Red-Green-Refactor** cycle:

1. **Red:** Write a small, failing automated test for a single piece of functionality
2. **Green:** Write the minimum production code required to make the test pass
3. **Refactor:** Clean up and improve code structure while ensuring all tests continue to pass

---

## 2. Architectural Strategy

### 2.1 Architectural Style

**Default Architecture: Modular Monolith**

- Optimizes for initial development speed and operational simplicity
- Preserves long-term flexibility with clear evolutionary path to microservices
- Structure the application into well-defined, loosely-coupled modules organized around business capabilities
- Modules must communicate only through explicit, public interfaces
- **Strictly forbidden:** Direct access to another module's internal implementation or database

### 2.2 Architectural Patterns

**API Gateway**
- Single entry point for all client requests
- Centralizes cross-cutting concerns: authentication, rate limiting, caching
- Decouples clients from internal architecture

**Event-Driven Architecture (EDA)**
- Use for asynchronous communication between modules
- Promotes loose coupling, resilience, and scalability

### 2.3 Architectural Governance

**Architecture Decision Records (ADRs)**

Store all architecturally significant decisions as Markdown files in source control.

Standard ADR template:
- **Title:** Short, descriptive name for the decision
- **Status:** Proposed, Accepted, Deprecated, or Superseded
- **Context:** The problem, constraints, and forces driving the decision
- **Decision:** Clear statement of the chosen solution
- **Consequences:** Positive and negative outcomes of the decision

---

## 3. Security Framework

### 3.1 Security Model: Zero Trust

**Guiding Principle:** "Never trust, always verify"

**Three Pillars:**
1. **Assume Threat:** Treat all traffic as a threat; deny access by default
2. **Enforce Least Privilege:** Grant the absolute minimum permissions necessary
3. **Monitor Continuously:** Log, monitor, and analyze all activity in real-time

### 3.2 Authentication & Authorization

**Standard: OAuth 2.0**

- **User-Facing Apps:** Authorization Code Grant with PKCE (web and mobile)
- **Service-to-Service:** Client Credentials Grant (machine-to-machine)

### 3.3 Data Protection

**Encryption in Transit**
- Use TLS 1.2 or higher for all network communication
- Prioritize strong, modern cipher suites (e.g., AES-256-GCM)

**Encryption at Rest**
- All persistent data must be encrypted using AES-256

**Key Management**
- Use a dedicated Key Management Service (KMS)
- **Never** store keys in source code or configuration files

### 3.4 Application Defenses

- **Rate Limiting:** Protect all public-facing API endpoints against DoS and brute-force attacks
- **OWASP Secure Coding Practices:** Adhere strictly to OWASP guidelines
- **Input Validation:** Rigorously validate and sanitize all external input to prevent injection attacks
- **Secure Configuration:** Harden all application stack components; change all default credentials
- **Dependency Scanning:** Integrate Software Composition Analysis (SCA) into CI/CD pipeline

---

## 4. Development Workflow

### 4.1 Version Control: GitHub Flow

**Workflow:**
1. The `main` branch must always be deployable
2. Create a new descriptive branch from `main` for any new work
3. Open a pull request when work is ready for review
4. Merge into `main` only after review, approval, and all automated checks pass
5. Deploy `main` to production immediately after merge

### 4.2 Commit Messages: Conventional Commits

**Format:** `<type>[optional scope]: <description>`

**Breaking Changes:** Append `!` to type/scope (e.g., `feat(api)!:`) or add `BREAKING CHANGE:` footer

**Common Types:**

| Type | Description | SemVer Bump |
|------|-------------|-------------|
| `feat` | New feature | Minor |
| `fix` | Bug fix | Patch |
| `BREAKING CHANGE` | Non-backward-compatible change | Major |
| `docs` | Documentation only | None |
| `refactor` | Code restructuring, no functional change | None |
| `test` | Adding or correcting tests | None |
| `chore` | Routine maintenance, build changes | None |

### 4.3 API Design: API First Approach

**Specification: OpenAPI 3.0**

**Workflow:**
1. **Design:** Define the API contract in an OpenAPI file (YAML or JSON)
2. **Review:** Submit the OpenAPI file for peer review
3. **Generate:** Auto-generate server stubs, client SDKs, and documentation from the spec
4. **Implement:** Write business logic within the generated server stubs

---

## 5. Quality Assurance

### 5.1 Testing Strategy: Test Automation Pyramid

**Level 1: Unit Tests (Vast Majority)**
- Test single units (functions, classes) in isolation
- Must be fast and reliable
- Use test doubles for external dependencies

**Level 2: Integration Tests (Some)**
- Verify interactions between components (service-to-database, API-to-API)
- Use real dependencies

**Level 3: End-to-End Tests (Very Few)**
- Validate entire user workflows through the UI
- Reserve for critical user journeys only (slow and brittle)

### 5.2 TDD Implementation Rules

- **Small, Focused Tests:** Each test verifies a single behavior
- **Readable Tests:** Tests are living documentation; use descriptive names and consistent structure (Arrange-Act-Assert)
- **Independent & Repeatable:** Tests must be self-contained and order-independent
- **Test Behavior, Not Implementation:** Verify public contracts, not internal details
- **Run Continuously:** Entire test suite runs automatically in CI pipeline on every commit

### 5.3 Non-Functional Testing

**Performance Testing**
- Integrate into CI/CD pipeline
- Types: Load tests (expected usage), stress tests (breaking point), spike tests (sudden surges)
- Must be conducted in production-like environment

**Security Testing ("Shift-Left")**
- **SAST (Static Analysis):** Scan source code for vulnerability patterns
- **DAST (Dynamic Analysis):** Test running application for vulnerabilities
- **SCA (Software Composition Analysis):** Scan third-party dependencies for known vulnerabilities

---

## 6. Deployment and Operations

### 6.1 CI/CD Pipeline

**Automation:** The entire path to production must be automated

**Standard Stages:**
1. **Source:** Triggered on code push
2. **Build:** Compile code and package into immutable artifact (e.g., Docker image)
3. **Test:** Run all automated tests (unit, integration, SAST, DAST, SCA) — failures stop the pipeline
4. **Deploy:** Deploy artifact to environments (staging, production)

### 6.2 Safe Deployment Patterns

**Decouple Deploy from Release**
- Separate deploying code from releasing features to users

**Feature Flags**
- Wrap all significant new features in feature flags
- Allows code deployment in disabled state
- Provides instant "kill switch" if issues arise

**Gradual Rollouts (No "Big Bang" Deployments)**

- **Canary Release:** Release to small subset of users, monitor, gradually increase traffic
- **Blue-Green Deployment:** Deploy to idle "Green" environment, then switch all traffic from "Blue"

### 6.3 Observability: The Three Pillars

**Instrument Everything** — All telemetry data must be structured, correlated (by trace ID), and centralized

1. **Logs**
   - Structured (JSON), timestamped records of discrete events
   - Provide granular detail

2. **Metrics**
   - Numerical, time-series data representing system health (error rates, latency)
   - Used for dashboards and alerting

3. **Distributed Traces**
   - End-to-end journey of a single request through all system components
   - Essential for debugging performance in distributed/modular systems

---

## Quick Reference

**When Claude is asked to write code:**
- Follow TDD: Write test first (Red), then minimal code (Green), then refactor
- Apply KISS, DRY, and YAGNI principles
- Adhere to SOLID principles
- Use appropriate testing level from the pyramid

**When Claude is asked about architecture:**
- Default to Modular Monolith
- Recommend API Gateway and Event-Driven patterns
- Suggest creating an ADR for significant decisions

**When Claude is asked about security:**
- Apply Zero Trust principles
- Use OAuth 2.0 (with appropriate grant type)
- Encrypt data in transit (TLS 1.2+) and at rest (AES-256)
- Never store secrets in code

**When Claude is asked about deployment:**
- Automate everything through CI/CD
- Use feature flags for new features
- Prefer canary releases or blue-green deployments
- Ensure full observability (logs, metrics, traces)