import { Injectable } from '@nestjs/common';
import { pino, Logger } from 'pino';

@Injectable()
export class LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = pino();
  }

  public info(message: any) {
    this.logger.info(message);
  }

  public debug(message: any) {
    this.logger.debug(message);
  }

  public warn(message: any) {
    this.logger.warn(message);
  }

  public error(message: any) {
    this.logger.error(message);
  }
}
