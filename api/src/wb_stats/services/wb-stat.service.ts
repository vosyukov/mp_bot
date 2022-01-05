import { Injectable } from '@nestjs/common';
import { ProductSaleReport, SalesReportRepository } from '../repositories/sales-report.repository';
import { SalesReportEntity } from '../entities/sales-report.entity';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ShopServices } from '../../shop/services/shop.services';

@Injectable()
export class WbStatService {
  constructor(
    private readonly salesReportRepository: SalesReportRepository,
    @InjectQueue('wb_parser')
    private salesReportQueue: Queue,
    private readonly shopServices: ShopServices,
  ) {}

  @Cron('0 0 * * * *')
  public async parse(): Promise<void> {
    console.log('start cron');
    const shops = await this.shopServices.getAllShops();
    for (const shop of shops) {
      console.log('add to q ' + shop.id);
      this.salesReportQueue.add('parseSalesReport', {
        jobId: shop.id,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1,
        delay: 3,
        shopId: shop.id,
      });
      this.salesReportQueue.add('parseOrdersReport', {
        jobId: shop.id,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1,
        delay: 3,
        shopId: shop.id,
      });
    }
  }

  public async parseByShopId(shopId: string): Promise<void> {
    await this.salesReportQueue.add('parseSalesReport', {
      jobId: shopId,
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      delay: 3,
      shopId: shopId,
    });
  }

  public async getLastDateUpdateReport(shopId: string): Promise<Date | null> {
    const item = await this.salesReportRepository.findOne({ where: { shopId }, order: { rrdId: 'DESC' } });
    return item?.rrDt ?? null;
  }

  public async getSalesReport(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {
    return this.salesReportRepository.getSalesGroup(shopId, from, to);
  }

  public async getSalesReportByProduct(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {
    return this.salesReportRepository.getSalesGroupByProduct(shopId, from, to);
  }

  public async getSummarySalesReport(shopId: string, from: Date, to: Date): Promise<ProductSaleReport[]> {
    return this.salesReportRepository.getSummarySalesReport(shopId, from, to);
  }

  public async getProducts(shopId: string): Promise<any> {
    const result = this.salesReportRepository.query(
      `SELECT  barcode, subjectName FROM ${SalesReportEntity.tableName} GROUP BY barcode, subjectName WHERE shopId = ${shopId};`,
    );
  }
}
