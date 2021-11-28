import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import { map } from 'rxjs';

export interface ReportRow {
  realizationreport_id: bigint;
  rrd_id: bigint;
  gi_id: bigint;
  subject_name: string;
  doc_type_name: string;
}

@Injectable()
export class WbApiService {
  constructor(private httpService: HttpService) {}

  public async getSalesReport(wbApiKey: string, rrdId: bigint): Promise<ReportRow[] | null> {
    return this.httpService
      .get(`https://suppliers-stats.wildberries.ru/api/v1/supplier/reportDetailByPeriod`, {
        params: {
          key: wbApiKey,
          dateFrom: moment().subtract(4, 'M').format('YYYY-MM-DD'),
          dateTo: moment().format('YYYY-MM-DD'),
          rrdid: rrdId,
          limit: 1000,
        },
        responseType: 'json',
      })
      .pipe(map((response) => response.data))
      .toPromise();
  }
}

moment().format('dddd, MMMM Do YYYY, h:mm:ss a');
