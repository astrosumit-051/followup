import { Module } from '@nestjs/common';
import { PrismaClient } from '@relationhub/database';
import { ContactService } from './contact.service';
import { ContactResolver } from './contact.resolver';

/**
 * Contact Module
 *
 * Provides contact management functionality with GraphQL API.
 * All operations require authentication and enforce user ownership.
 */
@Module({
  providers: [
    ContactService,
    ContactResolver,
    PrismaClient,
  ],
  exports: [ContactService],
})
export class ContactModule {}
