import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './auth.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, forwardRef(() => UserModule)],
  providers: [SupabaseService, AuthGuard],
  exports: [SupabaseService, AuthGuard],
})
export class AuthModule {}
