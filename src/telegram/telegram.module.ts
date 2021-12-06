import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { HttpModule } from '@nestjs/axios';
import { WbStatService } from '../wb_stats/services/wb-stat.service';
import { WbStatsModule } from '../wb_stats/wb-stats.module';
import { WbApiModule } from '../wb-api/wb-api.module';
import { ShopModule } from '../shop/shop.module';
import { TelegramService } from './telegram.service';
const { env } = process;

@Module({
  imports: [ProductModule, TelegrafModule, UserModule, HttpModule, WbStatsModule, WbApiModule, ShopModule],
  providers: [TelegramController, TelegramService],
})
export class TelegramModule {}
