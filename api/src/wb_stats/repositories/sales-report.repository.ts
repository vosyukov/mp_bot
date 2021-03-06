import { EntityRepository, Repository } from 'typeorm';
import { SalesReportEntity } from '../entities/sales-report.entity';

export interface ProductSaleReport {
  subjectName: string;
  nmId: string;
  barcode: string;
  saName: string;
  salesCount: number;
  retailCount: number;
  refundCount: number;
  refundCosts: number;
  logisticsCosts: number;
  proceeds: number;
  costPrice: number;
  priceCosts: number;
  tax: number;
  profit: number;
  forPay: number;
  retailCost: number;
  price: number;
  retailPpvzVwNds: number;
  retailPpvzVw: number;
  refundPpvzVwNds: number;
  refundPpvzVw: number;
  retailPpvzReward: number;
  refundPpvzReward: number;
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
    const result = await this.query(
      `
       SELECT sr2.subjectName,
              sr2.nmId,
              sr2.saName,
              sr2.barcode,
             ifnull(sh.retailCost, 0)                                                      as retailCost,
             ifnull(sh.retailCount, 0)                                                     as retailCount,
             ifnull(rh.refundCount, 0)                                                     as refundCount,
             ifnull(rh.refundCosts, 0)                                                     as refundCosts,
             ifnull(lh.logisticsCosts, 0)                                                  as logisticsCosts,
             ifnull(ph.price, 0) * (ifnull(sh.retailCount, 0) - ifnull(rh.refundCount, 0)) as priceCosts,
             ifnull(sh.retailPpvzVwNds, 0)                                                 as retailPpvzVwNds,
             ifnull(sh.retailPpvzVw, 0)                                                    as retailPpvzVw,
             ifnull(rh.refundPpvzVwNds, 0)                                                 as refundPpvzVwNds,
             ifnull(rh.refundPpvzVw, 0)                                                    as refundPpvzVw,
             ifnull(rh.refundPpvzReward, 0)                                                as refundPpvzReward,
             ifnull(sh.retailPpvzReward, 0)                                                as retailPpvzReward,
             ifnull(sh.ppvzForPay, 0)                                                      as forPay,
             sr2.shopId                                                                    as shopId
      FROM sales_reports sr2
               LEFT JOIN (SELECT cph1.barcode, cph1.shopId, cph1.price
                          FROM cost_price_history cph1
                          WHERE cph1.shopId = '${shopId}'
                            AND (cph1.barcode, cph1.shopId, cph1.updatedAt) IN
                                (SELECT cph2.barcode, cph2.shopId, MAX(updatedAt) as updatedAt
                                 FROM cost_price_history cph2
                                 WHERE cph1.shopId = cph2.shopId
                                   AND cph1.barcode = cph2.barcode
                                 GROUP BY cph2.barcode, cph2.shopId)) ph
                         on ph.barcode = sr2.barcode AND ph.shopId = sr2.shopId
               LEFT JOIN (SELECT sr.barcode, SUM(sr.deliveryRub) as logisticsCosts
                          FROM sales_reports sr
                          WHERE supplierOperName = '??????????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) lh on lh.barcode = sr2.barcode
               LEFT JOIN (SELECT sr.barcode,
                                 SUM(quantity)     as refundCount,
                                 SUM(retailAmount) as refundCosts,
                                 SUM(ppvzVw)       as refundPpvzVw,
                                 SUM(ppvzVwNds)    as refundPpvzVwNds,
                                 SUM(ppvzReward)   as refundPpvzReward
                          FROM sales_reports sr
                          WHERE docTypeName = '??????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) rh on rh.barcode = sr2.barcode
               LEFT JOIN (SELECT sr.barcode,
                                 SUM(quantity)     as retailCount,
                                 SUM(retailAmount) as retailCost,
                                 SUM(ppvzVw)       as retailPpvzVw,
                                 SUM(ppvzVwNds)    as retailPpvzVwNds,
                                 SUM(ppvzReward)   as retailPpvzReward,
                                 SUM(ppvzForPay)   as ppvzForPay
                          FROM sales_reports sr
                          WHERE docTypeName = '??????????????'
                            AND supplierOperName <> '??????????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) sh on sh.barcode = sr2.barcode
      WHERE sr2.rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
        AND sr2.shopId = '${shopId}'
      GROUP BY sr2.barcode, sr2.subjectName, sr2.saName, sr2.nmId, ph.price,
               rh.refundCount,
               rh.refundPpvzVw,
               rh.refundPpvzVwNds,
               rh.refundPpvzReward,
               sh.retailPpvzReward,
               sh.ppvzForPay,
               rh.refundCosts, sr2.shopId,
               lh.logisticsCosts, sh.retailCount, sh.retailCost, sh.retailPpvzVwNds, sh.retailPpvzVw


`,
    );


    return result as ProductSaleReport[];
  }
  public async getSalesGroupByProduct(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {

    const result = await this.query(
      `
         
 SELECT c.subjectName,
       SUM(c.retailCount)      as retailCount,
       SUM(c.retailCost)       as retailCost,
       SUM(c.refundCount)      as refundCount,
       SUM(c.refundCosts)      as refundCosts,
       SUM(c.logisticsCosts)   as logisticsCosts,
       SUM(c.priceCosts)       as price,
       SUM(c.retailPpvzVwNds)  as retailPpvzVwNds,
       SUM(c.retailPpvzVw)     as retailPpvzVw,
       SUM(c.refundPpvzVwNds)  as refundPpvzVwNds,
       SUM(c.refundPpvzVw)     as refundPpvzVw,
       SUM(c.retailPpvzReward) as retailPpvzReward,
       SUM(c.refundPpvzReward) as refundPpvzReward
FROM (SELECT sr2.subjectName,
             ifnull(sh.retailCost, 0)                                                      as retailCost,
             ifnull(sh.retailCount, 0)                                                     as retailCount,
             ifnull(rh.refundCount, 0)                                                     as refundCount,
             ifnull(rh.refundCosts, 0)                                                     as refundCosts,
             ifnull(lh.logisticsCosts, 0)                                                  as logisticsCosts,
             ifnull(ph.price, 0) * (ifnull(sh.retailCount, 0) - ifnull(rh.refundCount, 0)) as priceCosts,
             ifnull(sh.retailPpvzVwNds, 0)                                                 as retailPpvzVwNds,
             ifnull(sh.retailPpvzVw, 0)                                                    as retailPpvzVw,
             ifnull(rh.refundPpvzVwNds, 0)                                                 as refundPpvzVwNds,
             ifnull(rh.refundPpvzVw, 0)                                                    as refundPpvzVw,
             ifnull(rh.refundPpvzReward, 0)                                                as refundPpvzReward,
             ifnull(sh.retailPpvzReward, 0)                                                as retailPpvzReward,
             sr2.shopId                                                                    as shopId
      FROM sales_reports sr2
               LEFT JOIN (SELECT cph1.barcode, cph1.shopId, cph1.price
                          FROM cost_price_history cph1
                          WHERE cph1.shopId = '${shopId}'
                            AND (cph1.barcode, cph1.shopId, cph1.updatedAt) IN
                                (SELECT cph2.barcode, cph2.shopId, MAX(updatedAt) as updatedAt
                                 FROM cost_price_history cph2
                                 WHERE cph1.shopId = cph2.shopId
                                   AND cph1.barcode = cph2.barcode
                                 GROUP BY cph2.barcode, cph2.shopId)) ph
                         on ph.barcode = sr2.barcode AND ph.shopId = sr2.shopId
               LEFT JOIN (SELECT sr.barcode, SUM(sr.deliveryRub) as logisticsCosts
                          FROM sales_reports sr
                          WHERE supplierOperName = '??????????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) lh on lh.barcode = sr2.barcode
               LEFT JOIN (SELECT sr.barcode,
                                 SUM(quantity)     as refundCount,
                                 SUM(retailAmount) as refundCosts,
                                 SUM(ppvzVw)       as refundPpvzVw,
                                 SUM(ppvzVwNds)    as refundPpvzVwNds,
                                 SUM(ppvzReward)   as refundPpvzReward
                          FROM sales_reports sr
                          WHERE docTypeName = '??????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) rh on rh.barcode = sr2.barcode
               LEFT JOIN (SELECT sr.barcode,
                                 SUM(quantity)     as retailCount,
                                 SUM(retailAmount) as retailCost,
                                 SUM(ppvzVw)       as retailPpvzVw,
                                 SUM(ppvzVwNds)    as retailPpvzVwNds,
                                 SUM(ppvzReward)   as retailPpvzReward
                          FROM sales_reports sr
                          WHERE docTypeName = '??????????????'
                            AND supplierOperName <> '??????????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) sh on sh.barcode = sr2.barcode
      WHERE sr2.rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
        AND sr2.shopId = '${shopId}'
      GROUP BY sr2.barcode, sr2.subjectName, sr2.saName, ph.price,
               rh.refundCount,
               rh.refundPpvzVw,
               rh.refundPpvzVwNds,
               rh.refundPpvzReward,
               sh.retailPpvzReward,
               rh.refundCosts, sr2.shopId,
               lh.logisticsCosts, sh.retailCount, sh.retailCost, sh.retailPpvzVwNds, sh.retailPpvzVw) as c
GROUP BY subjectName;


`,
    );

    return result as ProductSaleReport[];
  }

  public async getSummarySalesReport(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {

    const result = await this.query(
      `
      
      SELECT c.subjectName,
       SUM(c.retailCount)      as retailCount,
       SUM(c.retailCost)       as retailCost,
       SUM(c.refundCount)      as refundCount,
       SUM(c.refundCosts)      as refundCosts,
       SUM(c.logisticsCosts)   as logisticsCosts,
       SUM(c.priceCosts)       as price,
       SUM(c.retailPpvzVwNds)  as retailPpvzVwNds,
       SUM(c.retailPpvzVw)     as retailPpvzVw,
       SUM(c.refundPpvzVwNds)  as refundPpvzVwNds,
       SUM(c.refundPpvzVw)     as refundPpvzVw,
       SUM(c.retailPpvzReward) as retailPpvzReward,
       SUM(c.refundPpvzReward) as refundPpvzReward
FROM (SELECT sr2.subjectName,
             ifnull(sh.retailCost, 0)                                                      as retailCost,
             ifnull(sh.retailCount, 0)                                                     as retailCount,
             ifnull(rh.refundCount, 0)                                                     as refundCount,
             ifnull(rh.refundCosts, 0)                                                     as refundCosts,
             ifnull(lh.logisticsCosts, 0)                                                  as logisticsCosts,
             ifnull(ph.price, 0) * (ifnull(sh.retailCount, 0) - ifnull(rh.refundCount, 0)) as priceCosts,
             ifnull(sh.retailPpvzVwNds, 0)                                                 as retailPpvzVwNds,
             ifnull(sh.retailPpvzVw, 0)                                                    as retailPpvzVw,
             ifnull(rh.refundPpvzVwNds, 0)                                                 as refundPpvzVwNds,
             ifnull(rh.refundPpvzVw, 0)                                                    as refundPpvzVw,
             ifnull(rh.refundPpvzReward, 0)                                                as refundPpvzReward,
             ifnull(sh.retailPpvzReward, 0)                                                as retailPpvzReward,
             sr2.shopId                                                                    as shopId
      FROM sales_reports sr2
               LEFT JOIN (SELECT cph1.barcode, cph1.shopId, cph1.price
                          FROM cost_price_history cph1
                          WHERE cph1.shopId = '${shopId}'
                            AND (cph1.barcode, cph1.shopId, cph1.updatedAt) IN
                                (SELECT cph2.barcode, cph2.shopId, MAX(updatedAt) as updatedAt
                                 FROM cost_price_history cph2
                                 WHERE cph1.shopId = cph2.shopId
                                   AND cph1.barcode = cph2.barcode
                                 GROUP BY cph2.barcode, cph2.shopId)) ph
                         on ph.barcode = sr2.barcode AND ph.shopId = sr2.shopId
               LEFT JOIN (SELECT sr.barcode, SUM(sr.deliveryRub) as logisticsCosts
                          FROM sales_reports sr
                          WHERE supplierOperName = '??????????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) lh on lh.barcode = sr2.barcode
               LEFT JOIN (SELECT sr.barcode,
                                 SUM(quantity)     as refundCount,
                                 SUM(retailAmount) as refundCosts,
                                 SUM(ppvzVw)       as refundPpvzVw,
                                 SUM(ppvzVwNds)    as refundPpvzVwNds,
                                 SUM(ppvzReward)   as refundPpvzReward
                          FROM sales_reports sr
                          WHERE docTypeName = '??????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) rh on rh.barcode = sr2.barcode
               LEFT JOIN (SELECT sr.barcode,
                                 SUM(quantity)     as retailCount,
                                 SUM(retailAmount) as retailCost,
                                 SUM(ppvzVw)       as retailPpvzVw,
                                 SUM(ppvzVwNds)    as retailPpvzVwNds,
                                 SUM(ppvzReward)   as retailPpvzReward
                          FROM sales_reports sr
                          WHERE docTypeName = '??????????????'
                            AND supplierOperName <> '??????????????????'
                            AND rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
                            AND sr.shopId = '${shopId}'
                          GROUP BY sr.barcode) sh on sh.barcode = sr2.barcode
      WHERE sr2.rrDt BETWEEN '${from.toISOString()}' AND '${to.toISOString()}'
        AND sr2.shopId = '${shopId}'
      GROUP BY sr2.barcode, sr2.subjectName, sr2.saName, ph.price,
               rh.refundCount,
               rh.refundPpvzVw,
               rh.refundPpvzVwNds,
               rh.refundPpvzReward,
               sh.retailPpvzReward,
               rh.refundCosts, sr2.shopId,
               lh.logisticsCosts, sh.retailCount, sh.retailCost, sh.retailPpvzVwNds, sh.retailPpvzVw) as c
GROUP BY subjectName;



`,
    );

    return result.map((item) => ({
      subjectName: item.subjectName,
      nmId: item.nmId,
      barcode: item.barcode,
      saName: item.saName,
      salesCount: Number(item.salesCount),
      retailCount: Number(item.retailCount),
      refundCount: Number(item.refundCount),
      refundCosts: Number(item.refundCosts),
      logisticsCosts: Number(item.logisticsCosts),
      proceeds: Number(item.proceeds),
      costPrice: Number(item.costPrice),
      tax: Number(item.tax),
      profit: Number(item.profit),
      forPay: Number(item.forPay),
      retailCost: Number(item.retailCost),
      price: Number(item.price),
      retailPpvzVwNds: Number(item.retailPpvzVwNds),
      retailPpvzVw: Number(item.retailPpvzVw),
      refundPpvzVwNds: Number(item.refundPpvzVwNds),
      refundPpvzVw: Number(item.refundPpvzVw),
      retailPpvzReward: Number(item.retailPpvzReward),
      refundPpvzReward: Number(item.refundPpvzReward),
    }));
  }
}
