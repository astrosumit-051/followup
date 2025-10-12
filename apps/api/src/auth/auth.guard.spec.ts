import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from './supabase.service';
import { UserService } from '../user/user.service';

// Mock jose module to avoid ES module issues
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let supabaseService: SupabaseService;
  let userService: UserService;

  const mockSupabaseService = {
    extractTokenFromHeader: jest.fn(),
    verifyToken: jest.fn(),
    getUserIdFromToken: jest.fn(),
    getUserFromToken: jest.fn(),
  };

  const mockUserService = {
    syncUserFromSupabase: jest.fn(),
    findBySupabaseId: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
    return {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
      }),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow request with valid JWT token', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'authenticated',
      };

      const mockSupabaseUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
        app_metadata: { provider: 'email' },
      };

      const mockDbUser = {
        id: 1,
        supabaseId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        profilePicture: null,
        provider: 'email',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabaseService.extractTokenFromHeader.mockReturnValue('valid.token');
      mockSupabaseService.verifyToken.mockResolvedValue(mockPayload);
      mockSupabaseService.getUserFromToken.mockResolvedValue(mockSupabaseUser);
      mockUserService.syncUserFromSupabase.mockResolvedValue(mockDbUser);

      const context = createMockExecutionContext('Bearer valid.token');
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockSupabaseService.extractTokenFromHeader).toHaveBeenCalledWith(
        'Bearer valid.token',
      );
      expect(mockSupabaseService.verifyToken).toHaveBeenCalledWith('valid.token');
      expect(mockSupabaseService.getUserFromToken).toHaveBeenCalledWith('valid.token');
      expect(mockUserService.syncUserFromSupabase).toHaveBeenCalledWith(mockSupabaseUser);
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      mockSupabaseService.extractTokenFromHeader.mockReturnValue(null);

      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing authorization token',
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockSupabaseService.extractTokenFromHeader.mockReturnValue('invalid.token');
      mockSupabaseService.verifyToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      const context = createMockExecutionContext('Bearer invalid.token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      mockSupabaseService.extractTokenFromHeader.mockReturnValue('expired.token');
      mockSupabaseService.verifyToken.mockRejectedValue(
        new Error('Token expired'),
      );

      const context = createMockExecutionContext('Bearer expired.token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow('Token expired');
    });

    it('should throw UnauthorizedException when token is malformed', async () => {
      mockSupabaseService.extractTokenFromHeader.mockReturnValue('malformed');
      mockSupabaseService.verifyToken.mockRejectedValue(
        new Error('Malformed token'),
      );

      const context = createMockExecutionContext('Bearer malformed');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Malformed token',
      );
    });

    it('should attach user payload to request object', async () => {
      const mockPayload = {
        sub: 'user-456',
        email: 'user@example.com',
        role: 'authenticated',
      };

      const mockSupabaseUser = {
        id: 'user-456',
        email: 'user@example.com',
        user_metadata: { full_name: 'User Test', avatar_url: 'https://example.com/avatar.jpg' },
        app_metadata: { provider: 'google' },
      };

      const mockDbUser = {
        id: 2,
        supabaseId: 'user-456',
        email: 'user@example.com',
        name: 'User Test',
        profilePicture: 'https://example.com/avatar.jpg',
        provider: 'google',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest: any = {
        headers: {
          authorization: 'Bearer valid.token',
        },
      };

      mockSupabaseService.extractTokenFromHeader.mockReturnValue('valid.token');
      mockSupabaseService.verifyToken.mockResolvedValue(mockPayload);
      mockSupabaseService.getUserFromToken.mockResolvedValue(mockSupabaseUser);
      mockUserService.syncUserFromSupabase.mockResolvedValue(mockDbUser);

      const context = {
        getType: () => 'http',
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      await guard.canActivate(context);

      expect(mockRequest.user).toEqual({
        id: 2,
        supabaseId: 'user-456',
        email: 'user@example.com',
        name: 'User Test',
        profilePicture: 'https://example.com/avatar.jpg',
        provider: 'google',
        role: 'authenticated',
      });
    });

    it('should handle missing Bearer prefix', async () => {
      mockSupabaseService.extractTokenFromHeader.mockReturnValue(null);

      const context = createMockExecutionContext('InvalidFormat token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing authorization token',
      );
    });
  });
});
