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
      `
         
         SELECT sr2.subjectName,
       sr2.barcode,
       sr2.saName,
       sr2.shopId,
       ifnull(sh.salesCost, 0)                                                                        as forPay,
       ifnull(sh.salesCount, 0)                                                                       as salesCount,
       ifnull(rh.refundCount, 0)                                                                      as refundCount,
       ifnull(rh.refundCosts, 0)                                                                      as refundCosts,
       ifnull(lh.logisticsCosts, 0)                                                                   as logisticsCosts,
       ifnull(sh.salesCost, 0)   - ifnull(rh.refundCosts, 0) - ifnull(lh.logisticsCosts, 0)           as proceeds,
       ifnull(ph.price, 0) * (ifnull(sh.salesCount, 0) - ifnull(rh.refundCount, 0))                   as costPrice,
       ROUND((ifnull(sh.salesCost, 0)   - ifnull(rh.refundCosts, 0) - ifnull(lh.logisticsCosts, 0)) * 0.07) as tax,
       (ifnull(sh.salesCost, 0)   - ifnull(rh.refundCosts, 0) - ifnull(lh.logisticsCosts, 0) -
        ROUND((ifnull(sh.salesCost, 0)   - ifnull(rh.refundCosts, 0) - ifnull(lh.logisticsCosts, 0)) * 0.07) -
        ifnull(ph.price, 0) * (ifnull(sh.salesCount, 0) - ifnull(rh.refundCount, 0)))                 as profit
FROM test.sales_reports sr2
         LEFT JOIN (
    SELECT price, barcode, shopId
    FROM test.cost_price_history cph
    WHERE (cph.barcode, cph.shopId, cph.updatedAt) in
          (SELECT barcode, shopId, MAx(updatedAt)
           FROM test.sales_reports sr
           WHERE shopId = '${shopId}'
           GROUP BY barcode, shopId)
) ph on ph.barcode = sr2.barcode AND ph.shopId = sr2.shopId
         LEFT JOIN (SELECT sr.barcode, SUM(sr.deliveryRub) as logisticsCosts
                    FROM test.sales_reports sr
                    WHERE supplierOperName = 'Логистика'
                      AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' 
                      AND sr.shopId =  '${shopId}'
                    GROUP BY sr.barcode) lh on lh.barcode = sr2.barcode
         LEFT JOIN (SELECT sr.barcode,
                           SUM(quantity)   as refundCount,
                           SUM(ppvzForPay) as refundCosts
                    FROM test.sales_reports sr
                    WHERE docTypeName = 'Возврат'
                      AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' 
                      AND sr.shopId =  '${shopId}'
                    GROUP BY sr.barcode) rh on rh.barcode = sr2.barcode
         LEFT JOIN (SELECT sr.barcode,
                           SUM(quantity)   as salesCount,
                           SUM(ppvzForPay) as salesCost
                    FROM test.sales_reports sr
                    WHERE docTypeName = 'Продажа'
                      AND supplierOperName <> 'Логистика'
                      AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' 
                      AND sr.shopId =  '${shopId}'
                    GROUP BY sr.barcode) sh on sh.barcode = sr2.barcode
WHERE sr2.rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' AND sr2.shopId = '${shopId}'
GROUP BY sr2.barcode, sr2.subjectName, sr2.saName, ph.price, rh.refundCount, sr2.barcode, sr2.saName, sr2.subjectName,
         rh.refundCosts, sr2.shopId,
         lh.logisticsCosts, sh.salesCount, sh.salesCost


`,
    );

    return result as ProductSaleReport[];
  }
}
