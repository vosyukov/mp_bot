import { Injectable } from '@nestjs/common';
import { WbProductService } from './wb-product.service';
import { PriceHistoryRepository } from '../repositories/price-history.repository';
import { UtilsService } from '../../utils/utils.service';
const ExcelJS = require('exceljs');

@Injectable()
export class ProductPriceTemplateService {
  constructor(
    private readonly wbProductService: WbProductService,
    private readonly priceHistoryRepository: PriceHistoryRepository,
    private readonly utilsService: UtilsService,
  ) {}

  public async getPriceTemplate(userId: string): Promise<Buffer> {
    const products = await this.priceHistoryRepository.getCurrentPrice();
    console.log(products);
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('tets');

    const row = worksheet.addRow(['Артикул WB', 'Артикул поставщика', 'Баркод', 'Себестоимость']);

    row.getCell(1).style = { alignment: { horizontal: 'right' }, protection: { locked: true } };
    row.getCell(2).style = { protection: { locked: true } };
    row.getCell(3).style = { protection: { locked: true } };
    row.getCell(4).style = { protection: { locked: true } };

    for (const item of products) {
      const row = worksheet.addRow([item.nmId, item.supplierArticle, item.barcode, item.price / 100]);
      row.getCell(1).style = { protection: { locked: true } };
      row.getCell(2).style = { protection: { locked: true } };
      row.getCell(3).style = { protection: { locked: true } };
      row.getCell(4).style = { numFmt: '#,##0.00 [$₽-419];[RED]-#,##0.00 [$₽-419]', protection: { locked: true } };
    }

    worksheet.columns.forEach((column) => {
      const lengths: number[] = column.values.map((v) => String(v).length).filter((item) => item);
      const maxLength = Math.max(...lengths);
      column.width = maxLength + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  public async setPrice(data: Buffer): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);
    const worksheet = workbook.getWorksheet(1);
    const items = worksheet.getSheetValues();
    items.shift();
    items.shift();

    await this.priceHistoryRepository.save(
      items.map((item) => ({
        productNmId: item[1],
        barcode: item[3],
        price: this.utilsService.priceToScaled(item[4]),
      })),
    );
  }
}
