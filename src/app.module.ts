import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WbStatsModule } from './wb_stats/wb-stats.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductModule } from './product/product.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ScheduleModule.forRoot(), HttpModule, TelegramModule, TypeOrmModule.forRoot(), WbStatsModule, ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
