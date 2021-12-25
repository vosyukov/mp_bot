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

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    UtilsModule,
    TelegrafModule.forRoot({
      token: env.TG_TOKEN,
    }),
    TypeOrmModule.forRoot(),
    WbStatsModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
