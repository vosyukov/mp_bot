import { Injectable } from '@nestjs/common';
import { UserService } from '../user/services/user.service';
import { WbXlsxReportBuilder } from '../wb_stats/services/wb-xlsx-report-builder';
import * as ExcelJS from 'exceljs';
import * as moment from 'moment';
import { ProductPriceTemplateService } from '../product/services/product-price-template.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class TelegramService {
  constructor(
    private readonly userService: UserService,
    private readonly wbXlsxReportBuilder: WbXlsxReportBuilder,
    private readonly productPriceTemplateService: ProductPriceTemplateService,
    private readonly paymentService: PaymentService,
  ) {}

  public async getSaleReportByVendorCodeForCurrentMonth(userTgId: number): Promise<{ filename: string; source: ExcelJS.Buffer }> {
    const fromDate = moment().startOf('month').toDate();
    const toDate = moment().endOf('month').toDate();

    return this.getSaleReportByVendorCode(userTgId, fromDate, toDate);
  }

  public async getSaleReportByVendorCodeForPreviousMonth(userTgId: number): Promise<{ filename: string; source: ExcelJS.Buffer }> {
    const fromDate = moment().subtract(1, 'months').startOf('month').toDate();
    const toDate = moment().subtract(1, 'months').endOf('month').toDate();

    return this.getSaleReportByVendorCode(userTgId, fromDate, toDate);
  }

  public async getSaleReportByVendorCode(
    userTgId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<{ filename: string; source: ExcelJS.Buffer }> {
    const user = await this.userService.findUserByTgId(userTgId);
    const buffer = await this.wbXlsxReportBuilder.createSalesReport(user.id, fromDate, toDate);
    return { filename: `wb_report_${moment(fromDate).format('DD.MM.YYYY')}-${moment(toDate).format('DD.MM.YYYY')}.xlsx`, source: buffer };
  }

  public async getSaleReportByProduct(
    userTgId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<{ filename: string; source: ExcelJS.Buffer }> {
    const user = await this.userService.findUserByTgId(userTgId);
    const buffer = await this.wbXlsxReportBuilder.createSalesReportByProduct(user.id, fromDate, toDate);
    return { filename: `wb_report_${moment(fromDate).format('DD.MM.YYYY')}-${moment(toDate).format('DD.MM.YYYY')}.xlsx`, source: buffer };
  }

  public async getPrice(userTgId: number): Promise<{ filename: string; source: ExcelJS.Buffer }> {
    const user = await this.userService.findUserByTgId(userTgId);
    const buffer = await this.productPriceTemplateService.getPriceTemplate(user.id);

    return { filename: `price.xlsx`, source: buffer };
  }

  public async createPayment(userTgId: number): Promise<string> {
    const user = await this.userService.findUserByTgId(userTgId);
    return this.paymentService.createPayment(user.id, 499);
  }
}
