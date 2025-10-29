import { Test, TestingModule } from '@nestjs/testing';
import { GmailController } from './gmail.controller';
import { GmailOAuthService } from './gmail-oauth.service';
import { Response } from 'express';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock the auth module to avoid jose import issues
jest.mock('../auth/auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('GmailController', () => {
  let controller: GmailController;
  let gmailOAuthService: GmailOAuthService;

  const mockGmailOAuthService = {
    getAuthorizationUrl: jest.fn(),
    handleCallback: jest.fn(),
    disconnect: jest.fn(),
    getConnectionStatus: jest.fn(),
  };

  const mockUserId = 'user-123';
  const mockAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test&...';
  const mockState = 'random-state-123';
  const mockAuthCode = 'auth-code-xyz';

  const mockResponse = {
    redirect: jest.fn(),
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GmailController],
      providers: [
        {
          provide: GmailOAuthService,
          useValue: mockGmailOAuthService,
        },
      ],
    }).compile();

    controller = module.get<GmailController>(GmailController);
    gmailOAuthService = module.get<GmailOAuthService>(GmailOAuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/auth/gmail/authorize', () => {
    it('should redirect to Google OAuth authorization URL', () => {
      mockGmailOAuthService.getAuthorizationUrl.mockReturnValue(mockAuthUrl);

      controller.authorize({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' }, mockResponse);

      expect(mockGmailOAuthService.getAuthorizationUrl).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockAuthUrl);
    });

    it('should handle errors when generating authorization URL', () => {
      const error = new Error('Failed to generate authorization URL');
      mockGmailOAuthService.getAuthorizationUrl.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        controller.authorize({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' }, mockResponse);
      }).toThrow(error);
    });
  });

  describe('GET /api/auth/gmail/callback', () => {
    const mockGmailToken = {
      id: 'token-123',
      userId: mockUserId,
      emailAddress: 'user@gmail.com',
      scope: ['https://www.googleapis.com/auth/gmail.send'],
      expiresAt: new Date('2025-10-15T13:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    };

    it('should handle successful OAuth callback', async () => {
      mockGmailOAuthService.handleCallback.mockResolvedValue(mockGmailToken);

      await controller.handleCallback(mockState, mockAuthCode, '', '', mockResponse);

      expect(mockGmailOAuthService.handleCallback).toHaveBeenCalledWith(mockState, mockAuthCode);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/settings/gmail-callback?success=true');
    });

    it('should throw BadRequestException when state is invalid', async () => {
      const error = new BadRequestException('Invalid or expired state parameter');
      mockGmailOAuthService.handleCallback.mockRejectedValue(error);

      await controller.handleCallback('invalid-state', mockAuthCode, '', '', mockResponse);

      expect(mockGmailOAuthService.handleCallback).toHaveBeenCalledWith('invalid-state', mockAuthCode);
      expect(mockResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/settings/gmail-callback?error='));
    });

    it('should throw BadRequestException when authorization code is invalid', async () => {
      const error = new BadRequestException('Invalid authorization code');
      mockGmailOAuthService.handleCallback.mockRejectedValue(error);

      await controller.handleCallback(mockState, 'invalid-code', '', '', mockResponse);

      expect(mockGmailOAuthService.handleCallback).toHaveBeenCalledWith(mockState, 'invalid-code');
      expect(mockResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/settings/gmail-callback?error='));
    });

    it('should handle missing state parameter', async () => {
      const error = new BadRequestException('Missing state parameter');
      mockGmailOAuthService.handleCallback.mockRejectedValue(error);

      await controller.handleCallback('', mockAuthCode, '', '', mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/settings/gmail-callback?error='));
    });

    it('should handle missing code parameter', async () => {
      const error = new BadRequestException('Missing authorization code');
      mockGmailOAuthService.handleCallback.mockRejectedValue(error);

      await controller.handleCallback(mockState, '', '', '', mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/settings/gmail-callback?error='));
    });
  });

  describe('DELETE /api/auth/gmail/disconnect', () => {
    it('should successfully disconnect Gmail account', async () => {
      mockGmailOAuthService.disconnect.mockResolvedValue(true);

      const result = await controller.disconnect({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' });

      expect(mockGmailOAuthService.disconnect).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual({
        success: true,
        message: 'Gmail account disconnected successfully',
      });
    });

    it('should throw NotFoundException when no Gmail connection exists', async () => {
      const error = new NotFoundException('No Gmail connection found for user');
      mockGmailOAuthService.disconnect.mockRejectedValue(error);

      await expect(controller.disconnect({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' })).rejects.toThrow(NotFoundException);
      expect(mockGmailOAuthService.disconnect).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle errors when revoking token fails', async () => {
      const error = new Error('Failed to revoke token');
      mockGmailOAuthService.disconnect.mockRejectedValue(error);

      await expect(controller.disconnect({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' })).rejects.toThrow(error);
    });
  });

  describe('GET /api/auth/gmail/status', () => {
    it('should return connection status when connected', async () => {
      const mockStatus = {
        connected: true,
        emailAddress: 'user@gmail.com',
        expiresAt: new Date('2025-10-15T13:00:00Z'),
      };
      mockGmailOAuthService.getConnectionStatus.mockResolvedValue(mockStatus);

      const result = await controller.getStatus({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' });

      expect(mockGmailOAuthService.getConnectionStatus).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockStatus);
    });

    it('should return disconnected status when not connected', async () => {
      const mockStatus = {
        connected: false,
        emailAddress: null,
        expiresAt: null,
      };
      mockGmailOAuthService.getConnectionStatus.mockResolvedValue(mockStatus);

      const result = await controller.getStatus({ supabaseId: mockUserId, email: 'test@example.com', role: 'user' });

      expect(mockGmailOAuthService.getConnectionStatus).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockStatus);
    });
  });
});
