import { Injectable } from '@nestjs/common';
import { pino, Logger } from 'pino';

import { RequestContextService } from './request-context.service';

@Injectable()
export class LoggerService {
  private logger: Logger;

  constructor(private readonly requestContextService: RequestContextService) {
    this.logger = pino();
  }

  public info(message: any) {
    const requestId = this.requestContextService.getRequestId();
    this.logger.info({ requestId, message });
  }

  public debug(message: any) {
    const requestId = this.requestContextService.getRequestId();
    this.logger.debug({ requestId, message });
  }

  public warn(message: any) {
    const requestId = this.requestContextService.getRequestId();
    this.logger.warn({ requestId, message });
  }

  public error(message: any) {
    const requestId = this.requestContextService.getRequestId();
    this.logger.error({ requestId, message });
  }
}
