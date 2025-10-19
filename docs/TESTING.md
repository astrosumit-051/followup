# Testing Guide

> Last Updated: 2025-10-19
> Version: 1.0.0

## Overview

This document describes the testing infrastructure for RelationHub, including configuration, best practices, and troubleshooting tips.

---

## Test Configuration

### Jest Memory Optimization

The project is configured to prevent JavaScript heap memory exhaustion during test execution:

**Jest Config** (`apps/api/jest.config.js`):
```javascript
{
  maxWorkers: '50%',              // Use 50% of CPU cores
  workerIdleMemoryLimit: '512MB', // Kill idle workers using >512MB
  testTimeout: 30000,             // 30 second timeout for async tests
}
```

**Package Scripts** (`apps/api/package.json`):
```json
{
  "test": "NODE_OPTIONS='--max-old-space-size=4096' jest",
  "test:ci": "NODE_OPTIONS='--max-old-space-size=4096' jest --ci --runInBand --coverage"
}
```

**Memory Allocation:**
- **Local Development:** 4GB heap (4096MB)
- **CI/CD:** 4GB heap with sequential execution (`--runInBand`)
- **Worker Limit:** 512MB per idle worker

---

## Running Tests

### Local Development

```bash
# Run all tests with optimized memory
pnpm test

# Run tests in watch mode (auto-rerun on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:cov

# Run specific test file
pnpm test -- --testPathPattern="email-draft.service"

# Run tests for specific service
pnpm test -- email-draft

# Run with verbose output
pnpm test -- --verbose
```

### Database Package Tests

```bash
cd packages/database
pnpm test
```

**Expected Output:**
```
Test Files  2 passed (2)
     Tests  30 passed (30)
  Duration  ~400ms
```

### API Package Tests

```bash
cd apps/api
pnpm test
```

**Expected Output:**
```
Test Suites: 12 passed
Tests:       91 passed
Duration:    ~60s
```

---

## CI/CD Testing

### GitHub Actions Workflow

Tests run automatically on:
- Push to `main`, `staging`, `email-composition` branches
- Pull requests to `main`, `staging` branches

**Workflow:** `.github/workflows/test.yml`

**Configuration:**
- Node.js 22.x
- 4GB memory allocation
- Sequential execution (`--runInBand`)
- Coverage reports uploaded as artifacts

**View Results:**
1. Navigate to repository → Actions tab
2. Click on workflow run
3. View "Run Tests" job
4. Download coverage reports from Artifacts section

---

## Troubleshooting

### Memory Exhaustion Errors

**Symptom:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit
Allocation failed - JavaScript heap out of memory
```

**Solutions:**

#### 1. Increase Memory Allocation
```bash
NODE_OPTIONS='--max-old-space-size=8192' pnpm test
```

#### 2. Run Tests Sequentially
```bash
pnpm test -- --runInBand
```

#### 3. Limit Worker Processes
```bash
pnpm test -- --maxWorkers=2
```

#### 4. Run Specific Test Suites
```bash
# Run only one service at a time
pnpm test -- --testPathPattern="attachment.service"
```

---

### Slow Test Execution

**Symptom:** Tests taking >2 minutes to complete

**Solutions:**

#### 1. Use Parallel Execution (Default)
```bash
pnpm test # Uses 50% of CPU cores
```

#### 2. Increase Worker Count (If Memory Available)
```bash
pnpm test -- --maxWorkers=4
```

#### 3. Skip Coverage (Faster)
```bash
pnpm test -- --coverage=false
```

---

### Test Timeouts

**Symptom:**
```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solutions:**

#### 1. Global Timeout Configured (30s)
Already set in `jest.config.js`:
```javascript
testTimeout: 30000
```

#### 2. Per-Test Timeout
```typescript
it('should complete long operation', async () => {
  // ...
}, 60000); // 60 second timeout
```

---

### TypeScript Decorator Warnings

**Symptom:**
```
error TS1240: Unable to resolve signature of property decorator
```

**Impact:** None - cosmetic warnings only, code compiles correctly

**Status:** Pre-existing issue, not related to test infrastructure

**Action:** Can be ignored or fixed in separate TypeScript config cleanup

---

## Test Coverage Goals

### Minimum Coverage Requirements

| Package | Coverage Target | Current Status |
|---------|----------------|----------------|
| **API** | 80% | ✅ 85%+ |
| **Database** | 80% | ✅ 90%+ |
| **Utils** | 70% | ⚠️ Not configured |
| **Types** | N/A | No tests needed |

### Coverage Reports

**Generate Coverage:**
```bash
cd apps/api
pnpm test:cov
```

**View HTML Report:**
```bash
open coverage/lcov-report/index.html
```

**Coverage Output Location:**
- API: `apps/api/coverage/`
- Database: `packages/database/coverage/`

---

## Writing Tests

### Test Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EmailDraftService } from './email-draft.service';

describe('EmailDraftService', () => {
  let service: EmailDraftService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailDraftService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmailDraftService>(EmailDraftService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create draft', async () => {
    // Arrange
    const userId = 'user-123';
    const input = { /* ... */ };

    // Act
    const result = await service.autoSaveDraft(userId, input);

    // Assert
    expect(result).toBeDefined();
    expect(result.userId).toBe(userId);
  });
});
```

### Test Categories

1. **Unit Tests** (`*.spec.ts`)
   - Test individual functions/methods
   - Mock all dependencies
   - Fast execution (<1ms per test)

2. **Integration Tests** (`*.e2e-spec.ts`)
   - Test service + database interaction
   - Use test database
   - Slower execution (100-500ms per test)

3. **E2E Tests** (Frontend - not yet implemented)
   - Test complete user workflows
   - Use Playwright
   - Slowest execution (1-5s per test)

---

## Best Practices

### 1. Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Don't rely on test execution order

### 2. Mocking
- Mock external dependencies (S3, APIs, databases)
- Use descriptive mock data
- Verify mock calls with `expect(mockFn).toHaveBeenCalledWith(...)`

### 3. Assertions
- Use specific matchers (`toBe`, `toEqual`, `toContain`)
- Test both success and error cases
- Verify authorization checks

### 4. Performance
- Keep unit tests fast (<5ms)
- Use `test.concurrent` for independent tests
- Avoid unnecessary database queries

### 5. Coverage
- Aim for 80%+ coverage
- Focus on critical paths
- Don't test auto-generated code

---

## Common Test Patterns

### Testing Authorization

```typescript
it('should throw ForbiddenException if user does not own contact', async () => {
  const userId = 'user-123';
  const contactId = 'contact-456';

  mockPrisma.contact.findUnique.mockResolvedValue({
    id: contactId,
    userId: 'different-user',
  });

  await expect(
    service.autoSaveDraft(userId, contactId, input),
  ).rejects.toThrow(ForbiddenException);
});
```

### Testing Pagination

```typescript
it('should return hasNextPage=true when more results exist', async () => {
  mockPrisma.emailDraft.findMany.mockResolvedValue([
    /* 10 drafts */
  ]);
  mockPrisma.emailDraft.count.mockResolvedValue(20);

  const result = await service.listDrafts(userId, { take: 10, skip: 0 });

  expect(result.pageInfo.hasNextPage).toBe(true);
  expect(result.pageInfo.total).toBe(20);
});
```

### Testing Async Operations

```typescript
it('should handle S3 errors gracefully', async () => {
  mockS3.send.mockRejectedValue(new Error('Network error'));

  await expect(
    service.generatePresignedUploadUrl(userId, filename, contentType, size),
  ).rejects.toThrow(InternalServerErrorException);

  expect(mockLogger.error).toHaveBeenCalled();
});
```

---

## Debugging Tests

### Enable Verbose Logging

```bash
pnpm test -- --verbose
```

### Run Single Test

```bash
pnpm test -- --testNamePattern="should create draft"
```

### Debug in VS Code

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Detect Open Handles

```bash
pnpm test -- --detectOpenHandles
```

### Detect Memory Leaks

```bash
pnpm test -- --detectLeaks
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Questions or Issues?**
- Create an issue in the repository
- Tag `@claude` in GitHub comments for assistance
- Consult `/context/errors-solved.md` for common test errors
