import { Controller, Get, Delete, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GmailOAuthService } from './gmail-oauth.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

/**
 * Gmail REST API Controller
 *
 * Provides REST endpoints for Gmail OAuth integration:
 * - GET /api/auth/gmail/authorize - Initiates OAuth flow
 * - GET /api/auth/gmail/callback - Handles OAuth callback
 * - DELETE /api/auth/gmail/disconnect - Revokes Gmail connection
 * - GET /api/auth/gmail/status - Gets connection status
 *
 * All endpoints require authentication except callback (uses state parameter).
 */
@Controller('api/auth/gmail')
export class GmailController {
  constructor(private readonly gmailOAuthService: GmailOAuthService) {}

  /**
   * GET /api/auth/gmail/authorize
   *
   * Initiates Gmail OAuth2 authorization flow by redirecting user to Google's
   * consent screen. Returns a 302 redirect to Google OAuth URL with appropriate
   * scopes and state parameter for CSRF protection.
   *
   * @param user - Authenticated user from JWT token
   * @param res - Express response object for redirect
   * @returns 302 redirect to Google OAuth authorization URL
   */
  @Get('authorize')
  @UseGuards(AuthGuard)
  authorize(@CurrentUser() user: CurrentUserData, @Res() res: Response): void {
    const authUrl = this.gmailOAuthService.getAuthorizationUrl(user.supabaseId);
    res.redirect(authUrl);
  }

  /**
   * GET /api/auth/gmail/callback
   *
   * Handles OAuth2 callback from Google after user grants/denies consent.
   * Exchanges authorization code for access and refresh tokens, encrypts them,
   * and stores in database.
   *
   * Query parameters:
   * @param state - OAuth state parameter for CSRF protection (required)
   * @param code - Authorization code from Google OAuth (required)
   *
   * @returns Success response with connected email address
   * @throws BadRequestException if state is invalid or code exchange fails
   */
  @Get('callback')
  async handleCallback(
    @Query('state') state: string,
    @Query('code') code: string,
  ): Promise<{ success: boolean; message: string; emailAddress: string }> {
    const gmailToken = await this.gmailOAuthService.handleCallback(state, code);

    return {
      success: true,
      message: 'Gmail account connected successfully',
      emailAddress: gmailToken.emailAddress,
    };
  }

  /**
   * DELETE /api/auth/gmail/disconnect
   *
   * Disconnects user's Gmail account by:
   * 1. Revoking tokens with Google
   * 2. Deleting tokens from database
   *
   * Requires authentication. Returns success even if user has no Gmail connection
   * (idempotent operation).
   *
   * @param user - Authenticated user from JWT token
   * @returns Success response
   * @throws NotFoundException if no Gmail connection exists
   */
  @Delete('disconnect')
  @UseGuards(AuthGuard)
  async disconnect(
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ success: boolean; message: string }> {
    await this.gmailOAuthService.disconnect(user.supabaseId);

    return {
      success: true,
      message: 'Gmail account disconnected successfully',
    };
  }

  /**
   * GET /api/auth/gmail/status
   *
   * Gets Gmail connection status for authenticated user.
   * Returns whether user has an active Gmail connection and associated email address.
   *
   * @param user - Authenticated user from JWT token
   * @returns Connection status object
   */
  @Get('status')
  @UseGuards(AuthGuard)
  async getStatus(@CurrentUser() user: CurrentUserData): Promise<{
    connected: boolean;
    emailAddress: string | null;
    expiresAt: Date | null;
  }> {
    return this.gmailOAuthService.getConnectionStatus(user.supabaseId);
  }
}
