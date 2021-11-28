import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module';
const { env } = process;

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: env.TG_TOKEN,
    }),
    UserModule,
  ],
  providers: [TelegramController],
})
export class TelegramModule {}
