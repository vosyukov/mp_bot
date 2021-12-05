import { EntityRepository, Repository } from 'typeorm';
import { PriceHistoryEntity } from '../entities/price-history.entity';
import { SalesReportEntity } from '../../wb_stats/entities/sales-report.entity';

export interface Product {
  barcode: string;
  brandName: string;
  subjectName: string;
  saName: string;
  price: number;
}

@EntityRepository(PriceHistoryEntity)
export class PriceHistoryRepository extends Repository<PriceHistoryEntity> {
  public async getCurrentPrice(shopId: string): Promise<Product[]> {
    const result = await this.query(
      `
        SELECT a.barcode, a.brandName, a.subjectName, a.saName, a.price
        FROM (SELECT sr.barcode, ifnull(ph.price, 0) as price, sr.subjectName, sr.saName, sr.brandName
              FROM ${SalesReportEntity.tableName} sr
                       LEFT JOIN (
                  SELECT price, barcode, shopId
                  FROM ${PriceHistoryEntity.tableName} cph
                  WHERE (cph.barcode, cph.shopId, cph.updatedAt) in
                        (SELECT barcode, shopId, MAx(updatedAt) FROM ${PriceHistoryEntity.tableName} WHERE shopId = '${shopId}' GROUP BY barcode, shopId)
              ) ph on sr.barcode = ph.barcode AND sr.shopId = ph.shopId
              WHERE sr.shopId = '${shopId}') a
        GROUP BY a.barcode, a.brandName, a.subjectName, a.saName, a.price;
      `,
    );

    return result as Product[];
  }
}
