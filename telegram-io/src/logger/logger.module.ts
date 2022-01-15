import { Global, Module } from '@nestjs/common';
import { LoggingInterceptor } from './logger.interceptor';
import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';

@Global()
@Module({
  providers: [LoggingInterceptor, LoggerService, RequestContextService],
  exports: [LoggingInterceptor, LoggerService, RequestContextService],
})
export class LoggerModule {}
