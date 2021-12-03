import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesReportRepository } from './repositories/sales-report.repository';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { WbParserSalesReportService } from './services/wb-parser-sales-report.service';
import { WbApiModule } from '../wb-api/wb-api.module';
import { UtilsModule } from '../utils/utils.module';
import { WbStatService } from './services/wb-stat.service';
import { WbXlsxReportBuilder } from './services/wb-xlsx-report-builder';

@Module({
  imports: [TypeOrmModule.forFeature([SalesReportRepository]), UtilsModule, UserModule, WbApiModule],
  providers: [WbParserSalesReportService, WbStatService, WbXlsxReportBuilder],
  exports: [WbStatService, WbXlsxReportBuilder],
})
export class WbStatsModule {}
