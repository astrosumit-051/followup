import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@relationhub/database';

@Module({
  providers: [
    UserService,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [UserService],
})
export class UserModule {}
