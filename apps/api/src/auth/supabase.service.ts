import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as jose from 'jose';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private jwtSecret: Uint8Array;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    const jwtSecretString = this.configService.get<string>('SUPABASE_JWT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey || !jwtSecretString) {
      throw new Error('Missing required Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.jwtSecret = new TextEncoder().encode(jwtSecretString);
  }

  /**
   * Verify a Supabase JWT token and return the decoded payload
   * @param token - JWT token to verify
   * @returns Decoded JWT payload
   * @throws Error if token is invalid or expired
   */
  async verifyToken(token: string): Promise<jose.JWTPayload> {
    try {
      const { payload } = await jose.jwtVerify(token, this.jwtSecret);
      return payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token verification failed';
      throw new Error(message);
    }
  }

  /**
   * Extract JWT token from Authorization header
   * @param authHeader - Authorization header value (e.g., "Bearer token")
   * @returns Extracted token or null if not found
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length < 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }

    const token = parts[1];
    return token || null;
  }

  /**
   * Extract Supabase user ID from verified token
   * @param token - JWT token
   * @returns Supabase user ID (sub claim)
   * @throws Error if token is invalid or missing sub claim
   */
  async getUserIdFromToken(token: string): Promise<string> {
    const payload = await this.verifyToken(token);

    if (!payload.sub) {
      throw new Error('Token missing sub claim (user ID)');
    }

    return payload.sub;
  }

  /**
   * Get full user data from Supabase using access token
   * @param token - JWT access token
   * @returns Supabase user object with metadata
   * @throws Error if user cannot be retrieved
   */
  async getUserFromToken(token: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error) {
        throw new Error(`Failed to get user from Supabase: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('User not found in Supabase');
      }

      return data.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      throw new Error(message);
    }
  }

  /**
   * Get Supabase client instance for admin operations
   * @returns Supabase client
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
