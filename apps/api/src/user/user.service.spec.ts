import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaClient } from '@relationhub/database';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaClient;

  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaClient>(PrismaClient);

    jest.clearAllMocks();
  });

  describe('findBySupabaseId', () => {
    it('should find user by supabaseId', async () => {
      const mockUser = {
        id: 'user-123',
        supabaseId: 'supabase-uuid-456',
        email: 'test@example.com',
        name: 'Test User',
        profilePicture: null,
        provider: 'google',
        settings: null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findBySupabaseId('supabase-uuid-456');

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { supabaseId: 'supabase-uuid-456' },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await service.findBySupabaseId('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('syncUserFromSupabase', () => {
    const mockSupabaseUser = {
      id: 'supabase-uuid-789',
      email: 'newuser@example.com',
      user_metadata: {
        full_name: 'New User',
        avatar_url: 'https://example.com/avatar.jpg',
      },
      app_metadata: {
        provider: 'google',
      },
    };

    it('should create new user if not exists', async () => {
      const expectedUser = {
        id: 'new-user-id',
        supabaseId: 'supabase-uuid-789',
        email: 'newuser@example.com',
        name: 'New User',
        profilePicture: 'https://example.com/avatar.jpg',
        provider: 'google',
        settings: null,
        lastLoginAt: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.upsert.mockResolvedValue(expectedUser);

      const result = await service.syncUserFromSupabase(mockSupabaseUser);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaClient.user.upsert).toHaveBeenCalledWith({
        where: { supabaseId: 'supabase-uuid-789' },
        update: {
          name: 'New User',
          profilePicture: 'https://example.com/avatar.jpg',
          lastLoginAt: expect.any(Date),
        },
        create: {
          supabaseId: 'supabase-uuid-789',
          email: 'newuser@example.com',
          name: 'New User',
          profilePicture: 'https://example.com/avatar.jpg',
          provider: 'google',
          lastLoginAt: expect.any(Date),
        },
      });
    });

    it('should update existing user on subsequent login', async () => {
      const updatedUser = {
        id: 'existing-user-id',
        supabaseId: 'supabase-uuid-789',
        email: 'newuser@example.com',
        name: 'New User',
        profilePicture: 'https://example.com/avatar.jpg',
        provider: 'google',
        settings: null,
        lastLoginAt: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.upsert.mockResolvedValue(updatedUser);

      const result = await service.syncUserFromSupabase(mockSupabaseUser);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaClient.user.upsert).toHaveBeenCalledWith({
        where: { supabaseId: 'supabase-uuid-789' },
        update: {
          name: 'New User',
          profilePicture: 'https://example.com/avatar.jpg',
          lastLoginAt: expect.any(Date),
        },
        create: {
          supabaseId: 'supabase-uuid-789',
          email: 'newuser@example.com',
          name: 'New User',
          profilePicture: 'https://example.com/avatar.jpg',
          provider: 'google',
          lastLoginAt: expect.any(Date),
        },
      });
    });

    it('should handle user without name metadata', async () => {
      const userWithoutName = {
        id: 'supabase-uuid-123',
        email: 'minimal@example.com',
        user_metadata: {},
        app_metadata: {
          provider: 'email',
        },
      };

      const expectedUser = {
        id: 'new-id',
        supabaseId: 'supabase-uuid-123',
        email: 'minimal@example.com',
        name: null,
        profilePicture: null,
        provider: 'email',
        settings: null,
        lastLoginAt: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.upsert.mockResolvedValue(expectedUser);

      await service.syncUserFromSupabase(userWithoutName);

      expect(mockPrismaClient.user.upsert).toHaveBeenCalledWith({
        where: { supabaseId: 'supabase-uuid-123' },
        update: {
          name: null,
          profilePicture: null,
          lastLoginAt: expect.any(Date),
        },
        create: {
          supabaseId: 'supabase-uuid-123',
          email: 'minimal@example.com',
          name: null,
          profilePicture: null,
          provider: 'email',
          lastLoginAt: expect.any(Date),
        },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: 'user-123',
        supabaseId: 'supabase-uuid-456',
        email: 'test@example.com',
        name: 'Updated Name',
        profilePicture: 'https://example.com/new-avatar.jpg',
        provider: 'google',
        settings: null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('supabase-uuid-456', {
        name: 'Updated Name',
        profilePicture: 'https://example.com/new-avatar.jpg',
      });

      expect(result).toEqual(updatedUser);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { supabaseId: 'supabase-uuid-456' },
        data: {
          name: 'Updated Name',
          profilePicture: 'https://example.com/new-avatar.jpg',
        },
      });
    });

    it('should update only provided fields', async () => {
      const updatedUser = {
        id: 'user-123',
        supabaseId: 'supabase-uuid-456',
        email: 'test@example.com',
        name: 'Updated Name',
        profilePicture: null,
        provider: 'google',
        settings: null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.update.mockResolvedValue(updatedUser);

      await service.updateProfile('supabase-uuid-456', {
        name: 'Updated Name',
      });

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { supabaseId: 'supabase-uuid-456' },
        data: {
          name: 'Updated Name',
        },
      });
    });
  });
});
