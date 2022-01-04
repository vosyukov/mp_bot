import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WbStatsModule } from './wb_stats/wb-stats.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductModule } from './product/product.module';
import { HttpModule } from '@nestjs/axios';
import { UtilsModule } from './utils/utils.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { env } from 'process';
import { BullModule } from '@nestjs/bull';

const store: any = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

if (process.env.REDIS_PASSWORD) {
  store.password = process.env.REDIS_PASSWORD;
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    UtilsModule,
    TelegrafModule.forRoot({
      token: env.TG_TOKEN,
    }),
    BullModule.forRoot({
      redis: store,
    }),
    TelegramModule,
    TypeOrmModule.forRoot(),
    WbStatsModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
