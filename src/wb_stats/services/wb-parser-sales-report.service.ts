import { Injectable } from '@nestjs/common';
import { UserFetcherService } from '../../user/services/user-fetcher.service';
import { SalesReportRepository } from '../repositories/sales-report.repository';

import { SalesReportEntity } from '../entities/sales-report.entity';
import { Cron } from '@nestjs/schedule';
import { ReportRow, WbApiService } from '../../wb-api/wb-api.service';
import * as moment from 'moment';
import { WbApiTokenRepository } from '../../wb-api/repositories/wb-api-token.repository';
import { WbApiTokenService } from '../../wb-api/wb-api-token.service';

@Injectable()
export class WbParserSalesReportService {
  constructor(
    private readonly userFetcherService: UserFetcherService,
    private readonly salesReportRepository: SalesReportRepository,
    private readonly wbApiService: WbApiService,
    private readonly wbApiTokenService: WbApiTokenService,
  ) {}

  @Cron('45 * * * * *')
  public async parse(): Promise<void> {
    const result = await this.wbApiTokenService.findAll();
    for (const r of result) {
      let res: ReportRow[] | null;
      const { id, token } = r;

      do {
        const lasLine = await this.salesReportRepository.getLastReportLineByApiKeyId(id);
        res = await this.wbApiService.getSalesReport(token, lasLine);

        if (res) {
          await this.salesReportRepository
            .createQueryBuilder()
            .insert()
            .into(SalesReportEntity)
            .values(
              res.map((item) => ({
                realizationReportId: item.realizationreport_id,
                rrdId: item.rrd_id,
                giId: item.gi_id,
                subjectName: item.subject_name,
                nmId: item.nm_id,
                brandName: item.brand_name,
                saName: item.sa_name,
                tsName: item.ts_name,
                barcode: item.barcode,
                docTypeName: item.doc_type_name,
                supplierContractCode: item.suppliercontract_code,
                rid: item.rid,
                rrDt: moment(item.rr_dt).toDate(),
                orderDt: moment(item.order_dt).toDate(),
                saleDt: moment(item.sale_dt).toDate(),
                quantity: item.quantity,
                retailPrice: item.retail_price,
                retailAmount: item.retail_amount,
                salePercent: item.sale_percent,
                commissionPercent: item.commission_percent,
                officeName: item.office_name,
                supplierOperName: item.supplier_oper_name,
                shkId: item.shk_id,
                retailPriceWithdiscRub: item.retail_price_withdisc_rub,
                deliveryAmount: item.delivery_amount,
                returnAmount: item.return_amount,
                deliveryRub: item.delivery_rub,
                giBoxTypeName: item.gi_box_type_name,
                productDiscountForReport: item.product_discount_for_report,
                supplierPromo: item.supplier_promo,
                ppvzSppPrc: item.ppvz_spp_prc,
                ppvzKvwPrcBase: item.ppvz_kvw_prc_base,
                ppvzKvwPrc: item.ppvz_kvw_prc,
                ppvzSalesCommission: item.ppvz_sales_commission,
                ppvzForPay: item.ppvz_for_pay,
                ppvzReward: item.ppvz_reward,
                ppvzVw: item.ppvz_vw,
                ppvzVwNds: item.ppvz_vw_nds,
                ppvzOfficeId: item.ppvz_office_id,
                ppvzOfficeName: item.office_name,
                ppvzSupplierId: item.ppvz_supplier_id,
                ppvzSupplierName: item.ppvz_supplier_name,
                ppvzInn: item.ppvz_inn,
                token: r,
              })),
            )
            .onConflict(`("id") DO NOTHING`)
            .execute();
        }
      } while (res);
    }
  }
}
