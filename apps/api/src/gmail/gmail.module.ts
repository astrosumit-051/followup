import { Module } from '@nestjs/common';
import { GmailOAuthService } from './gmail-oauth.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GmailOAuthService],
  exports: [GmailOAuthService],
})
export class GmailModule {}
