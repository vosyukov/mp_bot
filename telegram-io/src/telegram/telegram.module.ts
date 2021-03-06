import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramController } from './telegram.controller';

import { HttpModule } from '@nestjs/axios';

import { TelegramService } from './telegram.service';

import { UtilsModule } from '../utils/utils.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ActionHandlerService } from './action-handler.service';
import { LoggerModule } from '../logger/logger.module';

const store: any = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

if (process.env.REDIS_PASSWORD) {
  store.password = process.env.REDIS_PASSWORD;
}

@Module({
  imports: [
    ClientsModule.register([{ name: 'WB_STATS', transport: Transport.REDIS, options: store }]),
    TelegrafModule,
    HttpModule,
    UtilsModule,
    LoggerModule,
  ],
  providers: [TelegramController, TelegramService, ActionHandlerService],
  exports: [TelegramService],
})
export class TelegramModule {}
