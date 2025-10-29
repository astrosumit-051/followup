import { Controller, Get, Delete, Query, Res, UseGuards, BadRequestException } from '@nestjs/common';
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
   * and stores in database. Then redirects to frontend callback page.
   *
   * Query parameters:
   * @param state - OAuth state parameter for CSRF protection (required)
   * @param code - Authorization code from Google OAuth (present on success, absent on error)
   * @param error - OAuth error code if user denied access (present only on error)
   * @param error_description - Human-readable error description (present only on error)
   * @param res - Express response object for redirect
   *
   * @returns 302 redirect to frontend callback page
   * @throws BadRequestException if state is invalid, both code and error are missing, or code exchange fails
   * @throws UnauthorizedException if OAuth tokens are invalid or expired during exchange
   * @throws InternalServerErrorException if token encryption or database storage fails
   * @throws ServiceUnavailableException if Google OAuth API is temporarily unavailable
   */
  @Get('callback')
  async handleCallback(
    @Query('state') state: string,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
  ): Promise<void> {
    // Validate that either code or error is present
    if (!code && !error) {
      throw new BadRequestException('Missing required parameters: either code or error must be provided');
    }

    // Handle OAuth error (user denied or error occurred)
    if (error) {
      const encodedError = encodeURIComponent(errorDescription || error);
      res.redirect(`/settings/gmail-callback?error=${encodedError}`);
      return;
    }

    try {
      // Exchange code for tokens and store (non-null assertion safe due to validation above)
      await this.gmailOAuthService.handleCallback(state, code!);

      // Redirect to success callback page
      res.redirect('/settings/gmail-callback?success=true');
    } catch (err) {
      // Redirect to error callback page
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Gmail';
      const encodedError = encodeURIComponent(errorMessage);
      res.redirect(`/settings/gmail-callback?error=${encodedError}`);
    }
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
