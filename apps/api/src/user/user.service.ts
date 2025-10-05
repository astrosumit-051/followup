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
   * Uses atomic upsert to prevent duplicate creation under concurrent requests
   * @param supabaseUser - Supabase user object
   * @returns Synced user
   */
  async syncUserFromSupabase(supabaseUser: SupabaseUser): Promise<User> {
    const userData = {
      name: supabaseUser.user_metadata?.full_name || null,
      profilePicture: supabaseUser.user_metadata?.avatar_url || null,
      lastLoginAt: new Date(),
    };

    return this.prisma.user.upsert({
      where: { supabaseId: supabaseUser.id },
      update: userData,
      create: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        provider: supabaseUser.app_metadata?.provider || null,
        ...userData,
      },
    });
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
    return this.prisma.user.update({
      where: { supabaseId },
      data: updateData,
    });
  }
}
