import { Injectable } from '@nestjs/common';
import { WbStatService } from './wb-stat.service';
import * as ExcelJS from 'exceljs';
import { ShopServices } from '../../shop/services/shop.services';

@Injectable()
export class WbXlsxReportBuilder {
  constructor(private readonly wbStatService: WbStatService, private readonly shopServices: ShopServices) {}

  public async createSalesReport(userId: string, from: Date, to: Date): Promise<ExcelJS.Buffer> {
    const shop = await this.shopServices.getShopByUserID(userId);
    const result = await this.wbStatService.getSalesReport(shop.id, from, to);

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Отчет по продажам');

    const row = worksheet.addRow([
      'Баркод',
      'Товар',
      'Артикул поставщика',
      'Кол-во продаж',
      'Оплата ВБ',
      'Кол-во возвратов',
      'Стоимость возвратов',
      'Стоимость логистики',
      'Выручка',
      'Себестоимость',
      'Налог',
      'Прибыль',
    ]);

    row.getCell(1).style = { protection: { locked: true } };
    row.getCell(2).style = { protection: { locked: true } };
    row.getCell(3).style = { protection: { locked: true } };
    row.getCell(4).style = { protection: { locked: true } };
    row.getCell(5).style = { protection: { locked: true } };
    row.getCell(6).style = { protection: { locked: true } };
    row.getCell(7).style = { protection: { locked: true } };
    row.getCell(8).style = { protection: { locked: true } };
    row.getCell(9).style = { protection: { locked: true } };
    row.getCell(10).style = { protection: { locked: true } };
    row.getCell(11).style = { protection: { locked: true } };

    for (const item of result) {
      const row = worksheet.addRow([
        item.barcode,
        item.subjectName,
        item.saName,
        item.salesCount,
        item.forPay / 100,
        item.refundCount,
        item.refundCosts / 100,
        item.logisticsCosts / 100,
        item.proceeds / 100,
        item.costPrice / 100,
        item.tax / 100,
        item.profit / 100,
      ]);
      row.getCell(1).style = { protection: { locked: true } };
      row.getCell(2).style = { protection: { locked: true } };
      row.getCell(3).style = { protection: { locked: true } };
      row.getCell(4).style = { alignment: { horizontal: 'right' }, protection: { locked: true } };
      row.getCell(5).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(6).style = { alignment: { horizontal: 'right' }, protection: { locked: true } };
      row.getCell(7).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(8).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(9).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(10).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(11).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
    }

    worksheet.columns.forEach((column) => {
      const lengths: number[] = column.values.map((v) => String(v).length).filter((item) => item);
      const maxLength = Math.max(...lengths);
      column.width = maxLength + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
  public async createSalesReportByProduct(userId: string, from: Date, to: Date): Promise<ExcelJS.Buffer> {
    const shop = await this.shopServices.getShopByUserID(userId);
    const result = await this.wbStatService.getSalesReportByProduct(shop.id, from, to);

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Отчет по продажам');

    const row = worksheet.addRow([
      'Товар',
      'Кол-во продаж',
      'Оплата ВБ',
      'Кол-во возвратов',
      'Стоимость возвратов',
      'Стоимость логистики',
      'Выручка',
      'Себестоимость',
      'Прибыль',
    ]);

    row.getCell(1).style = { protection: { locked: true } };
    row.getCell(2).style = { protection: { locked: true } };
    row.getCell(3).style = { protection: { locked: true } };
    row.getCell(4).style = { protection: { locked: true } };
    row.getCell(5).style = { protection: { locked: true } };
    row.getCell(6).style = { protection: { locked: true } };
    row.getCell(7).style = { protection: { locked: true } };
    row.getCell(8).style = { protection: { locked: true } };
    row.getCell(9).style = { protection: { locked: true } };
    row.getCell(10).style = { protection: { locked: true } };
    row.getCell(11).style = { protection: { locked: true } };

    for (const item of result) {
      const row = worksheet.addRow([
        item.subjectName,
        item.salesCount,
        item.forPay / 100,
        item.refundCount,
        item.refundCosts / 100,
        item.logisticsCosts / 100,
        item.proceeds / 100,
        item.costPrice / 100,
        item.profit / 100,
      ]);

      row.getCell(3).style = { protection: { locked: true } };
      row.getCell(4).style = { alignment: { horizontal: 'right' }, protection: { locked: true } };
      row.getCell(5).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(6).style = { alignment: { horizontal: 'right' }, protection: { locked: true } };
      row.getCell(7).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(8).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(9).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(10).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(11).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
    }

    worksheet.columns.forEach((column) => {
      const lengths: number[] = column.values.map((v) => String(v).length).filter((item) => item);
      const maxLength = Math.max(...lengths);
      column.width = maxLength + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
