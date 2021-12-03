import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { HttpModule } from '@nestjs/axios';
import { WbStatService } from '../wb_stats/services/wb-stat.service';
import { WbStatsModule } from '../wb_stats/wb-stats.module';
const { env } = process;

@Module({
  imports: [
    ProductModule,
    TelegrafModule.forRoot({
      token: env.TG_TOKEN,
    }),
    UserModule,
    HttpModule,
    WbStatsModule,
  ],
  providers: [TelegramController],
})
export class TelegramModule {}
