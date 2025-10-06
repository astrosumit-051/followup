import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaClient } from '@relationhub/database';

/**
 * User Module
 *
 * Encapsulates all user-related functionality:
 * - UserService: Business logic for user operations
 * - UserResolver: GraphQL API endpoints with validation
 * - PrismaClient: Database access
 *
 * Exports UserService for use in other modules (e.g., AuthModule)
 */
@Module({
  providers: [
    UserService,
    UserResolver,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [UserService], // Export for use in AuthModule
})
export class UserModule {}
