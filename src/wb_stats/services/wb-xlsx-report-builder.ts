import { Injectable } from '@nestjs/common';
import { WbStatService } from './wb-stat.service';
import * as ExcelJS from 'exceljs';
import { ShopServices } from '../../shop/services/shop.services';
import * as fs from 'fs';
import * as moment from 'moment';
import { Font } from 'exceljs';
import { UserSettingsService } from '../../user-settings/services/user-settings.service';
import { from } from 'rxjs';

const FONT: Partial<Font> = { name: 'Arial', size: 9 };

export interface SummaryReportOptions {
  fromDate: Date;
  toDate: Date;
  advertisingCosts: number;
  receivingGoodCosts: number;
  storageCosts: number;
}

@Injectable()
export class WbXlsxReportBuilder {
  constructor(
    private readonly wbStatService: WbStatService,
    private readonly shopServices: ShopServices,
    private readonly userSettingsService: UserSettingsService,
  ) {}

  public async createSalesReport(userId: string, from: Date, to: Date): Promise<ExcelJS.Buffer> {
    const shop = await this.shopServices.getShopByUserID(userId);
    const result = await this.wbStatService.getSalesReport(shop.id, from, to);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fs.readFileSync(process.cwd() + '/templates/template1.xlsx'));

    const worksheet = workbook.getWorksheet(1);

    worksheet.getCell(1, 2).value = moment(from).format('DD.MM.YYYY');
    worksheet.getCell(1, 3).value = moment(to).format('DD.MM.YYYY');

    let i = 5;
    for (const item of result) {
      const row = worksheet.insertRow(i, [
        item.barcode,
        item.subjectName,
        { text: item.saName, hyperlink: `https://www.wildberries.ru/catalog/${item.nmId}/detail.aspx` },
        item.salesCount,
        item.forPay / 100,
        item.refundCount,
        item.refundCosts / 100,
        item.salesCount - item.refundCount,
        item.forPay / 100 - item.refundCosts / 100,
        item.logisticsCosts / 100,
        item.proceeds / 100,
        item.profit / 100,
        item.refundCount / item.salesCount,
      ]);
      row.getCell(1).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
      };
      row.getCell(2).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
      };

      row.getCell(3).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
      };
      row.getCell(4).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        alignment: { horizontal: 'right' },
      };
      row.getCell(5).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(6).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        alignment: { horizontal: 'right' },
      };
      row.getCell(7).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(8).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        alignment: { horizontal: 'right' },
      };
      row.getCell(9).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(10).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(11).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(12).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(13).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '0%',
      };
      i++;
    }

    // worksheet.columns.forEach((column) => {
    //   const lengths: number[] = column.values.map((v) => String(v).length).filter((item) => item);
    //   const maxLength = Math.max(...lengths);
    //   // column.width = maxLength + 4;
    // });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  public async createSalesReportByProduct(userId: string, from: Date, to: Date): Promise<ExcelJS.Buffer> {
    const shop = await this.shopServices.getShopByUserID(userId);
    const result = await this.wbStatService.getSalesReportByProduct(shop.id, from, to);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fs.readFileSync(process.cwd() + '/templates/template2.xlsx'));

    const worksheet = workbook.getWorksheet(1);

    worksheet.getCell(1, 2).value = moment(from).format('DD.MM.YYYY');
    worksheet.getCell(1, 3).value = moment(to).format('DD.MM.YYYY');

    let i = 5;
    for (const item of result) {
      const row = worksheet.insertRow(i, [
        i - 4,
        item.subjectName,
        item.salesCount,
        item.forPay / 100,
        item.refundCount,
        item.refundCosts / 100,
        item.salesCount - item.refundCount,
        item.forPay / 100 - item.refundCosts / 100,
        item.logisticsCosts / 100,
        item.proceeds / 100,
        item.profit / 100,
      ]);
      row.getCell(1).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
      };
      row.getCell(2).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
      };
      row.getCell(3).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        alignment: { horizontal: 'right' },
      };
      row.getCell(4).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(5).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        alignment: { horizontal: 'right' },
      };
      row.getCell(6).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(7).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        alignment: { horizontal: 'right' },
      };
      row.getCell(8).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(9).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(10).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      row.getCell(11).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
      };
      i++;
    }

    // worksheet.columns.forEach((column) => {
    //   const lengths: number[] = column.values.map((v) => String(v).length).filter((item) => item);
    //   const maxLength = Math.max(...lengths);
    //   // column.width = maxLength + 4;
    // });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  public async createSalesSummaryReportByProduct(userId: string, options: SummaryReportOptions): Promise<ExcelJS.Buffer> {
    const { fromDate, toDate, storageCosts, receivingGoodCosts, advertisingCosts } = options;
    const shop = await this.shopServices.getShopByUserID(userId);
    const result = await this.wbStatService.getSummarySalesReport(shop.id, fromDate, toDate);
    const taxPercent = await this.userSettingsService.getTaxPercent(userId);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fs.readFileSync(process.cwd() + '/templates/template3.xlsx'));

    const worksheet = workbook.getWorksheet(1);

    worksheet.getCell(1, 2).value = moment(fromDate).format('DD.MM.YYYY');
    worksheet.getCell(1, 3).value = moment(toDate).format('DD.MM.YYYY');
    worksheet.mergeCells();
    let i = 5;
    console.log(result);
    for (const item of result) {
      const tax = (result.reduce((pv, cv) => pv + cv.retailCost - cv.refundCosts, 0) * taxPercent) / 100;
      const rVV = result.reduce((pv, cv) => pv + cv.retailCost - cv.refundCosts, 0);

      const fVV = result.reduce((pv, cv) => pv + cv.retailPpvzVw - cv.refundPpvzVw, 0);
      const fVV2 = result.reduce((pv, cv) => pv + cv.retailPpvzVwNds - cv.refundPpvzVwNds, 0);
      const fVV3 = result.reduce((pv, cv) => pv + cv.retailPpvzReward - cv.refundPpvzReward, 0);
      const gg = rVV - fVV - fVV2 - fVV3;
      const log = result.reduce((pv, cv) => pv + cv.logisticsCosts, 0);
      const costPrice = result.reduce((pv, cv) => pv + cv.price, 0)
      const profit = gg - log - tax - storageCosts - receivingGoodCosts - advertisingCosts - costPrice

      const row = worksheet.insertRow(i, [
        i - 4,
        item.subjectName,
        result.reduce((pv, cv) => pv + cv.retailCount - cv.refundCount, 0),
        rVV / 100,
        gg / 100,
        log / 100,
        storageCosts / 100,
        receivingGoodCosts / 100,
        advertisingCosts / 100,
        (gg - log) / 100,
        tax / 100,
        costPrice / 100,
        profit / 100,
      ]);
      row.getCell(1).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
      };
      row.getCell(2).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: FONT,
      };

      i++;
    }

    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 3, right: 3 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 4, right: 4 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 5, right: 5 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 6, right: 6 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 7, right: 7 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 8, right: 8 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 9, right: 9 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 10, right: 10 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 11, right: 11 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 12, right: 12 });
    worksheet.mergeCells({ top: 5, bottom: 4 + result.length, left: 13, right: 13 });

    const row = worksheet.getRow(5);
    row.getCell(3).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
    };
    row.getCell(4).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };
    row.getCell(5).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
    };
    row.getCell(6).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };
    row.getCell(7).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };
    row.getCell(8).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };
    row.getCell(9).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      font: FONT,
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };
    row.getCell(10).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };
    row.getCell(11).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };
    row.getCell(12).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };
    row.getCell(13).style = {
      border: {
        right: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      },
      font: FONT,
      alignment: { horizontal: 'center', vertical: 'middle' },
      numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
