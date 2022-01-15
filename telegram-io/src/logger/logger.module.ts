import { Global, Module } from '@nestjs/common';
import { LoggingInterceptor } from './logger.interceptor';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [LoggingInterceptor, LoggerService],
  exports: [LoggingInterceptor, LoggerService],
})
export class LoggerModule {}
