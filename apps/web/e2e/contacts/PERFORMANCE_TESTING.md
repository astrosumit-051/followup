# Contact Performance Testing Guide

This guide explains how to run performance tests for the Contact CRUD operations with 1000+ contacts.

## Prerequisites

### 1. Backend Setup

The backend must be running with performance test data:

```bash
# From project root
cd apps/api

# Run database migrations (if not already done)
pnpm prisma migrate dev

# Seed performance test data (creates 1000 contacts)
pnpm db:seed:performance

# Start the backend server
pnpm dev
```

This will create:

- A test user: `performance.test@relationhub.com`
- 1000+ contacts with realistic data

### 2. Frontend Setup

Ensure the frontend is running:

```bash
# From project root
cd apps/web
pnpm dev
```

### 3. Authentication Setup

**Important:** You need to authenticate as the performance test user before running tests.

Since Supabase authentication requires:

1. Visit http://localhost:3000/signup
2. Create an account with email: `performance.test@relationhub.com`
3. Complete email verification if required
4. The account should automatically have access to the 1000 seeded contacts

## Running Performance Tests

### Run All Performance Tests

```bash
cd apps/web
pnpm test:e2e:performance
```

### Run Specific Test Suites

```bash
# List page performance only
pnpm test:e2e:performance --grep "List Page Performance"

# Search performance only
pnpm test:e2e:performance --grep "Search Performance"

# Form submission performance only
pnpm test:e2e:performance --grep "Form Submission Performance"

# Pagination performance only
pnpm test:e2e:performance --grep "Pagination Performance"

# Filter performance only
pnpm test:e2e:performance --grep "Filter Performance"

# Memory management tests only
pnpm test:e2e:performance --grep "Memory and Resource Management"
```

### Run with UI Mode (Recommended for Debugging)

```bash
pnpm test:e2e:ui -- e2e/contacts/performance.spec.ts
```

### Run in Headed Mode (See Browser)

```bash
pnpm test:e2e:headed -- e2e/contacts/performance.spec.ts
```

## Performance Thresholds

The tests verify the following performance thresholds:

| Metric             | Threshold   | Description                                      |
| ------------------ | ----------- | ------------------------------------------------ |
| List Page Load     | < 3 seconds | Initial load of contact list with 1000+ contacts |
| Search Response    | < 500ms     | Time to return search results                    |
| Form Submission    | < 1 second  | Time to submit create/edit contact form          |
| Pagination Load    | < 2 seconds | Time to load next page of contacts               |
| Filter Application | < 500ms     | Time to apply filters to contact list            |

## What Gets Tested

### List Page Performance

- ✅ Initial page load time with 1000+ contacts
- ✅ Loading indicators during data fetch
- ✅ First paint and interactive times

### Search Performance

- ✅ Search query response time
- ✅ Debounced search efficiency
- ✅ Empty search results handling
- ✅ Large result set performance

### Form Submission Performance

- ✅ Create contact form submission time
- ✅ Edit contact form submission time
- ✅ Optimistic UI update responsiveness
- ✅ Form validation speed

### Pagination Performance

- ✅ Load more button response time
- ✅ Rapid pagination click handling
- ✅ Scroll position maintenance
- ✅ Memory management during pagination

### Filter Performance

- ✅ Single filter application time
- ✅ Multiple combined filters
- ✅ Filter state management

### Memory and Resource Management

- ✅ Memory leak detection during navigation
- ✅ Large list rendering stability
- ✅ Continuous interaction responsiveness

## Interpreting Results

### Successful Test Output

```
📊 Contact list load time: 2347ms
✅ PASS: should load contact list page with 1000+ contacts in under 3 seconds

🔍 Search response time: 423ms
✅ PASS: should return search results in under 500ms

📝 Form submission time: 876ms
✅ PASS: should submit new contact form in under 1 second
```

### Failed Test Output

```
📊 Contact list load time: 3542ms
❌ FAIL: should load contact list page with 1000+ contacts in under 3 seconds
Expected: < 3000ms
Received: 3542ms
```

## Troubleshooting

### Tests Skipped

If you see:

```
⚠️  Skipping until backend with test data is available
```

**Solution:**

1. Ensure backend is running on http://localhost:4000
2. Run the performance seed script: `cd apps/api && pnpm db:seed:performance`
3. Authenticate with the test user account
4. Re-run the tests

### Slow Performance

If tests are failing due to slow performance:

1. **Check Database Connection**
   - Ensure PostgreSQL is running locally
   - Check database connection latency
   - Consider using a local database for testing

2. **Check System Resources**
   - Close unnecessary applications
   - Monitor CPU and memory usage
   - Ensure adequate disk space

3. **Check Network**
   - Disable network throttling in dev tools
   - Check for active downloads/uploads
   - Consider testing on localhost only

4. **Optimize Test Environment**
   - Run tests in headed mode to see bottlenecks
   - Use Playwright's trace feature: `--trace on`
   - Profile with Chrome DevTools

### Authentication Issues

If authentication fails:

1. **Create Test User Manually**

   ```bash
   # Visit http://localhost:3000/signup
   # Register with: performance.test@relationhub.com
   ```

2. **Check Supabase Configuration**
   - Verify `.env.local` has correct Supabase credentials
   - Ensure Supabase project is running
   - Check authentication providers are enabled

3. **Clear Browser State**
   ```bash
   # Clear Playwright browser cache
   npx playwright clean
   ```

## Performance Optimization Tips

If tests reveal performance issues:

### Frontend Optimizations

1. **Enable React Query Caching**
   - Increase cache time for contact list
   - Implement optimistic updates
   - Use pagination cursors efficiently

2. **Virtual Scrolling**
   - Consider implementing virtual scrolling for large lists
   - Use `react-window` or `react-virtualized`

3. **Code Splitting**
   - Lazy load contact forms
   - Split heavy components
   - Use dynamic imports

4. **Image Optimization**
   - Lazy load profile pictures
   - Use Next.js Image component
   - Implement proper srcset

### Backend Optimizations

1. **Database Indexing**
   - Add indexes on frequently queried fields
   - Optimize search queries
   - Use database query caching

2. **Query Optimization**
   - Limit fields returned in GraphQL queries
   - Implement dataloader for N+1 queries
   - Use database query explain to find bottlenecks

3. **Caching**
   - Implement Redis caching for frequently accessed data
   - Use HTTP caching headers
   - Consider CDN for static assets

4. **Rate Limiting**
   - Ensure rate limiting doesn't throttle legitimate requests
   - Adjust throttle limits based on performance tests
   - Implement request prioritization

## Continuous Performance Monitoring

### Add Performance Tests to CI/CD

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0" # Weekly on Sunday

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "22"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Setup database
        run: |
          cd apps/api
          pnpm prisma migrate deploy
          pnpm db:seed:performance

      - name: Start services
        run: |
          pnpm dev &
          sleep 10

      - name: Run performance tests
        run: |
          cd apps/web
          pnpm test:e2e:performance

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: apps/web/test-results/
```

## Resources

- [Playwright Performance Testing](https://playwright.dev/docs/test-api-testing)
- [Web Performance Metrics](https://web.dev/metrics/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [GraphQL Performance Best Practices](https://www.apollographql.com/docs/apollo-server/performance/apq/)

## Support

For questions or issues with performance testing:

1. Check the troubleshooting section above
2. Review test output and error messages
3. Open an issue on GitHub with test results
4. Contact the development team
