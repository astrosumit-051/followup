import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailResolver } from './email.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AIModule],
  providers: [EmailService, EmailResolver],
  exports: [EmailService],
})
export class EmailModule {}
