import { Module } from '@nestjs/common';
import { ProductPriceTemplateService } from './services/product-price-template.service';
import { WbApiModule } from '../wb-api/wb-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './repositories/product.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { WbProductParserService } from './services/wb-product-parser.service';
import { WbProductService } from './services/wb-product.service';
import { PriceHistoryRepository } from './repositories/price-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductRepository, PriceHistoryRepository]), WbApiModule, ScheduleModule.forRoot()],
  providers: [ProductPriceTemplateService, WbProductParserService, WbProductService],
  exports: [ProductPriceTemplateService],
})
export class ProductModule {}
