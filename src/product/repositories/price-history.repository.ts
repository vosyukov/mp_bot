import { EntityRepository, Repository } from 'typeorm';
import { PriceHistoryEntity } from '../entities/price-history.entity';
import { ProductEntity } from '../entities/product.entity';

@EntityRepository(PriceHistoryEntity)
export class PriceHistoryRepository extends Repository<PriceHistoryEntity> {
  public async getCurrentPrice(): Promise<{ nmId: string; supplierArticle: string; barcode: string; price: number }[]> {
    // const result = await this.query(
    //   'select * from `' +
    //     PriceHistoryEntity.tableName +
    //     '` ph LEFT JOIN `' +
    //     ProductEntity.tableName +
    //     '` p on p.nmId = ph.productNmId where (ph.productNmId, ph.updatedAt) in (SELECT productNmId, MAx(updatedAt) FROM `' +
    //     PriceHistoryEntity.tableName +
    //     '` GROUP BY productNmId) ORDER BY ph.productNmId desc;',
    // );

    const result = await this.query(
      `SELECT nmId, barcode, supplierArticle, IFNULL(ph.price, 0) as price FROM products p LEFT JOIN price_history ph on  p.nmId = ph.productNmId and (ph.productNmId, ph.updatedAt) in (SELECT productNmId, MAx(updatedAt) FROM price_history GROUP BY productNmId) ORDER BY ph.productNmId desc ;`,
    );

    return result as { nmId: string; supplierArticle: string; barcode: string; price: number }[];
  }
}
