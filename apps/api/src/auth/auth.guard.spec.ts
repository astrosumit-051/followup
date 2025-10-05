import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from './supabase.service';

// Mock jsonwebtoken module to avoid ES module issues
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    extractTokenFromHeader: jest.fn(),
    verifyToken: jest.fn(),
    getUserIdFromToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    jest.clearAllMocks();
  });

  const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
    return {
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

      mockSupabaseService.extractTokenFromHeader.mockReturnValue('valid.token');
      mockSupabaseService.verifyToken.mockResolvedValue(mockPayload);
      mockSupabaseService.getUserIdFromToken.mockResolvedValue('user-123');

      const context = createMockExecutionContext('Bearer valid.token');
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockSupabaseService.extractTokenFromHeader).toHaveBeenCalledWith(
        'Bearer valid.token',
      );
      expect(mockSupabaseService.verifyToken).toHaveBeenCalledWith('valid.token');
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

      const mockRequest: any = {
        headers: {
          authorization: 'Bearer valid.token',
        },
      };

      mockSupabaseService.extractTokenFromHeader.mockReturnValue('valid.token');
      mockSupabaseService.verifyToken.mockResolvedValue(mockPayload);
      mockSupabaseService.getUserIdFromToken.mockResolvedValue('user-456');

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      await guard.canActivate(context);

      expect(mockRequest.user).toEqual({
        supabaseId: 'user-456',
        email: 'user@example.com',
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
