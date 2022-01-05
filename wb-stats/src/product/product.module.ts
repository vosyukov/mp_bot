import { Module } from '@nestjs/common';
import { ProductPriceTemplateService } from './services/product-price-template.service';
import { WbApiModule } from '../wb-api/wb-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WbProductService } from './services/wb-product.service';
import { PriceHistoryRepository } from './repositories/price-history.repository';
import { UtilsModule } from '../utils/utils.module';

import { ShopModule } from '../shop/shop.module';
import { TgProductController } from './tg-product.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([PriceHistoryRepository]), UtilsModule, ShopModule, WbApiModule, UserModule, ScheduleModule.forRoot()],
  providers: [ProductPriceTemplateService, WbProductService],
  controllers: [TgProductController],
  exports: [ProductPriceTemplateService],
})
export class ProductModule {}
