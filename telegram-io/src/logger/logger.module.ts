import { Global, Module } from '@nestjs/common';
import { LoggingInterceptor } from './logger.interceptor';

@Global()
@Module({
  providers: [LoggingInterceptor],
})
export class LoggerModule {}
