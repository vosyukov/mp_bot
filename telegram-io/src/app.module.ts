import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { HttpModule } from '@nestjs/axios';
import { UtilsModule } from './utils/utils.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { env } from 'process';

const store: any = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

if (process.env.REDIS_PASSWORD) {
  store.password = process.env.REDIS_PASSWORD;
}

@Module({
  imports: [
    HttpModule,
    UtilsModule,
    TelegrafModule.forRoot({
      token: env.TG_TOKEN,
    }),
    TelegramModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
