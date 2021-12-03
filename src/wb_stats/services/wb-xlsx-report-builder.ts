import { Injectable } from '@nestjs/common';
import { WbStatService } from './wb-stat.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WbXlsxReportBuilder {
  constructor(private readonly wbStatService: WbStatService) {}

  public async createSalesReport(): Promise<ExcelJS.Buffer> {
    const result = await this.wbStatService.getSalesReportByProduct(new Date(), new Date());

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('tets');

    const row = worksheet.addRow(['Баркод', 'Товар', 'Артикул поставщика', 'Продано', 'Оплата ВБ', 'Себестоимость', 'Налог', 'Прибыль']);

    row.getCell(1).style = { protection: { locked: true } };
    row.getCell(2).style = { protection: { locked: true } };
    row.getCell(3).style = { protection: { locked: true } };
    row.getCell(4).style = { protection: { locked: true } };
    row.getCell(4).style = { protection: { locked: true } };
    row.getCell(4).style = { protection: { locked: true } };
    row.getCell(4).style = { protection: { locked: true } };
    row.getCell(4).style = { protection: { locked: true } };

    for (const item of result) {
      const row = worksheet.addRow([
        item.barcode,
        item.subjectName,
        item.saName,
        item.count,
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
      row.getCell(6).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(7).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
      row.getCell(8).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
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
