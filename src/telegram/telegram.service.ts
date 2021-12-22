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

  public async getSaleReportByVendorCodeForCurrentMonth(
    userTgId: number,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const fromDate = moment().startOf('month').toDate();
    const toDate = moment().endOf('month').toDate();

    return this.getSaleReportByVendorCode(userTgId, fromDate, toDate);
  }

  public async getSaleReportByVendorCodeForPreviousMonth(
    userTgId: number,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const fromDate = moment().subtract(1, 'months').startOf('month').toDate();
    const toDate = moment().subtract(1, 'months').endOf('month').toDate();

    return this.getSaleReportByVendorCode(userTgId, fromDate, toDate);
  }

  public async getSaleReportByVendorCode(
    userTgId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const user = await this.userService.findUserByTgId(userTgId);
    const buffer = await this.wbXlsxReportBuilder.createSalesReport(user.id, fromDate, toDate);
    const fromDateStr = moment(fromDate).format('DD.MM.YYYY');
    const toDateStr = moment(toDate).format('DD.MM.YYYY');
    const description = `Отчет по продажам (по артикулам) с ${fromDateStr} по ${toDateStr}`;
    return { filename: `wb_report_${fromDateStr}-${toDateStr}.xlsx`, source: buffer, description };
  }

  public async getSalesSummaryReportByProduct(
    userTgId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const user = await this.userService.findUserByTgId(userTgId);
    const buffer = await this.wbXlsxReportBuilder.createSalesSummaryReportByProduct(user.id, fromDate, toDate);
    const fromDateStr = moment(fromDate).format('DD.MM.YYYY');
    const toDateStr = moment(toDate).format('DD.MM.YYYY');
    const description = `Отчет по продажам (сводный) с ${fromDateStr} по ${toDateStr}`;
    return { filename: `wb_report_${fromDateStr}-${toDateStr}.xlsx`, source: buffer, description };
  }

  public async getSalesSummaryReportByProductCurrentMonth(
    userTgId: number,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const fromDate = moment().startOf('month').toDate();
    const toDate = moment().endOf('month').toDate();

    return this.getSalesSummaryReportByProduct(userTgId, fromDate, toDate);
  }

  public async getSalesSummaryReportByProductPreviousMonth(
    userTgId: number,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const fromDate = moment().subtract(1, 'months').startOf('month').toDate();
    const toDate = moment().subtract(1, 'months').endOf('month').toDate();

    return this.getSalesSummaryReportByProduct(userTgId, fromDate, toDate);
  }

  public async getSaleReportByProduct(
    userTgId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const user = await this.userService.findUserByTgId(userTgId);
    const buffer = await this.wbXlsxReportBuilder.createSalesReportByProduct(user.id, fromDate, toDate);
    const fromDateStr = moment(fromDate).format('DD.MM.YYYY');
    const toDateStr = moment(toDate).format('DD.MM.YYYY');
    const description = `Отчет по продажам (по категориям) с ${fromDateStr} по ${toDateStr}`;
    return { filename: `wb_report_${fromDateStr}-${toDateStr}.xlsx`, source: buffer, description };
  }

  public async getSaleReportByProductCurrentMonth(
    userTgId: number,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const fromDate = moment().startOf('month').toDate();
    const toDate = moment().endOf('month').toDate();

    return this.getSaleReportByProduct(userTgId, fromDate, toDate);
  }

  public async getSaleReportByProductForPreviousMonth(
    userTgId: number,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const fromDate = moment().subtract(1, 'months').startOf('month').toDate();
    const toDate = moment().subtract(1, 'months').endOf('month').toDate();

    return this.getSaleReportByProduct(userTgId, fromDate, toDate);
  }

  public async getPrice(userTgId: number): Promise<{ filename: string; source: ExcelJS.Buffer }> {
    const user = await this.userService.findUserByTgId(userTgId);
    const buffer = await this.productPriceTemplateService.getPriceTemplate(user.id);

    return { filename: `price.xlsx`, source: buffer };
  }

  public async createPayment(userTgId: number, planId: string): Promise<string> {
    const user = await this.userService.findUserByTgId(userTgId);
    return this.paymentService.createPayment(user.id, planId);
  }
}
