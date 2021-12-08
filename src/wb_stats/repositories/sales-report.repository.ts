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

  public async getSalesGroup(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {
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
FROM sales_reports sr2
         LEFT JOIN (
            SELECT barcode, shopId, price
            FROM cost_price_history
            WHERE  shopId= '${shopId}' AND (barcode, shopId, updatedAt) IN (SELECT cph.barcode, cph.shopId, MAX(updatedAt) as updatedAt
                    FROM cost_price_history cph
                    WHERE shopId = '${shopId}' AND barcode = cph.barcode
                    GROUP BY cph.barcode, cph.shopId)
            ) ph on ph.barcode = sr2.barcode AND ph.shopId = sr2.shopId
         LEFT JOIN (SELECT sr.barcode, SUM(sr.deliveryRub) as logisticsCosts
                    FROM sales_reports sr
                    WHERE supplierOperName = 'Логистика'
                      AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' 
                      AND sr.shopId =  '${shopId}'
                    GROUP BY sr.barcode) lh on lh.barcode = sr2.barcode
         LEFT JOIN (SELECT sr.barcode,
                           SUM(quantity)   as refundCount,
                           SUM(ppvzForPay) as refundCosts
                    FROM sales_reports sr
                    WHERE docTypeName = 'Возврат'
                      AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' 
                      AND sr.shopId =  '${shopId}'
                    GROUP BY sr.barcode) rh on rh.barcode = sr2.barcode
         LEFT JOIN (SELECT sr.barcode,
                           SUM(quantity)   as salesCount,
                           SUM(ppvzForPay) as salesCost
                    FROM sales_reports sr
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
  public async getSalesGroupByProduct(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {
    console.log(from.toISOString());
    console.log(to.toISOString());
    const result = await this.query(
      `
         
         SELECT sr2.subjectName,
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
FROM sales_reports sr2
         LEFT JOIN (
            SELECT subjectName, shopId, price
            FROM cost_price_history
            WHERE  shopId= '${shopId}' AND (subjectName, shopId, updatedAt) IN (SELECT cph.subjectName, cph.shopId, MAX(updatedAt) as updatedAt
                    FROM cost_price_history cph
                    WHERE shopId = '${shopId}' AND subjectName = cph.subjectName
                    GROUP BY cph.subjectName, cph.shopId)
            ) ph on ph.subjectName = sr2.subjectName AND ph.shopId = sr2.shopId
         LEFT JOIN (SELECT sr.subjectName, SUM(sr.deliveryRub) as logisticsCosts
                    FROM sales_reports sr
                    WHERE supplierOperName = 'Логистика'
                      AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' 
                      AND sr.shopId =  '${shopId}'
                    GROUP BY sr.subjectName) lh on lh.subjectName = sr2.subjectName
         LEFT JOIN (SELECT sr.subjectName,
                           SUM(quantity)   as refundCount,
                           SUM(ppvzForPay) as refundCosts
                    FROM sales_reports sr
                    WHERE docTypeName = 'Возврат'
                      AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' 
                      AND sr.shopId =  '${shopId}'
                    GROUP BY sr.subjectName) rh on rh.subjectName = sr2.subjectName
         LEFT JOIN (SELECT sr.subjectName,
                           SUM(quantity)   as salesCount,
                           SUM(ppvzForPay) as salesCost
                    FROM sales_reports sr
                    WHERE docTypeName = 'Продажа'
                      AND supplierOperName <> 'Логистика'
                      AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' 
                      AND sr.shopId =  '${shopId}'
                    GROUP BY sr.subjectName) sh on sh.subjectName = sr2.subjectName
WHERE sr2.rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}' AND sr2.shopId = '${shopId}'
GROUP BY  sr2.subjectName,  ph.price, rh.refundCount, rh.refundCosts, sr2.shopId, lh.logisticsCosts, sh.salesCount, sh.salesCost


`,
    );

    return result as ProductSaleReport[];
  }
}
