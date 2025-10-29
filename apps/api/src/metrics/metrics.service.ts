import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import {
  Counter,
  Histogram,
  Gauge,
  register,
  collectDefaultMetrics,
} from 'prom-client';

/**
 * Metrics Service
 *
 * Provides methods to track custom application metrics for monitoring
 * and performance analysis.
 *
 * Metrics Categories:
 * - AI Performance: Email generation latency, token usage, provider distribution
 * - Cache Performance: Hit/miss rate, cache size
 * - Database Performance: Query latency by operation type
 * - Business Metrics: Emails generated, contacts managed
 */
@Injectable()
export class MetricsService {
  // AI Email Generation Metrics
  private aiEmailGenerationDuration!: Histogram<string>;
  private aiEmailGenerationTotal!: Counter<string>;
  private aiEmailGenerationErrors!: Counter<string>;
  private aiTokensUsed!: Counter<string>;
  private aiProviderUsage!: Counter<string>;

  // Cache Metrics
  private cacheHits!: Counter<string>;
  private cacheMisses!: Counter<string>;
  private cacheSize!: Gauge<string>;

  // Database Metrics
  private dbQueryDuration!: Histogram<string>;
  private dbQueryTotal!: Counter<string>;
  private dbQueryErrors!: Counter<string>;

  // Business Metrics
  private emailsGenerated!: Counter<string>;
  private contactsCreated!: Counter<string>;
  private contactsUpdated!: Counter<string>;
  private contactsDeleted!: Counter<string>;

  constructor() {
    this.initializeMetrics();
  }

  /**
   * Initialize all custom Prometheus metrics
   */
  private initializeMetrics() {
    // AI Email Generation Metrics
    this.aiEmailGenerationDuration = new Histogram({
      name: 'cordiq_ai_email_generation_duration_seconds',
      help: 'Duration of AI email generation requests in seconds',
      labelNames: ['style', 'provider', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    });

    this.aiEmailGenerationTotal = new Counter({
      name: 'cordiq_ai_email_generation_total',
      help: 'Total number of AI email generation requests',
      labelNames: ['style', 'provider', 'status'],
    });

    this.aiEmailGenerationErrors = new Counter({
      name: 'cordiq_ai_email_generation_errors_total',
      help: 'Total number of AI email generation errors',
      labelNames: ['error_type', 'provider'],
    });

    this.aiTokensUsed = new Counter({
      name: 'cordiq_ai_tokens_used_total',
      help: 'Total number of LLM tokens used',
      labelNames: ['provider', 'style'],
    });

    this.aiProviderUsage = new Counter({
      name: 'cordiq_ai_provider_usage_total',
      help: 'Total number of requests by AI provider',
      labelNames: ['provider'],
    });

    // Cache Metrics
    this.cacheHits = new Counter({
      name: 'cordiq_cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['operation'],
    });

    this.cacheMisses = new Counter({
      name: 'cordiq_cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['operation'],
    });

    this.cacheSize = new Gauge({
      name: 'cordiq_cache_size_bytes',
      help: 'Current size of cache in bytes',
      labelNames: ['cache_type'],
    });

    // Database Metrics
    this.dbQueryDuration = new Histogram({
      name: 'cordiq_db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    });

    this.dbQueryTotal = new Counter({
      name: 'cordiq_db_query_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status'],
    });

    this.dbQueryErrors = new Counter({
      name: 'cordiq_db_query_errors_total',
      help: 'Total number of database query errors',
      labelNames: ['operation', 'table', 'error_type'],
    });

    // Business Metrics
    this.emailsGenerated = new Counter({
      name: 'cordiq_emails_generated_total',
      help: 'Total number of emails generated',
      labelNames: ['style'],
    });

    this.contactsCreated = new Counter({
      name: 'cordiq_contacts_created_total',
      help: 'Total number of contacts created',
    });

    this.contactsUpdated = new Counter({
      name: 'cordiq_contacts_updated_total',
      help: 'Total number of contacts updated',
    });

    this.contactsDeleted = new Counter({
      name: 'cordiq_contacts_deleted_total',
      help: 'Total number of contacts deleted',
    });

    // Register all metrics
    register.registerMetric(this.aiEmailGenerationDuration);
    register.registerMetric(this.aiEmailGenerationTotal);
    register.registerMetric(this.aiEmailGenerationErrors);
    register.registerMetric(this.aiTokensUsed);
    register.registerMetric(this.aiProviderUsage);
    register.registerMetric(this.cacheHits);
    register.registerMetric(this.cacheMisses);
    register.registerMetric(this.cacheSize);
    register.registerMetric(this.dbQueryDuration);
    register.registerMetric(this.dbQueryTotal);
    register.registerMetric(this.dbQueryErrors);
    register.registerMetric(this.emailsGenerated);
    register.registerMetric(this.contactsCreated);
    register.registerMetric(this.contactsUpdated);
    register.registerMetric(this.contactsDeleted);
  }

  // ============================================
  // AI Email Generation Metrics Methods
  // ============================================

  /**
   * Record AI email generation request
   */
  recordAIEmailGeneration(params: {
    style: 'formal' | 'casual';
    provider: 'openrouter' | 'openai' | 'anthropic' | 'gemini';
    duration: number;
    status: 'success' | 'error';
    tokensUsed?: number;
  }) {
    const { style, provider, duration, status, tokensUsed } = params;

    this.aiEmailGenerationDuration.observe({ style, provider, status }, duration);
    this.aiEmailGenerationTotal.inc({ style, provider, status });

    if (tokensUsed) {
      this.aiTokensUsed.inc({ provider, style }, tokensUsed);
    }

    if (status === 'success') {
      this.emailsGenerated.inc({ style });
      this.aiProviderUsage.inc({ provider });
    }
  }

  /**
   * Record AI email generation error
   */
  recordAIEmailGenerationError(errorType: string, provider: 'openrouter' | 'openai' | 'anthropic' | 'gemini' | 'none') {
    this.aiEmailGenerationErrors.inc({ error_type: errorType, provider });
  }

  // ============================================
  // Cache Metrics Methods
  // ============================================

  /**
   * Record cache hit
   */
  recordCacheHit(operation: string) {
    this.cacheHits.inc({ operation });
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(operation: string) {
    this.cacheMisses.inc({ operation });
  }

  /**
   * Update cache size
   */
  updateCacheSize(cacheType: string, sizeBytes: number) {
    this.cacheSize.set({ cache_type: cacheType }, sizeBytes);
  }

  /**
   * Get cache hit rate (hit / (hit + miss))
   */
  async getCacheHitRate(): Promise<number> {
    const metrics = await register.metrics();
    const hitsMatch = metrics.match(
      /cordiq_cache_hits_total{[^}]*} (\d+)/,
    );
    const missesMatch = metrics.match(
      /cordiq_cache_misses_total{[^}]*} (\d+)/,
    );

    const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
    const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
    const total = hits + misses;

    return total > 0 ? hits / total : 0;
  }

  // ============================================
  // Database Metrics Methods
  // ============================================

  /**
   * Record database query
   */
  recordDatabaseQuery(params: {
    operation: string;
    table: string;
    duration: number;
    status: 'success' | 'error';
  }) {
    const { operation, table, duration, status } = params;

    this.dbQueryDuration.observe({ operation, table, status }, duration);
    this.dbQueryTotal.inc({ operation, table, status });
  }

  /**
   * Record database query error
   */
  recordDatabaseQueryError(
    operation: string,
    table: string,
    errorType: string,
  ) {
    this.dbQueryErrors.inc({ operation, table, error_type: errorType });
  }

  // ============================================
  // Business Metrics Methods
  // ============================================

  /**
   * Record contact creation
   */
  recordContactCreated() {
    this.contactsCreated.inc();
  }

  /**
   * Record contact update
   */
  recordContactUpdated() {
    this.contactsUpdated.inc();
  }

  /**
   * Record contact deletion
   */
  recordContactDeleted() {
    this.contactsDeleted.inc();
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Get content type for metrics endpoint
   */
  getContentType(): string {
    return register.contentType;
  }

  /**
   * Reset all metrics (useful for testing)
   */
  resetMetrics() {
    register.resetMetrics();
  }
}
