import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopRepository } from './repositories/shop.repository';
import { WbApiModule } from '../wb-api/wb-api.module';
import { UserModule } from '../user/user.module';
import { ShopServices } from './services/shop.services';

@Module({
  imports: [TypeOrmModule.forFeature([ShopRepository]), WbApiModule, UserModule],
  providers: [ShopServices],
  controllers: [],
  exports: [ShopServices],
})
export class ShopModule {}
