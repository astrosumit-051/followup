import { Test, TestingModule } from '@nestjs/testing';
import { GmailOAuthService } from './gmail-oauth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

describe('GmailOAuthService', () => {
  let service: GmailOAuthService;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    gmailToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-client-secret',
        GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/gmail/callback',
        ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', // 64 hex chars = 32 bytes
      };
      return config[key];
    }),
  };

  const mockUserId = 'user-123';
  const mockAuthCode = 'auth-code-xyz';
  const mockAccessToken = 'ya29.access-token';
  const mockRefreshToken = 'refresh-token-xyz';
  const mockEmailAddress = 'user@gmail.com';
  const mockExpiresAt = new Date('2025-10-15T13:00:00Z');

  let encryptedAccessToken: string;
  let encryptedRefreshToken: string;

  const mockGmailToken = {
    id: 'token-123',
    userId: mockUserId,
    get accessToken() {
      return encryptedAccessToken;
    },
    get refreshToken() {
      return encryptedRefreshToken;
    },
    expiresAt: mockExpiresAt,
    emailAddress: mockEmailAddress,
    scope: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastUsedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailOAuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GmailOAuthService>(GmailOAuthService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    // Encrypt mock tokens using the service's encrypt method
    encryptedAccessToken = (service as any).encrypt(mockAccessToken);
    encryptedRefreshToken = (service as any).encrypt(mockRefreshToken);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthorizationUrl', () => {
    it('should generate OAuth2 authorization URL with correct scopes', () => {
      const url = service.getAuthorizationUrl(mockUserId);

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fgmail%2Fcallback');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=');
      expect(url).toContain('gmail.send');
      expect(url).toContain('gmail.readonly');
      expect(url).toContain('access_type=offline');
      expect(url).toContain('prompt=consent');
      expect(url).toContain(`state=${mockUserId}`);
    });
  });

  describe('handleCallback', () => {
    it('should exchange auth code for tokens and store encrypted tokens in database', async () => {
      // Mock OAuth2Client.getToken
      const mockGetToken = jest.fn().mockResolvedValue({
        tokens: {
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          expiry_date: mockExpiresAt.getTime(),
        },
      });

      // Mock OAuth2Client.getTokenInfo
      const mockGetTokenInfo = jest.fn().mockResolvedValue({
        email: mockEmailAddress,
        scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
      });

      jest.spyOn(OAuth2Client.prototype, 'getToken').mockImplementation(mockGetToken);
      jest.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockImplementation(mockGetTokenInfo);

      mockPrismaService.gmailToken.create.mockResolvedValue(mockGmailToken);

      const result = await service.handleCallback(mockUserId, mockAuthCode);

      expect(mockGetToken).toHaveBeenCalledWith(mockAuthCode);
      expect(mockGetTokenInfo).toHaveBeenCalledWith(mockAccessToken);
      expect(prisma.gmailToken.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          accessToken: expect.any(String), // Encrypted value
          refreshToken: expect.any(String), // Encrypted value
          expiresAt: expect.any(Date),
          emailAddress: mockEmailAddress,
          scope: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
        },
      });
      expect(result).toEqual(mockGmailToken);
    });

    it('should update existing token if user already has Gmail connected', async () => {
      const mockGetToken = jest.fn().mockResolvedValue({
        tokens: {
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          expiry_date: mockExpiresAt.getTime(),
        },
      });

      const mockGetTokenInfo = jest.fn().mockResolvedValue({
        email: mockEmailAddress,
        scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
      });

      jest.spyOn(OAuth2Client.prototype, 'getToken').mockImplementation(mockGetToken);
      jest.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockImplementation(mockGetTokenInfo);

      mockPrismaService.gmailToken.findUnique.mockResolvedValue(mockGmailToken);
      mockPrismaService.gmailToken.update.mockResolvedValue(mockGmailToken);

      const result = await service.handleCallback(mockUserId, mockAuthCode);

      expect(prisma.gmailToken.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresAt: expect.any(Date),
          emailAddress: mockEmailAddress,
          scope: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
        },
      });
      expect(result).toEqual(mockGmailToken);
    });

    it('should throw BadRequestException if auth code exchange fails', async () => {
      const mockGetToken = jest.fn().mockRejectedValue(new Error('Invalid auth code'));
      jest.spyOn(OAuth2Client.prototype, 'getToken').mockImplementation(mockGetToken);

      await expect(
        service.handleCallback(mockUserId, 'invalid-code'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshTokenIfNeeded', () => {
    it('should return existing access token if not expired', async () => {
      const futureExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now
      const validToken = { ...mockGmailToken, expiresAt: futureExpiresAt };

      mockPrismaService.gmailToken.findUnique.mockResolvedValue(validToken);

      const result = await service.refreshTokenIfNeeded(mockUserId);

      expect(prisma.gmailToken.update).not.toHaveBeenCalled();
      expect(result).toBe(mockAccessToken); // Returns decrypted token
    });

    it('should refresh access token if expired', async () => {
      const expiredExpiresAt = new Date(Date.now() - 3600 * 1000); // 1 hour ago
      const expiredToken = { ...mockGmailToken, expiresAt: expiredExpiresAt };

      const newAccessToken = 'ya29.new-access-token';
      const newExpiresAt = new Date(Date.now() + 3600 * 1000);

      const mockRefreshAccessToken = jest.fn().mockResolvedValue({
        credentials: {
          access_token: newAccessToken,
          expiry_date: newExpiresAt.getTime(),
        },
      });

      jest.spyOn(OAuth2Client.prototype, 'refreshAccessToken').mockImplementation(mockRefreshAccessToken);

      mockPrismaService.gmailToken.findUnique.mockResolvedValue(expiredToken);
      mockPrismaService.gmailToken.update.mockResolvedValue({
        ...expiredToken,
        expiresAt: newExpiresAt,
      });

      const result = await service.refreshTokenIfNeeded(mockUserId);

      expect(mockRefreshAccessToken).toHaveBeenCalled();
      expect(prisma.gmailToken.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          accessToken: expect.any(String),
          expiresAt: newExpiresAt,
        },
      });
    });

    it('should throw NotFoundException if user has no Gmail token', async () => {
      mockPrismaService.gmailToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshTokenIfNeeded(mockUserId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.refreshTokenIfNeeded(mockUserId),
      ).rejects.toThrow('Gmail account not connected');
    });
  });

  describe('disconnect', () => {
    it('should revoke token with Google API and delete from database', async () => {
      const mockRevokeToken = jest.fn().mockResolvedValue({});
      jest.spyOn(OAuth2Client.prototype, 'revokeToken').mockImplementation(mockRevokeToken);

      mockPrismaService.gmailToken.findUnique.mockResolvedValue(mockGmailToken);
      mockPrismaService.gmailToken.delete.mockResolvedValue(mockGmailToken);

      const result = await service.disconnect(mockUserId);

      expect(mockRevokeToken).toHaveBeenCalledWith(expect.any(String)); // Decrypted access token
      expect(prisma.gmailToken.delete).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if user has no Gmail token', async () => {
      mockPrismaService.gmailToken.findUnique.mockResolvedValue(null);

      await expect(
        service.disconnect(mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete token from database even if Google API revocation fails', async () => {
      const mockRevokeToken = jest.fn().mockRejectedValue(new Error('Google API error'));
      jest.spyOn(OAuth2Client.prototype, 'revokeToken').mockImplementation(mockRevokeToken);

      mockPrismaService.gmailToken.findUnique.mockResolvedValue(mockGmailToken);
      mockPrismaService.gmailToken.delete.mockResolvedValue(mockGmailToken);

      const result = await service.disconnect(mockUserId);

      expect(mockRevokeToken).toHaveBeenCalled();
      expect(prisma.gmailToken.delete).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toBe(true);
    });
  });

  describe('encryption and decryption', () => {
    it('should encrypt and decrypt tokens correctly', () => {
      const plaintext = 'sensitive-token-data';

      const encrypted = (service as any).encrypt(plaintext);
      const decrypted = (service as any).decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toContain(':'); // IV separator
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error when decrypting invalid data', () => {
      expect(() => {
        (service as any).decrypt('invalid-encrypted-data');
      }).toThrow();
    });
  });

  describe('getConnectionStatus', () => {
    it('should return connected status with email address', async () => {
      mockPrismaService.gmailToken.findUnique.mockResolvedValue(mockGmailToken);

      const result = await service.getConnectionStatus(mockUserId);

      expect(result).toEqual({
        connected: true,
        emailAddress: mockEmailAddress,
        expiresAt: mockExpiresAt,
      });
    });

    it('should return not connected status if no token', async () => {
      mockPrismaService.gmailToken.findUnique.mockResolvedValue(null);

      const result = await service.getConnectionStatus(mockUserId);

      expect(result).toEqual({
        connected: false,
        emailAddress: null,
        expiresAt: null,
      });
    });
  });
});
