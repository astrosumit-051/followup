import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import Redis from 'ioredis';

// Mock ioredis with a mock factory
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  keys: jest.fn().mockResolvedValue([]),
  del: jest.fn(),
  ping: jest.fn(),
  on: jest.fn(),
  quit: jest.fn(),
};

jest.mock('ioredis', () => {
  const mockConstructor = jest.fn().mockImplementation(() => mockRedis);
  return {
    __esModule: true,
    default: mockConstructor,
    Redis: mockConstructor,
  };
});

describe('CacheService', () => {
  let service: CacheService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              if (key === 'REDIS_URL') return 'redis://localhost:6379';
              if (key === 'REDIS_HOST') return 'localhost';
              if (key === 'REDIS_PORT') return 6379;
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize Redis connection', () => {
      // When REDIS_URL is provided, Redis is called with URL string
      expect(Redis).toHaveBeenCalledWith('redis://localhost:6379', {
        retryStrategy: expect.any(Function),
        maxRetriesPerRequest: 3,
      });
    });

    it('should handle Redis connection errors gracefully', () => {
      const errorHandler = mockRedis.on.mock.calls.find(call => call[0] === 'error');
      expect(errorHandler).toBeDefined();

      if (errorHandler) {
        // Simulate error
        const mockError = new Error('Connection failed');
        errorHandler[1](mockError);
      }

      // Should log error but not crash
      expect(mockRedis.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache key for same inputs', () => {
      const userId = 'user-123';
      const contactId = 'contact-456';
      const context = { style: 'formal', notes: 'Met at conference' };

      const key1 = service.generateCacheKey(userId, contactId, context);
      const key2 = service.generateCacheKey(userId, contactId, context);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^email:template:user-123:contact-456:[a-f0-9]{64}$/);
    });

    it('should generate different keys for different contexts', () => {
      const userId = 'user-123';
      const contactId = 'contact-456';
      const context1 = { style: 'formal', notes: 'Met at conference' };
      const context2 = { style: 'casual', notes: 'Old friend' };

      const key1 = service.generateCacheKey(userId, contactId, context1);
      const key2 = service.generateCacheKey(userId, contactId, context2);

      expect(key1).not.toBe(key2);
    });

    it('should handle empty context object', () => {
      const userId = 'user-123';
      const contactId = 'contact-456';
      const context = {};

      const key = service.generateCacheKey(userId, contactId, context);

      expect(key).toMatch(/^email:template:user-123:contact-456:[a-f0-9]{64}$/);
    });

    it('should generate same hash for object properties in different order', () => {
      const userId = 'user-123';
      const contactId = 'contact-456';
      const context1 = { style: 'formal', notes: 'Test', priority: 'high' };
      const context2 = { priority: 'high', notes: 'Test', style: 'formal' };

      const key1 = service.generateCacheKey(userId, contactId, context1);
      const key2 = service.generateCacheKey(userId, contactId, context2);

      expect(key1).toBe(key2);
    });
  });

  describe('get', () => {
    it('should return cached value on cache hit', async () => {
      const cacheKey = 'email:template:user-123:contact-456:hash123';
      const cachedValue = { formal: { subject: 'Test', body: 'Body' } };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedValue));

      const result = await service.get(cacheKey);

      expect(mockRedis.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(cachedValue);
    });

    it('should return null on cache miss', async () => {
      const cacheKey = 'email:template:user-123:contact-456:hash123';

      mockRedis.get.mockResolvedValue(null);

      const result = await service.get(cacheKey);

      expect(mockRedis.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', async () => {
      const cacheKey = 'email:template:user-123:contact-456:hash123';

      mockRedis.get.mockResolvedValue('invalid json {');

      const result = await service.get(cacheKey);

      expect(result).toBeNull();
    });

    it('should handle Redis errors gracefully', async () => {
      const cacheKey = 'email:template:user-123:contact-456:hash123';

      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await service.get(cacheKey);

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value with 1-hour TTL', async () => {
      const cacheKey = 'email:template:user-123:contact-456:hash123';
      const value = { formal: { subject: 'Test', body: 'Body' } };

      mockRedis.setex.mockResolvedValue('OK');

      await service.set(cacheKey, value);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        cacheKey,
        3600, // 1 hour in seconds
        JSON.stringify(value)
      );
    });

    it('should handle Redis errors gracefully', async () => {
      const cacheKey = 'email:template:user-123:contact-456:hash123';
      const value = { formal: { subject: 'Test', body: 'Body' } };

      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw error
      await expect(service.set(cacheKey, value)).resolves.not.toThrow();
    });
  });

  describe('invalidate', () => {
    it('should delete cache entries by pattern', async () => {
      const userId = 'user-123';
      const contactId = 'contact-456';
      const keys = ['email:template:user-123:contact-456:hash1', 'email:template:user-123:contact-456:hash2'];

      mockRedis.keys.mockResolvedValue(keys);
      mockRedis.del.mockResolvedValue(2);

      await service.invalidate(userId, contactId);

      expect(mockRedis.keys).toHaveBeenCalledWith(`email:template:${userId}:${contactId}:*`);
      expect(mockRedis.del).toHaveBeenCalledWith(...keys);
    });

    it('should handle Redis errors gracefully', async () => {
      const userId = 'user-123';
      const contactId = 'contact-456';

      mockRedis.keys.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw error
      await expect(service.invalidate(userId, contactId)).resolves.not.toThrow();
    });
  });

  describe('getCacheMetrics', () => {
    it('should return cache hit/miss statistics', () => {
      // Simulate some cache operations
      service['cacheHits'] = 30;
      service['cacheMisses'] = 70;

      const metrics = service.getCacheMetrics();

      expect(metrics).toEqual({
        hits: 30,
        misses: 70,
        total: 100,
        hitRate: 0.3, // 30%
      });
    });

    it('should handle zero total requests', () => {
      service['cacheHits'] = 0;
      service['cacheMisses'] = 0;

      const metrics = service.getCacheMetrics();

      expect(metrics).toEqual({
        hits: 0,
        misses: 0,
        total: 0,
        hitRate: 0,
      });
    });

    it('should reset metrics after retrieval', () => {
      service['cacheHits'] = 50;
      service['cacheMisses'] = 50;

      service.getCacheMetrics();

      expect(service['cacheHits']).toBe(0);
      expect(service['cacheMisses']).toBe(0);
    });
  });

  describe('cache metrics tracking', () => {
    it('should increment cache hits on successful get', async () => {
      const cacheKey = 'email:template:user-123:contact-456:hash123';
      const cachedValue = { formal: { subject: 'Test' } };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedValue));

      await service.get(cacheKey);

      const metrics = service.getCacheMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(0);
    });

    it('should increment cache misses on null get', async () => {
      const cacheKey = 'email:template:user-123:contact-456:hash123';

      mockRedis.get.mockResolvedValue(null);

      await service.get(cacheKey);

      const metrics = service.getCacheMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should close Redis connection on module destroy', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await service.onModuleDestroy();

      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it('should handle quit errors gracefully', async () => {
      mockRedis.quit.mockRejectedValue(new Error('Connection already closed'));

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});
