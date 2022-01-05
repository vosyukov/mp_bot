import { Module } from '@nestjs/common';
import { WbApiService } from './wb-api.service';
import { HttpModule } from '@nestjs/axios';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [UtilsModule, HttpModule],
  providers: [WbApiService],
  exports: [WbApiService],
})
export class WbApiModule {}
