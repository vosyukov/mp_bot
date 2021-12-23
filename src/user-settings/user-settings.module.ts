import { Module } from '@nestjs/common';
import { UserSettingsService } from './services/user-settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettingsRepository } from './repositories/user-settings.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettingsRepository])],
  providers: [UserSettingsService],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
