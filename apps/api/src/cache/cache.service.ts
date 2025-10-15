import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as crypto from 'crypto';

/**
 * CacheService provides Redis-based caching for LLM responses
 *
 * Features:
 * - 1-hour TTL for cached responses
 * - Deterministic cache key generation using SHA-256
 * - Graceful error handling (returns null on errors, never throws)
 * - Cache hit/miss metrics tracking
 * - Automatic cleanup on module destroy
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;
  private readonly TTL_SECONDS = 3600; // 1 hour

  // Metrics tracking
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    // Initialize Redis connection
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });
    } else {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });
    }

    // Handle Redis connection errors gracefully
    this.redis.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connection established');
    });
  }

  /**
   * Generates a deterministic cache key using SHA-256 hash
   *
   * Format: email:template:${userId}:${contactId}:${contextHash}
   *
   * @param userId - The user ID requesting the template
   * @param contactId - The contact ID for whom the template is generated
   * @param context - Context object (style, notes, etc.) that affects the template
   * @returns Deterministic cache key
   */
  generateCacheKey(userId: string, contactId: string, context: Record<string, any>): string {
    // Sort context keys to ensure consistent hashing regardless of property order
    const sortedContext = Object.keys(context)
      .sort()
      .reduce((acc, key) => {
        acc[key] = context[key];
        return acc;
      }, {} as Record<string, any>);

    // Create hash of context
    const contextString = JSON.stringify(sortedContext);
    const contextHash = crypto.createHash('sha256').update(contextString).digest('hex');

    return `email:template:${userId}:${contactId}:${contextHash}`;
  }

  /**
   * Retrieves a cached value by key
   *
   * @param key - Cache key
   * @returns Cached value or null if not found/error
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);

      if (value === null) {
        this.cacheMisses++;
        this.logger.debug(`Cache miss: ${key}`);
        return null;
      }

      this.cacheHits++;
      this.logger.debug(`Cache hit: ${key}`);

      return JSON.parse(value) as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Cache get error for key ${key}: ${errorMessage}`);
      this.cacheMisses++;
      return null;
    }
  }

  /**
   * Stores a value in cache with 1-hour TTL
   *
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, this.TTL_SECONDS, serialized);
      this.logger.debug(`Cache set: ${key} (TTL: ${this.TTL_SECONDS}s)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Cache set error for key ${key}: ${errorMessage}`);
      // Don't throw - caching is optional, degraded functionality is acceptable
    }
  }

  /**
   * Invalidates all cache entries for a specific user + contact combination
   *
   * Note: This will be called when contact data changes to ensure fresh generation
   *
   * @param userId - User ID
   * @param contactId - Contact ID
   */
  async invalidate(userId: string, contactId: string): Promise<void> {
    try {
      // Pattern to match all cache keys for this user + contact
      const pattern = `email:template:${userId}:${contactId}:*`;

      // Find all matching keys
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Invalidated ${keys.length} cache entries for user ${userId}, contact ${contactId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Cache invalidation error: ${errorMessage}`);
      // Don't throw - invalidation failure is not critical
    }
  }

  /**
   * Gets current cache metrics and resets counters
   *
   * @returns Cache hit/miss statistics
   */
  getCacheMetrics(): { hits: number; misses: number; total: number; hitRate: number } {
    const hits = this.cacheHits;
    const misses = this.cacheMisses;
    const total = hits + misses;
    const hitRate = total > 0 ? hits / total : 0;

    this.logger.log(`Cache metrics: ${hits} hits, ${misses} misses, ${(hitRate * 100).toFixed(1)}% hit rate`);

    // Reset counters after retrieval
    this.cacheHits = 0;
    this.cacheMisses = 0;

    return { hits, misses, total, hitRate };
  }

  /**
   * Cleanup: close Redis connection on module destroy
   */
  async onModuleDestroy() {
    try {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error closing Redis connection: ${errorMessage}`);
    }
  }
}
