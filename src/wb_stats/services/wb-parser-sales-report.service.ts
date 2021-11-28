import { Injectable } from '@nestjs/common';
import { UserFetcherService } from '../../user/services/user-fetcher.service';
import { SalesReportRepository } from '../repositories/sales-report.repository';
import { ReportRow, WbApiService } from './wb-api.service';
import { SalesReportEntity } from '../entities/sales-report.entity';

@Injectable()
export class WbParserSalesReportService {
  constructor(
    private readonly userFetcherService: UserFetcherService,
    private readonly salesReportRepository: SalesReportRepository,
    private readonly wbApiService: WbApiService,
  ) {
    this.parse();
  }

  public async parse(): Promise<void> {
    const users = await this.userFetcherService.getUsersWithValidWBApiKey();
    for (const user of users) {
      let res: ReportRow[] | null;
      const { id, wbApiKey } = user;

      do {
        const lasLine = await this.salesReportRepository.getLastReportLineByUserId(id);
        res = await this.wbApiService.getSalesReport(wbApiKey, lasLine);
        console.log(res);

        if (res) {
          await this.salesReportRepository
            .createQueryBuilder()
            .insert()
            .into(SalesReportEntity)
            .values(
              res.map((item) => ({
                realizationReportId: item.realizationreport_id,
                rrdId: item.rrd_id,
                giId: item.gi_id,
                subjectName: item.subject_name,
                docTypeName: item.doc_type_name,
                user,
              })),
            )
            .onConflict(`("id") DO NOTHING`)
            .execute();
        }
      } while (res);
    }
  }
}
