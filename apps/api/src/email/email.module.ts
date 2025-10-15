import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDraftService } from './email-draft.service';
import { EmailResolver } from './email.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AIModule],
  providers: [EmailService, EmailDraftService, EmailResolver],
  exports: [EmailService, EmailDraftService],
})
export class EmailModule {}
