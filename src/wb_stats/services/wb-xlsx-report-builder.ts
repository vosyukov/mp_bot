import { Injectable } from '@nestjs/common';
import { WbStatService } from './wb-stat.service';
import * as ExcelJS from 'exceljs';
import { ShopServices } from '../../shop/services/shop.services';
import * as fs from 'fs';

@Injectable()
export class WbXlsxReportBuilder {
  constructor(private readonly wbStatService: WbStatService, private readonly shopServices: ShopServices) {}

  public async createSalesReport(userId: string, from: Date, to: Date): Promise<ExcelJS.Buffer> {
    const shop = await this.shopServices.getShopByUserID(userId);
    const result = await this.wbStatService.getSalesReport(shop.id, from, to);

    console.log(process.cwd());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fs.readFileSync(process.cwd() + '/templates/template1.xlsx'));

    const worksheet = workbook.getWorksheet(1);

    worksheet.getCell(1, 2).value = from.toLocaleString();
    worksheet.getCell(1, 3).value = to.toLocaleString();

    let i = 5;
    for (const item of result) {
      const row = worksheet.insertRow(i, [
        i - 4,
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
      ]);
      row.getCell(1).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        protection: { locked: true },
      };
      row.getCell(2).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        protection: { locked: true },
      };
      // row.getCell(3).hyperlink = 'https://www.wildberries.ru/catalog/26382454/detail.aspx';
      row.getCell(3).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        protection: { locked: true },
      };
      row.getCell(4).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        alignment: { horizontal: 'right' },
        protection: { locked: true },
      };
      row.getCell(5).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(6).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        alignment: { horizontal: 'right' },
        protection: { locked: true },
      };
      row.getCell(7).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(8).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        alignment: { horizontal: 'right' },
        protection: { locked: true },
      };
      row.getCell(9).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(10).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(11).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(12).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
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

    worksheet.getCell(1, 2).value = from.toLocaleString();
    worksheet.getCell(1, 3).value = to.toLocaleString();

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
        font: { name: 'Arial', size: 8 },
        protection: { locked: true },
      };
      row.getCell(2).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        protection: { locked: true },
      };
      row.getCell(3).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        alignment: { horizontal: 'right' },
        protection: { locked: true },
      };
      row.getCell(4).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(5).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        alignment: { horizontal: 'right' },
        protection: { locked: true },
      };
      row.getCell(6).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(7).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        alignment: { horizontal: 'right' },
        protection: { locked: true },
      };
      row.getCell(8).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(9).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(10).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
      };
      row.getCell(11).style = {
        border: {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        },
        font: { name: 'Arial', size: 8 },
        numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]',
        protection: { locked: true },
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
}
