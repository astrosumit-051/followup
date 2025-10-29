import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from './supabase.service';
import { UserService } from '../user/user.service';
import { PrismaClient } from '@cordiq/database';

// Mock jose module to avoid ES module issues
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

describe('AuthGuard Integration (User Sync)', () => {
  let authGuard: AuthGuard;
  let supabaseService: SupabaseService;
  let userService: UserService;
  let prisma: PrismaClient;

  const mockSupabaseUser = {
    id: 'test-supabase-id-123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    app_metadata: {
      provider: 'google',
    },
  };

  beforeAll(async () => {
    prisma = new PrismaClient();

    // Clean up test data before tests
    await prisma.user.deleteMany({
      where: { supabaseId: mockSupabaseUser.id },
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [
        AuthGuard,
        SupabaseService,
        UserService,
        {
          provide: PrismaClient,
          useValue: prisma,
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.user.deleteMany({
      where: { supabaseId: mockSupabaseUser.id },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Sync on First Login', () => {
    it('should create a new user on first login', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockContext = createMockExecutionContext(mockToken);

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(mockToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: mockSupabaseUser.id,
        email: mockSupabaseUser.email,
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserIdFromToken').mockResolvedValue(mockSupabaseUser.id);
      jest.spyOn(supabaseService, 'getUserFromToken').mockResolvedValue(mockSupabaseUser);

      // Verify user doesn't exist before
      const userBefore = await userService.findBySupabaseId(mockSupabaseUser.id);
      expect(userBefore).toBeNull();

      // Act
      const result = await authGuard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);

      // Verify user was created
      const userAfter = await userService.findBySupabaseId(mockSupabaseUser.id);
      expect(userAfter).not.toBeNull();
      expect(userAfter?.email).toBe(mockSupabaseUser.email);
      expect(userAfter?.name).toBe(mockSupabaseUser.user_metadata.full_name);
      expect(userAfter?.profilePicture).toBe(mockSupabaseUser.user_metadata.avatar_url);
      expect(userAfter?.provider).toBe(mockSupabaseUser.app_metadata.provider);
      expect(userAfter?.lastLoginAt).toBeDefined();
    });

    it('should extract user metadata from OAuth providers', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockContext = createMockExecutionContext(mockToken);

      const googleUser = {
        id: 'google-user-123',
        email: 'google@example.com',
        user_metadata: {
          full_name: 'Google User',
          avatar_url: 'https://lh3.googleusercontent.com/avatar.jpg',
        },
        app_metadata: {
          provider: 'google',
        },
      };

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(mockToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: googleUser.id,
        email: googleUser.email,
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserIdFromToken').mockResolvedValue(googleUser.id);
      jest.spyOn(supabaseService, 'getUserFromToken').mockResolvedValue(googleUser);

      // Act
      await authGuard.canActivate(mockContext);

      // Assert
      const user = await userService.findBySupabaseId(googleUser.id);
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Google User');
      expect(user?.profilePicture).toContain('googleusercontent.com');
      expect(user?.provider).toBe('google');

      // Clean up
      await prisma.user.delete({ where: { supabaseId: googleUser.id } });
    });

    it('should handle users with minimal metadata', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockContext = createMockExecutionContext(mockToken);

      const minimalUser = {
        id: 'minimal-user-123',
        email: 'minimal@example.com',
        user_metadata: {},
        app_metadata: {},
      };

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(mockToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: minimalUser.id,
        email: minimalUser.email,
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserIdFromToken').mockResolvedValue(minimalUser.id);
      jest.spyOn(supabaseService, 'getUserFromToken').mockResolvedValue(minimalUser);

      // Act
      await authGuard.canActivate(mockContext);

      // Assert
      const user = await userService.findBySupabaseId(minimalUser.id);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(minimalUser.email);
      expect(user?.name).toBeNull();
      expect(user?.profilePicture).toBeNull();
      expect(user?.provider).toBeNull();

      // Clean up
      await prisma.user.delete({ where: { supabaseId: minimalUser.id } });
    });
  });

  describe('User Update on Subsequent Logins', () => {
    it('should update lastLoginAt on subsequent logins', async () => {
      // Arrange - Create existing user
      const existingUser = await prisma.user.create({
        data: {
          supabaseId: mockSupabaseUser.id,
          email: mockSupabaseUser.email,
          name: 'Old Name',
          provider: 'google',
          lastLoginAt: new Date('2024-01-01'),
        },
      });

      const mockToken = 'valid-jwt-token';
      const mockContext = createMockExecutionContext(mockToken);

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(mockToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: mockSupabaseUser.id,
        email: mockSupabaseUser.email,
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserIdFromToken').mockResolvedValue(mockSupabaseUser.id);
      jest.spyOn(supabaseService, 'getUserFromToken').mockResolvedValue(mockSupabaseUser);

      // Act
      await authGuard.canActivate(mockContext);

      // Assert
      const updatedUser = await userService.findBySupabaseId(mockSupabaseUser.id);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.lastLoginAt).not.toBeNull();
      expect(updatedUser?.lastLoginAt).not.toEqual(existingUser.lastLoginAt);
      if (updatedUser?.lastLoginAt && existingUser.lastLoginAt) {
        expect(updatedUser.lastLoginAt.getTime()).toBeGreaterThan(existingUser.lastLoginAt.getTime());
      }
    });

    it('should update profile metadata on subsequent logins', async () => {
      // Arrange - Create existing user with old data
      await prisma.user.create({
        data: {
          supabaseId: mockSupabaseUser.id,
          email: 'old@example.com',
          name: 'Old Name',
          profilePicture: 'https://old-avatar.jpg',
          provider: 'google',
          lastLoginAt: new Date('2024-01-01'),
        },
      });

      const updatedSupabaseUser = {
        ...mockSupabaseUser,
        email: 'updated@example.com',
        user_metadata: {
          full_name: 'Updated Name',
          avatar_url: 'https://new-avatar.jpg',
        },
      };

      const mockToken = 'valid-jwt-token';
      const mockContext = createMockExecutionContext(mockToken);

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(mockToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: updatedSupabaseUser.id,
        email: updatedSupabaseUser.email,
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserIdFromToken').mockResolvedValue(updatedSupabaseUser.id);
      jest.spyOn(supabaseService, 'getUserFromToken').mockResolvedValue(updatedSupabaseUser);

      // Act
      await authGuard.canActivate(mockContext);

      // Assert
      const updatedUser = await userService.findBySupabaseId(mockSupabaseUser.id);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.email).toBe('updated@example.com');
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.profilePicture).toBe('https://new-avatar.jpg');
    });

    it('should not duplicate users on multiple logins', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockContext = createMockExecutionContext(mockToken);

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(mockToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: mockSupabaseUser.id,
        email: mockSupabaseUser.email,
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserIdFromToken').mockResolvedValue(mockSupabaseUser.id);
      jest.spyOn(supabaseService, 'getUserFromToken').mockResolvedValue(mockSupabaseUser);

      // Act - Login multiple times
      await authGuard.canActivate(mockContext);
      await authGuard.canActivate(mockContext);
      await authGuard.canActivate(mockContext);

      // Assert - Should only have one user
      const users = await prisma.user.findMany({
        where: { supabaseId: mockSupabaseUser.id },
      });
      expect(users).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw UnauthorizedException if user sync fails', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockContext = createMockExecutionContext(mockToken);

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(mockToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: mockSupabaseUser.id,
        email: mockSupabaseUser.email,
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserIdFromToken').mockResolvedValue(mockSupabaseUser.id);
      jest.spyOn(supabaseService, 'getUserFromToken').mockRejectedValue(new Error('Supabase API error'));

      // Act & Assert
      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });
  });
});

// Helper function to create mock execution context
function createMockExecutionContext(token: string): ExecutionContext {
  const mockRequest = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };

  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as ExecutionContext;
}
