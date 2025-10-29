import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Gmail OAuth Service
 *
 * Handles OAuth2 authentication flow with Gmail API:
 * - Generates authorization URLs for user consent
 * - Exchanges authorization codes for access and refresh tokens
 * - Encrypts tokens with AES-256-GCM before database storage
 * - Automatically refreshes expired tokens
 * - Revokes tokens on disconnect
 *
 * Security:
 * - All tokens encrypted at rest with AES-256-GCM
 * - Encryption key from environment variable (ENCRYPTION_KEY)
 * - Tokens never exposed in API responses
 */
@Injectable()
export class GmailOAuthService {
  private oauth2Client: OAuth2Client;
  private encryptionKey: Buffer;
  private stateStore: Map<string, { userId: string; expiresAt: Date }> = new Map();

  private readonly GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
  ];
  private readonly STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Validate Google OAuth configuration
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error(
        'Missing required Google OAuth configuration. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables.',
      );
    }

    // Initialize OAuth2 client
    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

    // Initialize encryption key (32 bytes for AES-256)
    const hexKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!hexKey || hexKey.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }
    this.encryptionKey = Buffer.from(hexKey, 'hex');
  }

  /**
   * Generate OAuth2 authorization URL
   *
   * Generates Google OAuth2 consent screen URL with:
   * - Gmail send and readonly scopes
   * - Offline access for refresh tokens
   * - Force consent prompt to ensure refresh token
   * - Cryptographically random state token (prevents CSRF attacks)
   *
   * @param userId - ID of the authenticated user
   * @returns Authorization URL with secure state token
   */
  getAuthorizationUrl(userId: string): string {
    // Generate cryptographically random state to prevent CSRF
    const state = randomBytes(32).toString('hex');

    // Store state with userId and expiry
    this.stateStore.set(state, {
      userId,
      expiresAt: new Date(Date.now() + this.STATE_EXPIRY_MS),
    });

    // Clean up expired states
    this.cleanupExpiredStates();

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      prompt: 'consent', // Force consent to get refresh token
      scope: this.GMAIL_SCOPES,
      state, // Cryptographically random state
    });

    return url;
  }

  /**
   * Handle OAuth2 callback and exchange code for tokens
   *
   * Exchanges authorization code for:
   * - Access token (short-lived, 1 hour)
   * - Refresh token (long-lived, for token renewal)
   *
   * Tokens are encrypted with AES-256-GCM and stored in database.
   * If user already has a Gmail connection, updates existing record.
   *
   * @param state - OAuth state parameter to verify
   * @param authCode - Authorization code from OAuth2 redirect
   * @returns Created/updated GmailToken record
   * @throws BadRequestException if auth code is invalid or state doesn't match
   */
  async handleCallback(state: string, authCode: string) {
    // Verify state parameter
    const stateData = this.stateStore.get(state);
    if (!stateData) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    // Check if state is expired
    if (new Date() > stateData.expiresAt) {
      this.stateStore.delete(state);
      throw new BadRequestException('OAuth state expired');
    }

    // Extract userId from verified state
    const userId = stateData.userId;

    // Delete used state (one-time use)
    this.stateStore.delete(state);
    try {
      // Exchange authorization code for tokens
      const { tokens } = await this.oauth2Client.getToken(authCode);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new BadRequestException('No tokens received from Google');
      }

      // Get user's email address from token info
      this.oauth2Client.setCredentials(tokens);
      const tokenInfo = await this.oauth2Client.getTokenInfo(tokens.access_token);

      const emailAddress = tokenInfo.email || '';
      const scopes = tokenInfo.scopes || [];

      // Encrypt tokens before storage
      const encryptedAccessToken = this.encrypt(tokens.access_token);
      const encryptedRefreshToken = this.encrypt(tokens.refresh_token);

      // Calculate expiry date (tokens.expiry_date is milliseconds since epoch)
      const expiresAt = new Date(tokens.expiry_date || Date.now() + 3600 * 1000);

      // Check if user already has a Gmail token
      const existingToken = await this.prisma.gmailToken.findUnique({
        where: { userId },
      });

      if (existingToken) {
        // Update existing token
        return this.prisma.gmailToken.update({
          where: { userId },
          data: {
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            expiresAt,
            emailAddress,
            scope: scopes,
          },
        });
      } else {
        // Create new token
        return this.prisma.gmailToken.create({
          data: {
            userId,
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            expiresAt,
            emailAddress,
            scope: scopes,
          },
        });
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to exchange authorization code: ${message}`);
    }
  }

  /**
   * Refresh access token if expired
   *
   * Checks token expiry (with 5-minute buffer) and automatically
   * refreshes if needed using stored refresh token.
   *
   * @param userId - ID of the authenticated user
   * @returns Decrypted access token (ready for Gmail API calls)
   * @throws NotFoundException if user has no Gmail connection
   */
  async refreshTokenIfNeeded(userId: string): Promise<string> {
    const tokenRecord = await this.prisma.gmailToken.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      throw new NotFoundException('Gmail account not connected');
    }

    // Check if token is expired (with 5-minute buffer)
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    const isExpired = new Date(tokenRecord.expiresAt.getTime() - bufferMs) <= now;

    if (!isExpired) {
      // Token still valid, return decrypted access token
      return this.decrypt(tokenRecord.accessToken);
    }

    // Token expired, refresh it
    const decryptedRefreshToken = this.decrypt(tokenRecord.refreshToken);
    this.oauth2Client.setCredentials({
      refresh_token: decryptedRefreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new BadRequestException('Failed to refresh access token');
    }

    // Encrypt and store new access token
    const encryptedAccessToken = this.encrypt(credentials.access_token);
    const newExpiresAt = new Date(credentials.expiry_date || Date.now() + 3600 * 1000);

    await this.prisma.gmailToken.update({
      where: { userId },
      data: {
        accessToken: encryptedAccessToken,
        expiresAt: newExpiresAt,
      },
    });

    return credentials.access_token;
  }

  /**
   * Disconnect Gmail account
   *
   * Revokes access token with Google API (best-effort) and
   * deletes token record from database.
   *
   * Note: Even if Google API revocation fails, token is deleted
   * from database to ensure local cleanup.
   *
   * @param userId - ID of the authenticated user
   * @returns true if successfully disconnected
   * @throws NotFoundException if user has no Gmail connection
   */
  async disconnect(userId: string): Promise<boolean> {
    const tokenRecord = await this.prisma.gmailToken.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      throw new NotFoundException('Gmail account not connected');
    }

    // Revoke token with Google API (best-effort)
    try {
      const decryptedAccessToken = this.decrypt(tokenRecord.accessToken);
      await this.oauth2Client.revokeToken(decryptedAccessToken);
    } catch (error) {
      // Log error but continue with deletion
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to revoke token with Google API:', message);
    }

    // Delete token from database
    await this.prisma.gmailToken.delete({
      where: { userId },
    });

    return true;
  }

  /**
   * Get Gmail connection status
   *
   * Returns connection status without exposing tokens.
   *
   * @param userId - ID of the authenticated user
   * @returns Connection status with email address and expiry
   */
  async getConnectionStatus(userId: string): Promise<{
    connected: boolean;
    emailAddress: string | null;
    expiresAt: Date | null;
  }> {
    const tokenRecord = await this.prisma.gmailToken.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      return {
        connected: false,
        emailAddress: null,
        expiresAt: null,
      };
    }

    return {
      connected: true,
      emailAddress: tokenRecord.emailAddress,
      expiresAt: tokenRecord.expiresAt,
    };
  }

  /**
   * Encrypt data with AES-256-GCM
   *
   * Format: iv:authTag:encryptedData (all hex encoded)
   *
   * @param plaintext - Data to encrypt
   * @returns Encrypted string with IV and auth tag
   */
  private encrypt(plaintext: string): string {
    const iv = randomBytes(16); // 16 bytes IV for GCM mode
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   *
   * Expects format: iv:authTag:encryptedData (all hex encoded)
   *
   * @param encrypted - Encrypted string with IV and auth tag
   * @returns Decrypted plaintext
   * @throws Error if decryption fails or format is invalid
   */
  private decrypt(encrypted: string): string {
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encryptedData] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Specify auth tag length (16 bytes/128 bits) to prevent authentication forgery attacks
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv, {
      authTagLength: 16,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Clean up expired OAuth states
   *
   * Removes states that have exceeded their expiry time.
   * Called periodically to prevent memory leaks.
   */
  private cleanupExpiredStates(): void {
    const now = new Date();
    for (const [state, data] of this.stateStore.entries()) {
      if (now > data.expiresAt) {
        this.stateStore.delete(state);
      }
    }
  }
}
