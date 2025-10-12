import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ValidationPipe } from '@nestjs/common';

// Mock jose module to avoid ES module issues
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: UserService;

  const mockUserService = {
    updateProfile: jest.fn(),
    findBySupabaseId: jest.fn(),
    syncUserFromSupabase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  describe('me', () => {
    it('should return current user from JWT context', async () => {
      const mockUser = {
        id: 1,
        supabaseId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        profilePicture: 'https://example.com/avatar.jpg',
        provider: 'google',
        role: 'authenticated',
      };

      const result = await resolver.me(mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should return user with all profile fields', async () => {
      const mockUser = {
        id: 2,
        supabaseId: 'user-456',
        email: 'john@example.com',
        name: 'John Doe',
        profilePicture: null,
        provider: 'email',
        role: 'authenticated',
      };

      const result = await resolver.me(mockUser);

      expect(result).toEqual(mockUser);
      expect(result.id).toBe(2);
      expect(result.email).toBe('john@example.com');
      expect(result.name).toBe('John Doe');
    });

    it('should handle user with minimal profile data', async () => {
      const mockUser = {
        id: 3,
        supabaseId: 'user-789',
        email: 'minimal@example.com',
        name: null,
        profilePicture: null,
        provider: 'email',
        role: 'authenticated',
      };

      const result = await resolver.me(mockUser);

      expect(result).toEqual(mockUser);
      expect(result.profilePicture).toBeNull();
      expect(result.name).toBeNull();
    });
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: 1,
      supabaseId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      profilePicture: null,
      provider: 'google',
      role: 'authenticated',
    };

    it('should update user profile with name', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Updated Name',
      };

      const updatedUser = {
        id: 1,
        supabaseId: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
        profilePicture: null,
        provider: 'google',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(updatedUser);

      const result = await resolver.updateProfile(mockUser, updateDto);

      expect(result).toBe(1);
      expect(userService.updateProfile).toHaveBeenCalledWith('user-123', updateDto);
    });

    it('should update user profile with profilePicture', async () => {
      const updateDto: UpdateProfileDto = {
        profilePicture: 'https://example.com/new-avatar.jpg',
      };

      const updatedUser = {
        id: 1,
        supabaseId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        profilePicture: 'https://example.com/new-avatar.jpg',
        provider: 'google',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(updatedUser);

      const result = await resolver.updateProfile(mockUser, updateDto);

      expect(result).toBe(1);
      expect(userService.updateProfile).toHaveBeenCalledWith('user-123', updateDto);
    });

    it('should update both name and profilePicture', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'John Doe',
        profilePicture: 'https://example.com/john.jpg',
      };

      const updatedUser = {
        id: 2,
        supabaseId: 'user-456',
        email: 'john@example.com',
        name: 'John Doe',
        profilePicture: 'https://example.com/john.jpg',
        provider: 'email',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(updatedUser);

      const result = await resolver.updateProfile(mockUser, updateDto);

      expect(result).toBe(2);
      expect(userService.updateProfile).toHaveBeenCalledWith('user-123', updateDto);
    });

    it('should use supabaseId from current user for authorization', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'New Name',
      };

      const updatedUser = {
        id: 1,
        supabaseId: 'user-123',
        email: 'test@example.com',
        name: 'New Name',
        profilePicture: null,
        provider: 'google',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(updatedUser);

      await resolver.updateProfile(mockUser, updateDto);

      // Verify that supabaseId is passed to service for proper authorization
      expect(userService.updateProfile).toHaveBeenCalledWith(
        mockUser.supabaseId,
        updateDto,
      );
    });

    it('should return updated user id', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Test',
      };

      const updatedUser = {
        id: 42,
        supabaseId: 'user-123',
        email: 'test@example.com',
        name: 'Test',
        profilePicture: null,
        provider: 'google',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(updatedUser);

      const result = await resolver.updateProfile(mockUser, updateDto);

      expect(result).toBe(42);
    });

    it('should handle service errors gracefully', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Test',
      };

      mockUserService.updateProfile.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        resolver.updateProfile(mockUser, updateDto),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle user not found error', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Test',
      };

      mockUserService.updateProfile.mockRejectedValue(
        new Error('User with Supabase ID user-123 not found'),
      );

      await expect(
        resolver.updateProfile(mockUser, updateDto),
      ).rejects.toThrow('User with Supabase ID user-123 not found');
    });

    it('should handle empty update DTO', async () => {
      const updateDto: UpdateProfileDto = {};

      const updatedUser = {
        id: 1,
        supabaseId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        profilePicture: null,
        provider: 'google',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(updatedUser);

      const result = await resolver.updateProfile(mockUser, updateDto);

      expect(result).toBe(1);
      expect(userService.updateProfile).toHaveBeenCalledWith('user-123', {});
    });
  });

  describe('Resolver Metadata', () => {
    it('should be decorated with @Resolver', () => {
      const metadata = Reflect.getMetadata('graphql:resolver_type', UserResolver);
      expect(metadata).toBeDefined();
    });

    it('should have me query decorated with @Query', () => {
      const metadata = Reflect.getMetadata(
        'graphql:resolver_name',
        resolver.me,
      );
      expect(metadata).toBe('me');
    });

    it('should have updateProfile mutation decorated with @Mutation', () => {
      const metadata = Reflect.getMetadata(
        'graphql:resolver_name',
        resolver.updateProfile,
      );
      expect(metadata).toBe('updateProfile');
    });
  });
});
