import { Injectable } from '@nestjs/common';
import { SalesReportRepository } from '../repositories/sales-report.repository';

@Injectable()
export class WbStatService {
  constructor(private readonly salesReportRepository: SalesReportRepository) {}

  public async getSalesReportByProduct(from: Date, to: Date): Promise<any> {
    return this.salesReportRepository.getSalesGroupByProduct(new Date(), new Date());
  }
}
