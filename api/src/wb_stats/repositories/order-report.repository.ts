import { EntityRepository, Repository } from 'typeorm';
import { OrderReportEntity } from '../entities/order-report.entity';
import * as moment from 'moment';

@EntityRepository(OrderReportEntity)
export class OrderReportRepository extends Repository<OrderReportEntity> {
  public async getLastReportLineByApiKeyId(id: string): Promise<Date | null> {
    const result = await this.findOne({
      where: { shop: { id } },
      order: { lastChangeDate: 'DESC' },
    });

    return result?.lastChangeDate ? moment(result?.lastChangeDate).toDate() : null;
  }

}
