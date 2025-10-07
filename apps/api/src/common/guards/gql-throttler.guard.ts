import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom Throttler Guard for GraphQL
 *
 * The default ThrottlerGuard doesn't work with GraphQL because it can't
 * extract the request/response objects from the GraphQL execution context.
 *
 * This guard overrides getRequestResponse to properly extract req/res from
 * the GraphQL context, enabling IP-based rate limiting for GraphQL endpoints.
 *
 * @see https://docs.nestjs.com/security/rate-limiting#graphql
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
