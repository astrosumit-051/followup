import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * GraphQL User Resolver
 *
 * Provides GraphQL API endpoints for user profile operations
 * with authentication and input validation
 *
 * Security Features:
 * - AuthGuard: Protects all operations (JWT verification required)
 * - ValidationPipe: Validates all input DTOs using class-validator
 * - @CurrentUser decorator: Safely extracts user from JWT context
 *
 * @see https://docs.nestjs.com/graphql/resolvers
 * @see https://docs.nestjs.com/techniques/validation
 */
@Resolver('User')
@UseGuards(AuthGuard) // Protect all resolver methods with authentication
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Validate all inputs
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current authenticated user's profile
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @returns Current user object with all profile fields
   *
   * @example
   * query {
   *   me {
   *     id
   *     email
   *     name
   *     profilePicture
   *     lastLoginAt
   *   }
   * }
   */
  @Query(() => String, { name: 'me' })
  async me(@CurrentUser() user: any) {
    return user;
  }

  /**
   * Update current authenticated user's profile
   *
   * Security Features:
   * - Validates input using UpdateProfileDto (class-validator)
   * - Only allows updating own profile (uses JWT user context)
   * - Whitelist mode: Strips unknown properties
   * - Forbids non-whitelisted properties: Rejects unknown fields
   *
   * Validation:
   * - name: 1-100 chars, alphanumeric + spaces/hyphens/apostrophes only
   * - profilePicture: Valid HTTPS URL, max 2048 chars
   *
   * @param user - Current user from JWT (injected by @CurrentUser decorator)
   * @param updateProfileDto - Validated profile update data
   * @returns Updated user object
   *
   * @throws BadRequestException if validation fails
   * @throws UnauthorizedException if user not authenticated
   * @throws NotFoundException if user not found in database
   *
   * @example
   * mutation {
   *   updateProfile(updateProfileDto: {
   *     name: "John Doe"
   *     profilePicture: "https://example.com/avatar.jpg"
   *   }) {
   *     id
   *     name
   *     profilePicture
   *   }
   * }
   */
  @Mutation(() => String, { name: 'updateProfile' })
  async updateProfile(
    @CurrentUser() user: any,
    @Args('updateProfileDto') updateProfileDto: UpdateProfileDto,
  ) {
    // UserService.updateProfile already validates user existence
    return this.userService.updateProfile(user.id, updateProfileDto);
  }
}
