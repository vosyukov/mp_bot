import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WbApiService } from '../../wb-api/wb-api.service';

import { WbApiTokenService } from '../../wb-api/wb-api-token.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductEntity } from '../entities/product.entity';
import { UtilsService } from '../../utils/utils.service';

@Injectable()
export class WbProductParserService {
  constructor(
    private readonly wbApiService: WbApiService,
    private readonly wbApiTokenService: WbApiTokenService,
    private readonly productRepository: ProductRepository,
  ) {}

  @Cron('45 * * * * *')
  public async parse(): Promise<void> {
    console.log('parse products');
    const result = await this.wbApiTokenService.findAll();
    console.log(result.length);

    for (const r of result) {
      const { id, token } = r;
      const res = await this.wbApiService.getStocks(token);
      console.log(res.length);

      const items = res.map((item) => {
        return {
          nmId: item.nmId,
          barcode: item.barcode,
          supplierArticle: item.supplierArticle,
          status: item.status,
          token: r,
        };
      });

      await this.productRepository.createQueryBuilder().insert().into(ProductEntity).values(items).orUpdate(['status'], ['nmId']).execute();
    }
  }
}
