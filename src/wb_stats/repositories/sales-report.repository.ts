import { EntityRepository, Repository } from 'typeorm';
import { SalesReportEntity } from '../entities/sales-report.entity';

@EntityRepository(SalesReportEntity)
export class SalesReportRepository extends Repository<SalesReportEntity> {
  public async getLastReportLineByApiKeyId(id: string): Promise<bigint> {
    const result = await this.findOne({
      where: { token: { id } },
      order: { rrdId: 'DESC' },
    });

    return result?.rrdId || BigInt(0);
  }

  public async getSalesGroupByProduct(from: Date, to: Date): Promise<any> {
    const result = await this.query(
      `SELECT sr.subjectName,
         sr.barcode,
         sr.saName,
         COUNT(*)                                                                         as count,
         SUM(ppvzForPay)                                                                  as proceeds,
         ifnull(ph.price, 0) * COUNT(*)                                                   as costPrice,
         ROUND(SUM(ppvzForPay) * 0.07)                                                    as tax,
         SUM(ppvzForPay) - ifnull(ph.price, 0) * COUNT(*) - ROUND(SUM(ppvzForPay) * 0.07) as profit
      FROM sales_reports sr
         LEFT JOIN products p on sr.barcode = p.barcode
         LEFT JOIN price_history ph on ph.productNmId = p.nmId
      WHERE docTypeName = 'Продажа'
        AND supplierOperName = 'Продажа'
        AND saleDt BETWEEN '2021-11-01 00:00:01' AND '2021-11-30 23:59:59'
      GROUP BY sr.barcode, sr.subjectName, sr.saName, ph.price`,
    );
    console.log(result);
    return result;
  }
}
