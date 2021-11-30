import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { HttpModule } from '@nestjs/axios';
const { env } = process;

@Module({
  imports: [
    ProductModule,
    TelegrafModule.forRoot({
      token: env.TG_TOKEN,
    }),
    UserModule,
    HttpModule,
  ],
  providers: [TelegramController],
})
export class TelegramModule {}
