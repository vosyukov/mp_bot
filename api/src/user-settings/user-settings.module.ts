import { Module } from '@nestjs/common';
import { UserSettingsService } from './services/user-settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettingsRepository } from './repositories/user-settings.repository';
import { TgUserSettingsController } from './tg-user-settings.controller';
import { UserModule } from '../user/user.module';
import { AmplitudeModule } from '../amplitude/amplitude.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettingsRepository]), UserModule, AmplitudeModule],
  providers: [UserSettingsService],
  controllers: [TgUserSettingsController],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
