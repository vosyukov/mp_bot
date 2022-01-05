import { Module } from '@nestjs/common';
import { UserRegistrationService } from './services/user-registration.service';
import { UserRepository } from './repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { WbApiModule } from '../wb-api/wb-api.module';
import { TgUserController } from './tg-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), WbApiModule],
  providers: [UserRegistrationService, UserService],
  controllers: [TgUserController],
  exports: [UserRegistrationService, UserService],
})
export class UserModule {}
