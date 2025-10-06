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
      if (error instanceof Error) {
        // Provide specific error messages for common JWT errors
        if (error.message.includes('signature')) {
          throw new Error('Invalid token signature. Please log in again.');
        }
        if (error.message.includes('exp')) {
          throw new Error('Token has expired. Please log in again.');
        }
        if (error.message.includes('iat')) {
          throw new Error('Token issued date is invalid. Please log in again.');
        }
        if (error.message.includes('nbf')) {
          throw new Error('Token is not yet valid. Please check your system time and log in again.');
        }
        if (error.message.includes('algorithm')) {
          throw new Error('Token uses unsupported algorithm. Please log in again.');
        }
        // Generic error for other cases
        throw new Error(`Token verification failed: ${error.message}`);
      }
      throw new Error('Token verification failed. Please log in again.');
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
      throw new Error('Invalid token: Missing user identifier. Please log in again.');
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
        // Provide specific error messages based on Supabase error codes
        if (error.message.includes('invalid') || error.message.includes('JWT')) {
          throw new Error('Invalid authentication token. Please log in again.');
        }
        if (error.message.includes('expired')) {
          throw new Error('Your session has expired. Please log in again.');
        }
        if (error.message.includes('revoked')) {
          throw new Error('Your session has been revoked. Please log in again.');
        }
        throw new Error(`Authentication failed: ${error.message}. Please log in again.`);
      }

      if (!data.user) {
        throw new Error('User account not found. Please contact support if this persists.');
      }

      return data.user;
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw already formatted errors
      }
      throw new Error('Failed to retrieve user information. Please try again.');
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
