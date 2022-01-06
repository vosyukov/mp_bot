import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WbXlsxReportBuilder } from './services/wb-xlsx-report-builder';
import * as ExcelJS from 'exceljs';
import { UserService } from '../user/services/user.service';
import { WbStatService } from './services/wb-stat.service';

@Controller()
export class TgWbStatsController {
  constructor(
    private readonly wbXlsxReportBuilder: WbXlsxReportBuilder,
    private readonly userService: UserService,
    private readonly wbStatService: WbStatService,
  ) {}

  @MessagePattern('getCsvSummaryReport')
  public async getCsvSummaryReport(
    @Payload()
    data: {
      userTgId: number;
      fromDate: Date;
      toDate: Date;
      advertisingCosts: number;
      receivingGoodCosts: number;
      storageCosts: number;
    },
  ): Promise<ExcelJS.Buffer> {
    const { userTgId, advertisingCosts, fromDate, receivingGoodCosts, storageCosts, toDate } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    return this.wbXlsxReportBuilder.createSalesSummaryReportByProduct(user.id, {
      advertisingCosts,
      fromDate: new Date(fromDate),
      receivingGoodCosts,
      storageCosts,
      toDate: new Date(toDate),
    });
  }

  @MessagePattern('getCsvReportByProduct')
  public async getCsvReportByProduct(
    @Payload()
    data: {
      userTgId: number;
      fromDate: string;
      toDate: string;
    },
  ): Promise<ExcelJS.Buffer> {
    const { userTgId, fromDate, toDate } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    return this.wbXlsxReportBuilder.createSalesReportByProduct(user.id, new Date(fromDate), new Date(toDate));
  }

  @MessagePattern('getCsvReportByVendorCode')
  public async getCsvReportByVendorCode(
    @Payload()
    data: {
      userTgId: number;
      fromDate: string;
      toDate: string;
    },
  ): Promise<ExcelJS.Buffer> {
    const { userTgId, fromDate, toDate } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    return this.wbXlsxReportBuilder.createSalesReport(user.id, new Date(fromDate), new Date(toDate));
  }

  @MessagePattern('parseDataByShopId')
  public async parseDataByShopId(
    @Payload()
    data: {
      shopId: string;
    },
  ): Promise<void> {
    const { shopId } = data;

    await this.wbStatService.parseByShopId(shopId);
  }
}
