import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from './supabase.service';
import { UserService } from '../user/user.service';
import { PrismaClient } from '@cordiq/database';
import * as jose from 'jose';

// Mock jose module
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

describe('AuthGuard Security Tests', () => {
  let authGuard: AuthGuard;
  let supabaseService: SupabaseService;
  let userService: UserService;
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
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

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
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

  describe('JWT Tampering Detection', () => {
    it('should reject tampered JWT signature', async () => {
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.tampered_signature';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(tamperedToken);
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('signature verification failed')
      );

      const context = createMockExecutionContext(`Bearer ${tamperedToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(authGuard.canActivate(context)).rejects.toThrow('signature verification failed');
    });

    it('should reject JWT with modified payload', async () => {
      const modifiedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.modified_payload.signature';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(modifiedToken);
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('invalid token')
      );

      const context = createMockExecutionContext(`Bearer ${modifiedToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(authGuard.canActivate(context)).rejects.toThrow('invalid token');
    });

    it('should reject JWT with invalid header', async () => {
      const invalidHeaderToken = 'invalid_header.eyJzdWIiOiJ1c2VyLTEyMyJ9.signature';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(invalidHeaderToken);
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('invalid compact JWS')
      );

      const context = createMockExecutionContext(`Bearer ${invalidHeaderToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject JWT signed with wrong algorithm', async () => {
      const wrongAlgoToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLTEyMyJ9.';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(wrongAlgoToken);
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('algorithm not allowed')
      );

      const context = createMockExecutionContext(`Bearer ${wrongAlgoToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Token Expiration Enforcement', () => {
    it('should reject expired JWT token', async () => {
      const expiredToken = 'expired.jwt.token';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(expiredToken);
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('"exp" claim timestamp check failed')
      );

      const context = createMockExecutionContext(`Bearer ${expiredToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(authGuard.canActivate(context)).rejects.toThrow('"exp" claim timestamp check failed');
    });

    it('should reject token with future "iat" (issued at) claim', async () => {
      const futureToken = 'future.iat.token';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(futureToken);
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('"iat" claim timestamp check failed')
      );

      const context = createMockExecutionContext(`Bearer ${futureToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject token with invalid "nbf" (not before) claim', async () => {
      const notYetValidToken = 'not.yet.valid.token';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(notYetValidToken);
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('"nbf" claim timestamp check failed')
      );

      const context = createMockExecutionContext(`Bearer ${notYetValidToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Missing or Invalid Claims', () => {
    it('should reject token without required "sub" claim', async () => {
      const noSubToken = 'no.sub.claim.token';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(noSubToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        email: 'test@example.com',
        // Missing 'sub' claim
      });
      jest.spyOn(supabaseService, 'getUserFromToken').mockRejectedValue(
        new Error('Failed to get user from Supabase: invalid JWT')
      );

      const context = createMockExecutionContext(`Bearer ${noSubToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(authGuard.canActivate(context)).rejects.toThrow('Failed to get user from Supabase');
    });

    it('should reject token with malformed "sub" claim', async () => {
      const malformedSubToken = 'malformed.sub.token';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(malformedSubToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: '', // Empty sub claim
        email: 'test@example.com',
      });
      jest.spyOn(supabaseService, 'getUserIdFromToken').mockRejectedValue(
        new Error('Token missing sub claim (user ID)')
      );

      const context = createMockExecutionContext(`Bearer ${malformedSubToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Authorization Header Validation', () => {
    it('should reject request without authorization header', async () => {
      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(null);

      const context = createMockExecutionContext();

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(authGuard.canActivate(context)).rejects.toThrow('Missing authorization token');
    });

    it('should reject malformed authorization header (missing Bearer prefix)', async () => {
      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(null);

      const context = createMockExecutionContext('InvalidPrefix token123');

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(authGuard.canActivate(context)).rejects.toThrow('Missing authorization token');
    });

    it('should reject authorization header with empty token', async () => {
      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(null);

      const context = createMockExecutionContext('Bearer ');

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject authorization header with only whitespace', async () => {
      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(null);

      const context = createMockExecutionContext('Bearer    ');

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Token Injection Attacks', () => {
    it('should reject SQL injection attempt in token', async () => {
      const sqlInjectionToken = "Bearer '; DROP TABLE users; --";

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue("'; DROP TABLE users; --");
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('invalid token')
      );

      const context = createMockExecutionContext(sqlInjectionToken);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject XSS attempt in token', async () => {
      const xssToken = 'Bearer <script>alert("xss")</script>';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue('<script>alert("xss")</script>');
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('invalid token')
      );

      const context = createMockExecutionContext(xssToken);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject null byte injection in token', async () => {
      const nullByteToken = 'Bearer token\x00malicious';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue('token\x00malicious');
      jest.spyOn(supabaseService, 'verifyToken').mockRejectedValue(
        new Error('invalid token')
      );

      const context = createMockExecutionContext(nullByteToken);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('User Sync Security', () => {
    it('should throw UnauthorizedException when user fetch from Supabase fails', async () => {
      const validToken = 'valid.token';

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(validToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserFromToken').mockRejectedValue(
        new Error('Failed to get user from Supabase: API error')
      );

      const context = createMockExecutionContext(`Bearer ${validToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(authGuard.canActivate(context)).rejects.toThrow('Failed to get user from Supabase: API error');
    });

    it('should throw UnauthorizedException when user sync to database fails', async () => {
      const validToken = 'valid.token';
      const mockSupabaseUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
        },
        app_metadata: {
          provider: 'google',
        },
      };

      jest.spyOn(supabaseService, 'extractTokenFromHeader').mockReturnValue(validToken);
      jest.spyOn(supabaseService, 'verifyToken').mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'authenticated',
      });
      jest.spyOn(supabaseService, 'getUserFromToken').mockResolvedValue(mockSupabaseUser);
      jest.spyOn(userService, 'syncUserFromSupabase').mockRejectedValue(
        new Error('Database connection failed')
      );

      const context = createMockExecutionContext(`Bearer ${validToken}`);

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(authGuard.canActivate(context)).rejects.toThrow('Database connection failed');
    });
  });
});
