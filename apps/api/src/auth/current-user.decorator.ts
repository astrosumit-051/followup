import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

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
    // Check if we're in a GraphQL context
    if (ctx.getType<string>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(ctx);
      const { req } = gqlContext.getContext();
      return req.user;
    }

    // Default to HTTP context
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
