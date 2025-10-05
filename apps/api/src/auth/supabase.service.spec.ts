import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

// Mock jose module
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

import * as jose from 'jose';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should verify a valid JWT token and return payload', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'authenticated',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      // Mock jose.jwtVerify to return valid payload
      jest.spyOn(jose, 'jwtVerify').mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'HS256', typ: 'JWT' },
      } as any);

      const result = await service.verifyToken('valid.jwt.token');

      expect(result).toEqual(mockPayload);
      expect(jose.jwtVerify).toHaveBeenCalledWith(
        'valid.jwt.token',
        expect.any(Uint8Array),
      );
    });

    it('should throw error for invalid JWT token', async () => {
      jest.spyOn(jose, 'jwtVerify').mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken('invalid.token')).rejects.toThrow(
        'Invalid token',
      );
    });

    it('should throw error for expired JWT token', async () => {
      jest
        .spyOn(jose, 'jwtVerify')
        .mockRejectedValue(new Error('Token expired'));

      await expect(service.verifyToken('expired.token')).rejects.toThrow(
        'Token expired',
      );
    });

    it('should throw error for malformed JWT token', async () => {
      jest
        .spyOn(jose, 'jwtVerify')
        .mockRejectedValue(new Error('Malformed token'));

      await expect(service.verifyToken('malformed')).rejects.toThrow(
        'Malformed token',
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const token = service.extractTokenFromHeader(authHeader);

      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token');
    });

    it('should return null for missing Authorization header', () => {
      const token = service.extractTokenFromHeader(undefined);

      expect(token).toBeNull();
    });

    it('should return null for Authorization header without Bearer', () => {
      const authHeader = 'Basic sometoken';
      const token = service.extractTokenFromHeader(authHeader);

      expect(token).toBeNull();
    });

    it('should return null for Authorization header with only Bearer', () => {
      const authHeader = 'Bearer';
      const token = service.extractTokenFromHeader(authHeader);

      expect(token).toBeNull();
    });

    it('should handle Authorization header with extra spaces', () => {
      const authHeader = 'Bearer  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const token = service.extractTokenFromHeader(authHeader);

      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token');
    });

    it('should handle case-insensitive Bearer scheme per RFC 7235', () => {
      const testCases = [
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
        'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
        'BEARER eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
        'BeArEr eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
      ];

      testCases.forEach((authHeader) => {
        const token = service.extractTokenFromHeader(authHeader);
        expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token');
      });
    });
  });

  describe('getUserIdFromToken', () => {
    it('should extract user ID from token payload', async () => {
      const mockPayload = {
        sub: 'supabase-user-uuid-123',
        email: 'user@example.com',
        role: 'authenticated',
      };

      jest.spyOn(jose, 'jwtVerify').mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'HS256', typ: 'JWT' },
      } as any);

      const userId = await service.getUserIdFromToken('valid.token');

      expect(userId).toBe('supabase-user-uuid-123');
    });

    it('should throw error if token has no sub claim', async () => {
      const mockPayload = {
        email: 'user@example.com',
        role: 'authenticated',
      };

      jest.spyOn(jose, 'jwtVerify').mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'HS256', typ: 'JWT' },
      } as any);

      await expect(service.getUserIdFromToken('token.without.sub')).rejects.toThrow();
    });
  });
});
