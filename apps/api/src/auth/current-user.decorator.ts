import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  supabaseId: string;
  email: string;
  role: string;
}

/**
 * Decorator to extract the current authenticated user from request
 * Usage in controllers/resolvers:
 * @CurrentUser() user: CurrentUserData
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
