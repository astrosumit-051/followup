import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { Request, Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ContactModule } from './contact/contact.module';
import { GqlThrottlerGuard } from '../../../src/common/guards/gql-throttler.guard';

/**
 * Main Application Module
 *
 * Security Features:
 * - Global rate limiting (10 requests per 60 seconds)
 * - Environment configuration management
 * - Authentication and user management modules
 *
 * GraphQL Configuration:
 * - Apollo Server with code-first approach
 * - Auto-generated schema from TypeScript decorators
 * - GraphQL Playground enabled in development
 * - Introspection and playground disabled in production
 *
 * Rate Limiting Configuration:
 * - Prevents brute-force attacks
 * - Mitigates DDoS attempts
 * - Can be overridden per route with @Throttle() decorator
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // GraphQL Module with Apollo Server
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    // Global rate limiting to prevent abuse
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per minute per IP
      },
    ]),
    AuthModule,
    UserModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally to all routes (including GraphQL)
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
