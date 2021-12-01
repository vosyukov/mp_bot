import { Module } from '@nestjs/common';
import { WbApiService } from './wb-api.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WbApiTokenRepository } from './repositories/wb-api-token.repository';
import { WbApiTokenService } from './wb-api-token.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([WbApiTokenRepository]), UtilsModule, HttpModule],
  providers: [WbApiService, WbApiTokenService],
  exports: [WbApiService, WbApiTokenService],
})
export class WbApiModule {}
