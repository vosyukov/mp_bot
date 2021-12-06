import { Injectable } from '@nestjs/common';
import { UserService } from '../user/services/user.service';
import { WbXlsxReportBuilder } from '../wb_stats/services/wb-xlsx-report-builder';
import * as ExcelJS from 'exceljs';
import * as moment from 'moment';

@Injectable()
export class TelegramService {
  constructor(private readonly userService: UserService, private readonly wbXlsxReportBuilder: WbXlsxReportBuilder) {}

  public async getSaleReport(userTgId: number, fromDate: Date, toDate: Date): Promise<{ filename: string; source: ExcelJS.Buffer }> {
    const user = await this.userService.findUserByTgId(userTgId);
    const buffer = await this.wbXlsxReportBuilder.createSalesReport(user.id, fromDate, toDate);
    return { filename: `wb_report_${moment(fromDate).format('DD.MM.YYYY')}-${moment(toDate).format('DD.MM.YYYY')}.xlsx`, source: buffer };
  }
}
