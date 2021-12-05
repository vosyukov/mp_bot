import { Injectable } from '@nestjs/common';
import { ProductSaleReport, SalesReportRepository } from '../repositories/sales-report.repository';
import { SalesReportEntity } from '../entities/sales-report.entity';

@Injectable()
export class WbStatService {
  constructor(private readonly salesReportRepository: SalesReportRepository) {}

  public async getSalesReportByProduct(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {
    return this.salesReportRepository.getSalesGroupByProduct(shopId, from, to);
  }

  public async getProducts(shopId: string): Promise<any> {
    const result = this.salesReportRepository.query(
      `SELECT  barcode, subjectName FROM ${SalesReportEntity.tableName} GROUP BY barcode, subjectName WHERE shopId = ${shopId};`,
    );

    console.log(result);
  }
}