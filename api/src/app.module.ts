import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WbStatsModule } from './wb_stats/wb-stats.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductModule } from './product/product.module';
import { HttpModule } from '@nestjs/axios';
import { UtilsModule } from './utils/utils.module';
import { env } from 'process';
import { BullModule } from '@nestjs/bull';
import { PaymentModule } from './payment/payment.module';

const store: any = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

if (env.REDIS_PASSWORD) {
  store.password = env.REDIS_PASSWORD;
}

@Module({
  imports: [
    AppModule,
    ScheduleModule.forRoot(),
    HttpModule,
    UtilsModule,
    BullModule.forRoot({
      redis: store,
    }),
    TypeOrmModule.forRoot(),
    WbStatsModule,
    ProductModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
