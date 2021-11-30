import { Module } from '@nestjs/common';
import { UserRegistrationService } from './services/user-registration.service';
import { UserRepository } from './repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { WbApiModule } from '../wb-api/wb-api.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), WbApiModule],
  providers: [UserRegistrationService, UserService],
  exports: [UserRegistrationService, UserService],
})
export class UserModule {}
