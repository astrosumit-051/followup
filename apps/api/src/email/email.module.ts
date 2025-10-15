import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDraftService } from './email-draft.service';
import { EmailSignatureService } from './email-signature.service';
import { EmailResolver } from './email.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AIModule],
  providers: [EmailService, EmailDraftService, EmailSignatureService, EmailResolver],
  exports: [EmailService, EmailDraftService, EmailSignatureService],
})
export class EmailModule {}
