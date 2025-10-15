import { Module } from '@nestjs/common';
import { GmailOAuthService } from './gmail-oauth.service';
import { GmailSendService } from './gmail-send.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GmailOAuthService, GmailSendService],
  exports: [GmailOAuthService, GmailSendService],
})
export class GmailModule {}
