import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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
}
