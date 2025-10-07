import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SupabaseService } from './supabase.service';
import { UserService } from '../user/user.service';

/**
 * Authentication Guard for HTTP and GraphQL requests
 *
 * This guard verifies JWT tokens from Supabase and attaches user information
 * to the request context. It supports both HTTP (REST API) and GraphQL contexts.
 *
 * For GraphQL requests, it properly extracts the request from the GraphQL
 * execution context before accessing headers.
 *
 * @see https://docs.nestjs.com/graphql/other-features#execute-enhancers-at-the-field-resolver-level
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract request from either HTTP or GraphQL context
    const request = this.getRequest(context);
    const authHeader = request.headers.authorization;

    // Extract token from Authorization header
    const token = this.supabaseService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      // Verify JWT token
      const payload = await this.supabaseService.verifyToken(token);

      // Fetch full Supabase user data with metadata
      const supabaseUser = await this.supabaseService.getUserFromToken(token);

      // Sync user to database (create or update)
      const dbUser = await this.userService.syncUserFromSupabase(supabaseUser);

      // Attach user information to request object
      request.user = {
        id: dbUser.id,
        supabaseId: dbUser.supabaseId,
        email: dbUser.email,
        name: dbUser.name,
        profilePicture: dbUser.profilePicture,
        provider: dbUser.provider,
        role: payload.role,
      };

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Authentication failed';
      throw new UnauthorizedException(message);
    }
  }

  /**
   * Extract request from either HTTP or GraphQL execution context
   *
   * This method detects whether the current context is HTTP or GraphQL
   * and extracts the request object accordingly.
   */
  private getRequest(context: ExecutionContext) {
    // Check if this is a GraphQL context by trying to create a GraphQL context
    // If it succeeds and has a valid context, it's GraphQL
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      // GraphQL context
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      return ctx.req;
    }

    // HTTP context (REST API)
    return context.switchToHttp().getRequest();
  }
}
