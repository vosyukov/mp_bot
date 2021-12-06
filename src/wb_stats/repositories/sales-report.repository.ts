import { EntityRepository, Repository } from 'typeorm';
import { SalesReportEntity } from '../entities/sales-report.entity';
import { PriceHistoryEntity } from '../../product/entities/price-history.entity';
import * as moment from 'moment';

export interface ProductSaleReport {
  subjectName: string;
  barcode: string;
  saName: string;
  salesCount: number;
  refundCount: number;
  refundCosts: number;
  logisticsCosts: number;
  proceeds: number;
  costPrice: number;
  tax: number;
  profit: number;
  forPay: number;
}

@EntityRepository(SalesReportEntity)
export class SalesReportRepository extends Repository<SalesReportEntity> {
  public async getLastReportLineByApiKeyId(id: string): Promise<bigint> {
    const result = await this.findOne({
      where: { shop: { id } },
      order: { rrdId: 'DESC' },
    });

    return result?.rrdId || BigInt(0);
  }

  public async getSalesGroupByProduct(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {
    console.log(from.toISOString());
    console.log(to.toISOString());
    const result = await this.query(
      `SELECT sr.subjectName,
       sr.barcode,
       sr.saName,
       SUM(sr.ppvzForPay)                                                                            as forPay,
       SUM(sr.quantity)                                                                              as salesCount,
       ifnull(rh.count, 0)                                                                           as refundCount,
       ifnull(rh.refundCosts, 0)                                                                     as refundCosts,
       ifnull(lh.logisticsCosts, 0)                                                                  as logisticsCosts,
       SUM(sr.ppvzForPay) - ifnull(rh.refundCosts, 0) - ifnull(lh.logisticsCosts, 0)                 as proceeds,
       ifnull(ph.price, 0) * (SUM(sr.quantity) - ifnull(rh.count, 0))                                        as costPrice,
       ROUND((SUM(sr.ppvzForPay) - ifnull(rh.refundCosts, 0) - ifnull(lh.logisticsCosts, 0)) * 0.07) as tax,
       (SUM(sr.ppvzForPay) - ifnull(rh.refundCosts, 0) - ifnull(lh.logisticsCosts, 0) -
        ROUND((SUM(sr.ppvzForPay) - ifnull(rh.refundCosts, 0) - ifnull(lh.logisticsCosts, 0)) * 0.07) -
        ifnull(ph.price, 0) * (SUM(sr.quantity) - ifnull(rh.count, 0)) )                                     as profit
FROM ${SalesReportEntity.tableName} sr
         LEFT JOIN (
                  SELECT price, barcode, shopId
                  FROM ${PriceHistoryEntity.tableName} cph
                  WHERE (cph.barcode, cph.shopId, cph.updatedAt) in
                        (SELECT barcode, shopId, MAx(updatedAt) FROM ${
                          PriceHistoryEntity.tableName
                        } WHERE shopId = '${shopId}' GROUP BY barcode, shopId)
              ) ph on ph.barcode = sr.barcode AND ph.shopId = sr.shopId
         LEFT JOIN (SELECT sr.barcode, SUM(sr.deliveryRub) as logisticsCosts
                    FROM ${SalesReportEntity.tableName} sr
                    WHERE supplierOperName = 'Логистика'
                      AND saleDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                    GROUP BY sr.barcode) lh on lh.barcode = sr.barcode
         LEFT JOIN (SELECT sr.barcode,
                           SUM(quantity)         as count,
                           SUM(ppvzForPay) as refundCosts
                    FROM ${SalesReportEntity.tableName} sr
                    WHERE supplierOperName = 'Возврат'
                      AND saleDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                    GROUP BY sr.barcode) rh on rh.barcode = sr.barcode
WHERE supplierOperName = 'Продажа'
  AND saleDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' AND sr.shopId = '${shopId}'
GROUP BY sr.barcode, sr.subjectName, sr.saName, ph.price, rh.count, sr.barcode, sr.saName, sr.subjectName,
         rh.refundCosts,
         lh.logisticsCosts


`,
    );

    return result as ProductSaleReport[];
  }
}
