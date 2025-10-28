import { Module } from '@nestjs/common';
import { GmailOAuthService } from './gmail-oauth.service';
import { GmailSendService } from './gmail-send.service';
import { GmailController } from './gmail.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  controllers: [GmailController],
  providers: [GmailOAuthService, GmailSendService],
  exports: [GmailOAuthService, GmailSendService],
})
export class GmailModule {}
