import { Module, forwardRef } from '@nestjs/common';
import { PrismaClient } from '@cordiq/database';
import { ContactService } from './contact.service';
import { ContactResolver } from './contact.resolver';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

/**
 * Contact Module
 *
 * Provides contact management functionality with GraphQL API.
 * All operations require authentication and enforce user ownership.
 *
 * Dependencies:
 * - AuthModule: Provides AuthGuard for protecting GraphQL resolvers
 * - UserModule: Provides UserService for user synchronization in AuthGuard
 * - PrismaClient: Database access for contact operations
 */
@Module({
  imports: [AuthModule, forwardRef(() => UserModule)],
  providers: [
    ContactService,
    ContactResolver,
    PrismaClient,
  ],
  exports: [ContactService],
})
export class ContactModule {}
