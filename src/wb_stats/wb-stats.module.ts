import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesReportRepository } from './repositories/sales-report.repository';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { WbParserSalesReportService } from './services/wb-parser-sales-report.service';
import { ScheduleModule } from '@nestjs/schedule';
import { WbApiModule } from '../wb-api/wb-api.module';

@Module({
  imports: [TypeOrmModule.forFeature([SalesReportRepository]), ScheduleModule.forRoot(), UserModule, WbApiModule],
  providers: [WbParserSalesReportService],
})
export class WbStatsModule {}
