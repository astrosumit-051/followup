import { describe, it, expect, beforeEach, vi } from 'vitest';
import { User, PrismaClient } from '@prisma/client';

// Create a mock Prisma Client using Vitest's vi.fn()
const prismaMock = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
} as unknown as PrismaClient;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('User Model', () => {
  describe('User with Authentication Fields', () => {
    it('should create a new user with supabaseId and provider', async () => {
      const mockUser: User = {
        id: 'clx123abc',
        supabaseId: 'supabase-auth-uuid-123',
        email: 'test@example.com',
        name: 'John Doe',
        profilePicture: 'https://example.com/avatar.jpg',
        provider: 'google',
        settings: null,
        lastLoginAt: new Date('2025-10-04T10:00:00Z'),
        createdAt: new Date('2025-10-04T09:00:00Z'),
        updatedAt: new Date('2025-10-04T10:00:00Z'),
      };

      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await prismaMock.user.create({
        data: {
          supabaseId: 'supabase-auth-uuid-123',
          email: 'test@example.com',
          name: 'John Doe',
          profilePicture: 'https://example.com/avatar.jpg',
          provider: 'google',
          lastLoginAt: new Date('2025-10-04T10:00:00Z'),
        },
      });

      expect(result).toEqual(mockUser);
      expect(result.supabaseId).toBe('supabase-auth-uuid-123');
      expect(result.provider).toBe('google');
      expect(result.lastLoginAt).toEqual(new Date('2025-10-04T10:00:00Z'));
    });

    it('should find user by supabaseId', async () => {
      const mockUser: User = {
        id: 'clx123abc',
        supabaseId: 'supabase-auth-uuid-123',
        email: 'test@example.com',
        name: 'John Doe',
        profilePicture: null,
        provider: 'email',
        settings: null,
        lastLoginAt: new Date('2025-10-04T10:00:00Z'),
        createdAt: new Date('2025-10-04T09:00:00Z'),
        updatedAt: new Date('2025-10-04T10:00:00Z'),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await prismaMock.user.findUnique({
        where: { supabaseId: 'supabase-auth-uuid-123' },
      });

      expect(result).toEqual(mockUser);
      expect(result?.supabaseId).toBe('supabase-auth-uuid-123');
    });

    it('should update lastLoginAt on subsequent logins', async () => {
      const initialDate = new Date('2025-10-04T09:00:00Z');
      const updatedDate = new Date('2025-10-04T15:00:00Z');

      const mockUser: User = {
        id: 'clx123abc',
        supabaseId: 'supabase-auth-uuid-123',
        email: 'test@example.com',
        name: 'John Doe',
        profilePicture: null,
        provider: 'google',
        settings: null,
        lastLoginAt: updatedDate,
        createdAt: initialDate,
        updatedAt: updatedDate,
      };

      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await prismaMock.user.update({
        where: { supabaseId: 'supabase-auth-uuid-123' },
        data: { lastLoginAt: updatedDate },
      });

      expect(result.lastLoginAt).toEqual(updatedDate);
      expect(result.lastLoginAt).not.toEqual(initialDate);
    });

    it('should create user with LinkedIn provider', async () => {
      const mockUser: User = {
        id: 'clx456def',
        supabaseId: 'supabase-auth-uuid-456',
        email: 'linkedin@example.com',
        name: 'Jane Smith',
        profilePicture: 'https://linkedin.com/photo.jpg',
        provider: 'linkedin_oidc',
        settings: null,
        lastLoginAt: new Date('2025-10-04T11:00:00Z'),
        createdAt: new Date('2025-10-04T11:00:00Z'),
        updatedAt: new Date('2025-10-04T11:00:00Z'),
      };

      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await prismaMock.user.create({
        data: {
          supabaseId: 'supabase-auth-uuid-456',
          email: 'linkedin@example.com',
          name: 'Jane Smith',
          profilePicture: 'https://linkedin.com/photo.jpg',
          provider: 'linkedin_oidc',
          lastLoginAt: new Date('2025-10-04T11:00:00Z'),
        },
      });

      expect(result.provider).toBe('linkedin_oidc');
      expect(result.email).toBe('linkedin@example.com');
    });

    it('should handle users with email/password provider', async () => {
      const mockUser: User = {
        id: 'clx789ghi',
        supabaseId: 'supabase-auth-uuid-789',
        email: 'email@example.com',
        name: 'Bob Johnson',
        profilePicture: null,
        provider: 'email',
        settings: null,
        lastLoginAt: new Date('2025-10-04T12:00:00Z'),
        createdAt: new Date('2025-10-04T12:00:00Z'),
        updatedAt: new Date('2025-10-04T12:00:00Z'),
      };

      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await prismaMock.user.create({
        data: {
          supabaseId: 'supabase-auth-uuid-789',
          email: 'email@example.com',
          name: 'Bob Johnson',
          provider: 'email',
          lastLoginAt: new Date('2025-10-04T12:00:00Z'),
        },
      });

      expect(result.provider).toBe('email');
      expect(result.profilePicture).toBeNull();
    });

    it('should enforce unique constraint on supabaseId', async () => {
      const duplicateError = new Error('Unique constraint failed on the fields: (`supabaseId`)');

      prismaMock.user.create.mockRejectedValue(duplicateError);

      await expect(
        prismaMock.user.create({
          data: {
            supabaseId: 'duplicate-supabase-id',
            email: 'duplicate@example.com',
          },
        })
      ).rejects.toThrow('Unique constraint failed on the fields: (`supabaseId`)');
    });

    it('should allow nullable provider and lastLoginAt fields', async () => {
      const mockUser: User = {
        id: 'clx000xyz',
        supabaseId: 'supabase-auth-uuid-000',
        email: 'minimal@example.com',
        name: null,
        profilePicture: null,
        provider: null,
        settings: null,
        lastLoginAt: null,
        createdAt: new Date('2025-10-04T08:00:00Z'),
        updatedAt: new Date('2025-10-04T08:00:00Z'),
      };

      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await prismaMock.user.create({
        data: {
          supabaseId: 'supabase-auth-uuid-000',
          email: 'minimal@example.com',
        },
      });

      expect(result.provider).toBeNull();
      expect(result.lastLoginAt).toBeNull();
      expect(result.name).toBeNull();
    });
  });

  describe('User Query Operations', () => {
    it('should find user by email', async () => {
      const mockUser: User = {
        id: 'clx111',
        supabaseId: 'supabase-111',
        email: 'find@example.com',
        name: 'Find Me',
        profilePicture: null,
        provider: 'google',
        settings: null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await prismaMock.user.findUnique({
        where: { email: 'find@example.com' },
      });

      expect(result?.email).toBe('find@example.com');
    });

    it('should return null when user not found by supabaseId', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await prismaMock.user.findUnique({
        where: { supabaseId: 'non-existent-id' },
      });

      expect(result).toBeNull();
    });
  });
});
