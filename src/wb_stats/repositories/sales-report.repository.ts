import { EntityRepository, Repository } from 'typeorm';
import { SalesReportEntity } from '../entities/sales-report.entity';

@EntityRepository(SalesReportEntity)
export class SalesReportRepository extends Repository<SalesReportEntity> {
  public async getLastReportLineByUserId(userId: string): Promise<bigint> {
    const result = await this.findOne({
      where: { user: { id: userId } },
      order: { rrdId: 'DESC' },
    });

    return result?.rrdId || BigInt(0);
  }
}
