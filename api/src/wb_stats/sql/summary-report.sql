SELECT c.subjectName,
       SUM(c.retailCount)      as retailCount,
       SUM(c.retailCost)       as retailCost,
       SUM(c.refundCount)      as refundCount,
       SUM(c.refundCosts)      as refundCosts,
       SUM(c.logisticsCosts)   as logisticsCosts,

       SUM(c.price)            as price,

       SUM(c.retailPpvzVwNds)  as retailPpvzVwNds,
       SUM(c.retailPpvzVw)     as retailPpvzVw,
       SUM(c.refundPpvzVwNds)  as refundPpvzVwNds,
       SUM(c.refundPpvzVw)     as refundPpvzVw,
       SUM(c.retailPpvzReward) as retailPpvzReward,
       SUM(c.refundPpvzReward) as refundPpvzReward
FROM (SELECT sr2.subjectName,
             ifnull(sh.retailCost, 0)       as retailCost,
             ifnull(sh.retailCount, 0)      as retailCount,
             ifnull(rh.refundCount, 0)      as refundCount,
             ifnull(rh.refundCosts, 0)      as refundCosts,
             ifnull(lh.logisticsCosts, 0)   as logisticsCosts,
             ifnull(ph.price, 0)            as price,
             ifnull(sh.retailPpvzVwNds, 0)  as retailPpvzVwNds,
             ifnull(sh.retailPpvzVw, 0)     as retailPpvzVw,
             ifnull(rh.refundPpvzVwNds, 0)  as refundPpvzVwNds,
             ifnull(rh.refundPpvzVw, 0)     as refundPpvzVw,
             ifnull(rh.refundPpvzReward, 0) as refundPpvzReward,
             ifnull(sh.retailPpvzReward, 0) as retailPpvzReward
      FROM sales_reports sr2
               LEFT JOIN (
          SELECT barcode, shopId, price
          FROM cost_price_history
          WHERE shopId = '${shopId}'
            AND (barcode, shopId, updatedAt) IN (SELECT cph.barcode, cph.shopId, MAX(updatedAt) as updatedAt
                                                 FROM cost_price_history cph
                                                 WHERE shopId = '${shopId}'
                                                   AND barcode = cph.barcode
                                                 GROUP BY cph.barcode, cph.shopId)
      ) ph on ph.barcode = sr2.barcode AND ph.shopId = sr2.shopId
               LEFT JOIN (SELECT sr.barcode, SUM(sr.deliveryRub) as logisticsCosts
                          FROM sales_reports sr
                          WHERE supplierOperName = 'Логистика'
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
                          WHERE docTypeName = 'Возврат'
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
                          WHERE docTypeName = 'Продажа'
                            AND supplierOperName <> 'Логистика'
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
