import { Module } from '@nestjs/common';
import { ProductPriceTemplateService } from './services/product-price-template.service';
import { WbApiModule } from '../wb-api/wb-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WbProductService } from './services/wb-product.service';
import { PriceHistoryRepository } from './repositories/price-history.repository';
import { UtilsModule } from '../utils/utils.module';
import { UserModule } from '../user/user.module';
import { ShopModule } from '../shop/shop.module';

@Module({
  imports: [TypeOrmModule.forFeature([PriceHistoryRepository]), UtilsModule, ShopModule, WbApiModule, ScheduleModule.forRoot()],
  providers: [ProductPriceTemplateService, WbProductService],
  exports: [ProductPriceTemplateService],
})
export class ProductModule {}
