import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { CurrentUser, CurrentUserData } from './auth/current-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @SkipThrottle()
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() user: CurrentUserData): CurrentUserData {
    return user;
  }
}
