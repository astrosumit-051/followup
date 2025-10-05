import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

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

      // Extract Supabase user ID
      const supabaseId = await this.supabaseService.getUserIdFromToken(token);

      // Attach user information to request object
      request.user = {
        supabaseId,
        email: payload.email,
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
