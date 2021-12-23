import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { HttpModule } from '@nestjs/axios';

import { WbStatsModule } from '../wb_stats/wb-stats.module';
import { WbApiModule } from '../wb-api/wb-api.module';
import { ShopModule } from '../shop/shop.module';
import { TelegramService } from './telegram.service';
import { PaymentModule } from '../payment/payment.module';
import { UtilsModule } from '../utils/utils.module';
import { UserSettingsModule } from '../user-settings/user-settings.module';
const { env } = process;

@Module({
  imports: [
    ProductModule,
    TelegrafModule,
    UserModule,
    HttpModule,
    WbStatsModule,
    WbApiModule,
    ShopModule,
    PaymentModule,
    UtilsModule,
    UserSettingsModule,
  ],
  providers: [TelegramController, TelegramService],
})
export class TelegramModule {}
