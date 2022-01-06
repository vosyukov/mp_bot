import { Inject, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as moment from 'moment';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TelegramService {
  constructor(@InjectBot() private bot: Telegraf<any>, @Inject('WB_STATS') private wbStatsClient: ClientProxy) {}

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
    const buffer = Buffer.from(
      await this.wbStatsClient
        .send<string>('getCsvReportByVendorCode', {
          userTgId,
          toDate,
          fromDate,
        })
        .toPromise(),
    );

    const fromDateStr = moment(fromDate).format('DD.MM.YYYY');
    const toDateStr = moment(toDate).format('DD.MM.YYYY');
    const description = `Отчет по продажам (по артикулам) с ${fromDateStr} по ${toDateStr}`;
    return { filename: `wb_report_${fromDateStr}-${toDateStr}.xlsx`, source: buffer, description };
  }

  public async getSalesSummaryReportByProduct(
    userTgId: number,
    options: any,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const { toDate, storageCosts, receivingGoodCosts, advertisingCosts, fromDate } = options;
    const buffer = Buffer.from(
      await this.wbStatsClient
        .send<string>('getCsvSummaryReport', {
          userTgId,
          toDate,
          storageCosts,
          receivingGoodCosts,
          advertisingCosts,
          fromDate,
        })
        .toPromise(),
    );

    const fromDateStr = moment(options.fromDate).format('DD.MM.YYYY');
    const toDateStr = moment(options.toDate).format('DD.MM.YYYY');
    const description = `Отчет по продажам (сводный) с ${fromDateStr} по ${toDateStr}`;
    return { filename: `wb_report_${fromDateStr}-${toDateStr}.xlsx`, source: buffer, description };
  }

  public async getSaleReportByProduct(
    userTgId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const buffer = Buffer.from(
      await this.wbStatsClient
        .send<string>('getCsvReportByProduct', {
          userTgId,
          toDate,
          fromDate,
        })
        .toPromise(),
    );

    const fromDateStr = moment(fromDate).format('DD.MM.YYYY');
    const toDateStr = moment(toDate).format('DD.MM.YYYY');
    const description = `Отчет по продажам (по категориям) с ${fromDateStr} по ${toDateStr}`;
    return { filename: `wb_report_${fromDateStr}-${toDateStr}.xlsx`, source: buffer, description };
  }

  public async getSaleReportByProductCurrentMonth(userTgId: number): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const fromDate = moment().startOf('month').toDate();
    const toDate = moment().endOf('month').toDate();

    return this.getSaleReportByProduct(userTgId, fromDate, toDate);
  }

  public async getSaleReportByProductForPreviousMonth(userTgId: number): Promise<{ filename: string; source: ExcelJS.Buffer; description: string }> {
    const fromDate = moment().subtract(1, 'months').startOf('month').toDate();
    const toDate = moment().subtract(1, 'months').endOf('month').toDate();

    return this.getSaleReportByProduct(userTgId, fromDate, toDate);
  }

  public async getPrice(userTgId: number): Promise<{ filename: string; source: ExcelJS.Buffer }> {
    const buffer = Buffer.from(
      await this.wbStatsClient
        .send<string>('getPriceTemplate', {
          userTgId,
        })
        .toPromise(),
    );

    return { filename: `price.xlsx`, source: buffer };
  }

  public async setPrice(userTgId: number, buffer: Buffer): Promise<void> {
    await this.wbStatsClient
      .send<string>('setPrice', {
        userTgId,
        buffer,
      })
      .toPromise();
  }

  public async createPayment(userTgId: number, planId: string): Promise<string> {
    const url = await this.wbStatsClient
      .send<string>('createPayment', {
        userTgId,
        planId,
      })
      .toPromise();

    return url;
  }

  public async updateTaxPercent(userTgId: number, value: number): Promise<void> {
    await this.wbStatsClient
      .send<void>('updateTaxPercent', {
        userTgId,
        value,
      })
      .toPromise();
  }

  public async getTaxPercent(userTgId: number): Promise<number> {
    const tax = await this.wbStatsClient
      .send<number>('getTaxPercent', {
        userTgId,
      })
      .toPromise();

    return tax;
  }

  public async addShop(userTgId: number, name: string, token: string): Promise<string> {
    const shopId = await this.wbStatsClient
      .send<string>('addShop', {
        userTgId,
        name,
        token,
      })
      .toPromise();

    return shopId;
  }

  public async findShopByUserTgId(userTgId: number): Promise<any> {
    const shop = await this.wbStatsClient
      .send<any>('findShopByUserTgId', {
        userTgId,
      })
      .toPromise();

    return shop;
  }

  public async isValidToken(token: string): Promise<boolean> {
    return await this.wbStatsClient
      .send<boolean>('isValidToken', {
        token,
      })
      .toPromise();
  }

  public async registration(
    userTgId: number,
    username: string,
    firstName: string,
    lastName: string,
    languageCode: string,
    refId: number,
  ): Promise<void> {
    return await this.wbStatsClient
      .send<void>('registration', {
        userTgId,
        username,
        firstName,
        lastName,
        languageCode,
        refId,
      })
      .toPromise();
  }

  public async findUserByTgId(userTgId: number): Promise<any> {
    return await this.wbStatsClient
      .send<any>('findUserByTgId', {
        userTgId,
      })
      .toPromise();
  }

  public async parseDataByShopId(shopId: string): Promise<any> {
    return await this.wbStatsClient
      .send<any>('parseDataByShopId', {
        shopId,
      })
      .toPromise();
  }
}
