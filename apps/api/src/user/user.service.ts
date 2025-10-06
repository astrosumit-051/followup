import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@relationhub/database';

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
  };
}

interface UpdateProfileDto {
  name?: string;
  profilePicture?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find user by Supabase ID
   * @param supabaseId - Supabase user UUID
   * @returns User or null if not found
   */
  async findBySupabaseId(supabaseId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }

  /**
   * Sync user from Supabase Auth to local database
   * Creates user if doesn't exist, updates lastLoginAt if exists
   * @param supabaseUser - Supabase user object
   * @returns Synced user
   */
  async syncUserFromSupabase(supabaseUser: SupabaseUser): Promise<User> {
    try {
      const existingUser = await this.findBySupabaseId(supabaseUser.id);

      const userData = {
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || null,
        profilePicture: supabaseUser.user_metadata?.avatar_url || null,
        lastLoginAt: new Date(),
      };

      if (!existingUser) {
        // Create new user
        return await this.prisma.user.create({
          data: {
            supabaseId: supabaseUser.id,
            provider: supabaseUser.app_metadata?.provider || null,
            ...userData,
          },
        });
      }

      // Update existing user
      return await this.prisma.user.update({
        where: { supabaseId: supabaseUser.id },
        data: userData,
      });
    } catch (error) {
      if (error instanceof Error) {
        // Database constraint violation
        if (error.message.includes('Unique constraint')) {
          throw new Error('A user with this email already exists. Please contact support.');
        }
        // Database connection error
        if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
          throw new Error('Database connection failed. Please try again later.');
        }
        // Generic database error
        throw new Error(`Failed to sync user profile: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while syncing your profile. Please try again.');
    }
  }

  /**
   * Update user profile
   * @param supabaseId - Supabase user UUID
   * @param updateData - Profile fields to update
   * @returns Updated user
   */
  async updateProfile(
    supabaseId: string,
    updateData: UpdateProfileDto,
  ): Promise<User> {
    try {
      // Check if user exists
      const user = await this.findBySupabaseId(supabaseId);
      if (!user) {
        throw new Error('User not found. Please log in again.');
      }

      return await this.prisma.user.update({
        where: { supabaseId },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Error) {
        // User not found (already checked above, but Prisma might throw it too)
        if (error.message.includes('Record to update not found')) {
          throw new Error('User profile not found. Please log in again.');
        }
        // Database connection error
        if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
          throw new Error('Database connection failed. Please try again later.');
        }
        // Re-throw already formatted errors
        if (error.message.includes('User not found')) {
          throw error;
        }
        // Generic database error
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while updating your profile. Please try again.');
    }
  }
}
