import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@relationhub/database';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [
    UserService,
    PrismaService,
    {
      provide: PrismaClient,
      useExisting: PrismaService,
    },
  ],
  exports: [UserService, PrismaService],
})
export class UserModule {}
