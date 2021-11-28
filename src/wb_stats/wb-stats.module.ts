import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesReportRepository } from './repositories/sales-report.repository';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { WbApiService } from './services/wb-api.service';
import { HttpModule } from '@nestjs/axios';
import { WbParserSalesReportService } from './services/wb-parser-sales-report.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesReportRepository]), UserModule, HttpModule],
  providers: [WbApiService, WbParserSalesReportService],
})
export class WbStatsModule {}
