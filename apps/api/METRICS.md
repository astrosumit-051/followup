# Monitoring Metrics Documentation

> Last Updated: 2025-10-14
> Status: Prometheus Metrics Integration Complete
> Endpoint: http://localhost:4000/metrics

## Overview

Cordiq API includes comprehensive Prometheus metrics for monitoring application performance, business metrics, and system health. This document describes the available metrics and how to use them.

## Metrics Endpoint

**URL**: `http://localhost:4000/metrics`
**Format**: Prometheus text-based format
**Access**: Public endpoint (no authentication required)
**Use Case**: Scraped by Prometheus server for monitoring and alerting

**Health Check**: `http://localhost:4000/metrics/health`
- Returns JSON with status and cache hit rate
- Example response:
  ```json
  {
    "status": "ok",
    "timestamp": "2025-10-14T12:00:00.000Z",
    "cacheHitRate": 0.42
  }
  ```

## Metrics Categories

### 1. AI Email Generation Metrics

#### `cordiq_ai_email_generation_duration_seconds` (Histogram)
Duration of AI email generation requests in seconds.

**Labels:**
- `style`: 'formal' or 'casual'
- `provider`: 'openai', 'anthropic', or 'grok'
- `status`: 'success' or 'error'

**Buckets**: [0.1, 0.5, 1, 2, 5, 10, 30]

**Use Cases**:
- Monitor email generation latency (p50, p95, p99)
- Identify slow AI provider performance
- Track latency trends over time
- Alert when p95 latency exceeds 5 seconds

**Example PromQL Queries**:
```promql
# p95 latency for AI email generation
histogram_quantile(0.95,
  sum(rate(cordiq_ai_email_generation_duration_seconds_bucket[5m])) by (le, provider)
)

# Average latency by style
rate(cordiq_ai_email_generation_duration_seconds_sum[5m]) /
rate(cordiq_ai_email_generation_duration_seconds_count[5m])
```

#### `cordiq_ai_email_generation_total` (Counter)
Total number of AI email generation requests.

**Labels**:
- `style`: 'formal' or 'casual'
- `provider`: 'openai', 'anthropic', or 'grok'
- `status`: 'success' or 'error'

**Use Cases**:
- Track request volume over time
- Calculate success/error rates
- Monitor provider distribution
- Analyze style preference trends

**Example PromQL Queries**:
```promql
# Request rate per minute
rate(cordiq_ai_email_generation_total[1m])

# Error rate percentage
(
  sum(rate(cordiq_ai_email_generation_total{status="error"}[5m]))
  /
  sum(rate(cordiq_ai_email_generation_total[5m]))
) * 100
```

#### `cordiq_ai_email_generation_errors_total` (Counter)
Total number of AI email generation errors.

**Labels**:
- `error_type`: 'openai_failure', 'anthropic_failure', 'all_providers_failed', 'not_found', 'unexpected_error'
- `provider`: 'openai', 'anthropic', 'grok', 'none'

**Use Cases**:
- Track error types and frequencies
- Alert on provider failures
- Monitor fallback chain effectiveness
- Identify common failure patterns

#### `cordiq_ai_tokens_used_total` (Counter)
Total number of LLM tokens used.

**Labels**:
- `provider`: 'openai', 'anthropic', or 'grok'
- `style`: 'formal' or 'casual'

**Use Cases**:
- Track LLM API costs
- Monitor token usage trends
- Optimize prompt efficiency
- Budget forecasting

**Example PromQL Queries**:
```promql
# Tokens per request average
rate(cordiq_ai_tokens_used_total[5m]) /
rate(cordiq_ai_email_generation_total{status="success"}[5m])
```

#### `cordiq_ai_provider_usage_total` (Counter)
Total number of successful requests by AI provider.

**Labels**:
- `provider`: 'openai', 'anthropic', or 'grok'

**Use Cases**:
- Monitor provider distribution
- Verify fallback chain usage
- Track primary vs fallback provider ratio
- Optimize provider selection

---

### 2. Cache Metrics

#### `cordiq_cache_hits_total` (Counter)
Total number of cache hits.

**Labels**:
- `operation`: Cache operation type (e.g., 'email_generation')

**Use Cases**:
- Calculate cache hit rate
- Monitor cache effectiveness
- Identify cacheable operations
- Optimize caching strategy

**Example PromQL Queries**:
```promql
# Cache hit rate percentage
(
  sum(rate(cordiq_cache_hits_total[5m]))
  /
  (sum(rate(cordiq_cache_hits_total[5m])) + sum(rate(cordiq_cache_misses_total[5m])))
) * 100
```

#### `cordiq_cache_misses_total` (Counter)
Total number of cache misses.

**Labels**:
- `operation`: Cache operation type

**Use Cases**:
- Calculate cache miss rate
- Identify uncached operations
- Optimize cache key generation
- Monitor cache invalidation

#### `cordiq_cache_size_bytes` (Gauge)
Current size of cache in bytes.

**Labels**:
- `cache_type`: Type of cache (e.g., 'redis', 'in_memory')

**Use Cases**:
- Monitor cache memory usage
- Alert on cache size limits
- Optimize cache TTL
- Capacity planning

---

### 3. Database Query Metrics

#### `cordiq_db_query_duration_seconds` (Histogram)
Duration of database queries in seconds.

**Labels**:
- `operation`: Query type (e.g., 'findMany', 'findUnique', 'create', 'update', 'delete')
- `table`: Database table name (e.g., 'email', 'contact', 'user')
- `status`: 'success' or 'error'

**Buckets**: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]

**Use Cases**:
- Monitor query performance
- Identify slow queries
- Track query latency by table
- Alert on performance degradation

**Example PromQL Queries**:
```promql
# p95 query latency by table
histogram_quantile(0.95,
  sum(rate(cordiq_db_query_duration_seconds_bucket[5m])) by (le, table)
)

# Slow queries (>100ms)
sum(rate(cordiq_db_query_duration_seconds_bucket{le="0.1"}[5m])) by (table, operation)
```

#### `cordiq_db_query_total` (Counter)
Total number of database queries.

**Labels**:
- `operation`: Query type
- `table`: Database table name
- `status`: 'success' or 'error'

**Use Cases**:
- Track query volume
- Monitor database load
- Identify hotspots
- Capacity planning

#### `cordiq_db_query_errors_total` (Counter)
Total number of database query errors.

**Labels**:
- `operation`: Query type
- `table`: Database table name
- `error_type`: Error classification

**Use Cases**:
- Track database errors
- Alert on connection issues
- Monitor query failures
- Troubleshoot database problems

---

### 4. Business Metrics

#### `cordiq_emails_generated_total` (Counter)
Total number of emails generated (successful AI generations).

**Labels**:
- `style`: 'formal' or 'casual'

**Use Cases**:
- Track product usage
- Monitor user engagement
- Business analytics
- Growth metrics

#### `cordiq_contacts_created_total` (Counter)
Total number of contacts created.

**Use Cases**:
- Track user adoption
- Monitor data growth
- Business metrics
- Capacity planning

#### `cordiq_contacts_updated_total` (Counter)
Total number of contacts updated.

**Use Cases**:
- Monitor user activity
- Track engagement
- Identify active users

#### `cordiq_contacts_deleted_total` (Counter)
Total number of contacts deleted.

**Use Cases**:
- Track data churn
- Monitor cleanup patterns

---

### 5. Default Node.js Metrics (Provided by Prometheus Client)

All metrics are prefixed with `cordiq_` and include:

#### Process Metrics
- `nodejs_process_cpu_user_seconds_total`: User CPU time
- `nodejs_process_cpu_system_seconds_total`: System CPU time
- `nodejs_heap_size_total_bytes`: Total heap size
- `nodejs_heap_size_used_bytes`: Used heap size
- `nodejs_external_memory_bytes`: External memory usage
- `nodejs_version_info`: Node.js version info

#### Event Loop Metrics
- `nodejs_eventloop_lag_seconds`: Event loop lag
- `nodejs_eventloop_lag_mean_seconds`: Mean event loop lag
- `nodejs_eventloop_lag_p50_seconds`: p50 event loop lag
- `nodejs_eventloop_lag_p95_seconds`: p95 event loop lag
- `nodejs_eventloop_lag_p99_seconds`: p99 event loop lag

#### HTTP Metrics (if exposed)
- Request duration
- Request count
- Response status codes

---

## Prometheus Configuration

### Scrape Configuration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'cordiq-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/metrics'
```

### Alert Rules

Example alert rules (`alerts.yml`):

```yaml
groups:
  - name: cordiq_alerts
    rules:
      # AI Performance
      - alert: HighAILatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(cordiq_ai_email_generation_duration_seconds_bucket[5m])) by (le)
          ) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "AI email generation p95 latency exceeds 5 seconds"
          description: "p95 latency: {{ $value }}s"

      # Error Rate
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(cordiq_ai_email_generation_total{status="error"}[5m]))
            /
            sum(rate(cordiq_ai_email_generation_total[5m]))
          ) * 100 > 5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "AI email generation error rate exceeds 5%"
          description: "Error rate: {{ $value }}%"

      # Cache Performance
      - alert: LowCacheHitRate
        expr: |
          (
            sum(rate(cordiq_cache_hits_total[5m]))
            /
            (sum(rate(cordiq_cache_hits_total[5m])) + sum(rate(cordiq_cache_misses_total[5m])))
          ) * 100 < 20
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Cache hit rate below 20%"
          description: "Cache hit rate: {{ $value }}%"

      # Database Performance
      - alert: SlowDatabaseQueries
        expr: |
          histogram_quantile(0.95,
            sum(rate(cordiq_db_query_duration_seconds_bucket[5m])) by (le, table)
          ) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database queries p95 latency exceeds 100ms"
          description: "Table {{ $labels.table }}: {{ $value }}s"
```

---

## Grafana Dashboards

### AI Performance Dashboard

**Panels:**
1. **AI Generation Latency (p50, p95, p99)** - Graph
   - Query: `histogram_quantile(0.95, ...)`
   - Unit: seconds
   - Alert threshold: 5s (p95)

2. **Request Rate** - Graph
   - Query: `rate(cordiq_ai_email_generation_total[5m])`
   - Unit: req/s
   - Breakdown by provider and style

3. **Error Rate** - Stat
   - Query: Error rate percentage
   - Unit: %
   - Alert threshold: 2%

4. **Token Usage** - Graph
   - Query: `rate(cordiq_ai_tokens_used_total[5m])`
   - Unit: tokens/s
   - Breakdown by provider

5. **Provider Distribution** - Pie Chart
   - Query: `cordiq_ai_provider_usage_total`
   - Shows primary vs fallback usage

### Cache Performance Dashboard

**Panels:**
1. **Cache Hit Rate** - Stat
   - Query: Cache hit rate percentage
   - Unit: %
   - Target: >30%

2. **Cache Operations** - Graph
   - Query: Hits vs Misses over time
   - Unit: ops/s

3. **Cache Size** - Graph
   - Query: `cordiq_cache_size_bytes`
   - Unit: bytes

### Database Performance Dashboard

**Panels:**
1. **Query Latency by Table** - Graph
   - Query: p95 latency by table
   - Unit: seconds
   - Alert threshold: 100ms

2. **Query Volume** - Graph
   - Query: `rate(cordiq_db_query_total[5m])`
   - Unit: queries/s
   - Breakdown by table

3. **Database Errors** - Graph
   - Query: `rate(cordiq_db_query_errors_total[5m])`
   - Unit: errors/s

### Business Metrics Dashboard

**Panels:**
1. **Emails Generated** - Stat
   - Query: `cordiq_emails_generated_total`
   - Breakdown by style

2. **Contacts Growth** - Graph
   - Query: `cordiq_contacts_created_total - cordiq_contacts_deleted_total`
   - Unit: contacts

3. **Daily Active Operations** - Graph
   - Query: Contact creates/updates/deletes
   - Unit: operations/day

---

## Using Metrics in Code

### Recording AI Email Generation

```typescript
// In AIService.generateEmailTemplate()
const startTime = Date.now();

try {
  const result = await this.generateWithOpenAI(prompt);
  const duration = (Date.now() - startTime) / 1000;

  this.metricsService.recordAIEmailGeneration({
    style: 'formal',
    provider: 'openai',
    duration,
    status: 'success',
    tokensUsed: result.tokensUsed,
  });

  return result;
} catch (error) {
  this.metricsService.recordAIEmailGenerationError('openai_failure', 'openai');
  // ... fallback logic
}
```

### Recording Cache Operations

```typescript
// In CacheService
const cachedValue = await this.redis.get(cacheKey);

if (cachedValue) {
  this.metricsService.recordCacheHit('email_generation');
  return JSON.parse(cachedValue);
} else {
  this.metricsService.recordCacheMiss('email_generation');
  // ... generate value
}
```

### Recording Database Queries

```typescript
// In PrismaService or custom wrapper
const startTime = Date.now();

try {
  const result = await this.prisma.email.findMany({ ... });
  const duration = (Date.now() - startTime) / 1000;

  this.metricsService.recordDatabaseQuery({
    operation: 'findMany',
    table: 'email',
    duration,
    status: 'success',
  });

  return result;
} catch (error) {
  this.metricsService.recordDatabaseQueryError('findMany', 'email', 'connection_error');
  throw error;
}
```

### Recording Business Metrics

```typescript
// In ContactService.createContact()
const contact = await this.prisma.contact.create({ ... });
this.metricsService.recordContactCreated();
return contact;
```

---

## Performance Targets & Monitoring

### SLIs (Service Level Indicators)

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| AI p95 Latency | <5s | <10s |
| Cache Hit Rate | >30% | >20% |
| DB Query p95 | <100ms | <200ms |
| Error Rate | <2% | <5% |
| Availability | >99.5% | >99% |

### Monitoring Checklist

- [ ] Prometheus scraping API metrics every 15s
- [ ] Grafana dashboards configured
- [ ] Alert rules defined and tested
- [ ] On-call rotation configured
- [ ] Runbooks created for common alerts
- [ ] Metrics retention policy configured (30+ days)

---

## Next Steps

1. **Deploy Prometheus** - Set up Prometheus server to scrape metrics
2. **Configure Grafana** - Create dashboards for visualization
3. **Set Up Alerts** - Configure alert rules and notification channels
4. **Integration Tests** - Verify metrics are recorded correctly
5. **Documentation** - Create runbooks for handling alerts
6. **Optimization** - Tune based on real-world metrics data

---

## Troubleshooting

### Metrics Not Appearing

1. **Check endpoint**: `curl http://localhost:4000/metrics`
2. **Verify Prometheus module**: Check app.module.ts imports
3. **Check TypeScript compilation**: Ensure no errors in metrics files
4. **Verify service injection**: MetricsService must be injected in services

### High Memory Usage

- Review `cordiq_cache_size_bytes` metric
- Check histogram bucket configuration
- Monitor `nodejs_heap_size_used_bytes`
- Adjust cache TTL if needed

### Missing Labels

- Ensure all metric recording calls include required labels
- Check Prometheus scrape config for label relabeling rules
- Verify label names match metric definitions

---

*For more information, see the Prometheus documentation: https://prometheus.io/docs/*
