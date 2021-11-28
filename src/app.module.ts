import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WbStatsModule } from './wb_stats/wb-stats.module';

@Module({
  imports: [TelegramModule, TypeOrmModule.forRoot(), WbStatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
