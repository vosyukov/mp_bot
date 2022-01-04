
import { SalesReportRepository } from '../repositories/sales-report.repository';

import { SalesReportEntity } from '../entities/sales-report.entity';

import { ReportRow, WbApiService } from '../../wb-api/wb-api.service';
import * as moment from 'moment';
import { UtilsService } from '../../utils/utils.service';
import { ShopServices } from '../../shop/services/shop.services';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('salesReport')
export class WbParserSalesReportService {
  constructor(
    private readonly salesReportRepository: SalesReportRepository,
    private readonly wbApiService: WbApiService,
    private readonly utilsService: UtilsService,
    private readonly shopServices: ShopServices,
  ) {}


  @Process('parseSalesReport')
  public async parseSalesReport(job: Job<{ shopId: string }>): Promise<void> {
    const {shopId} = job.data
    console.log(`start parse ${shopId} report`);
    try {
      const shop = await this.shopServices.getShopById(shopId);

      const { id, token } = shop;

      let res: ReportRow[] | null = null;
      do {
        const lasLine = await this.salesReportRepository.getLastReportLineByApiKeyId(id);
        res = await this.wbApiService.getSalesReport(token, lasLine);

        console.log(lasLine);
        console.log(res?.length);

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
                retailPrice: this.utilsService.priceToScaled(item.retail_price),
                retailAmount: this.utilsService.priceToScaled(item.retail_amount),
                salePercent: item.sale_percent,
                commissionPercent: item.commission_percent,
                officeName: item.office_name,
                supplierOperName: item.supplier_oper_name,
                shkId: item.shk_id,
                retailPriceWithDiscRub: this.utilsService.priceToScaled(item.retail_price_withdisc_rub),
                deliveryAmount: item.delivery_amount,
                returnAmount: item.return_amount,
                deliveryRub: this.utilsService.priceToScaled(item.delivery_rub),
                giBoxTypeName: item.gi_box_type_name,
                productDiscountForReport: item.product_discount_for_report,
                supplierPromo: item.supplier_promo,
                ppvzSppPrc: item.ppvz_spp_prc,
                ppvzKvwPrcBase: item.ppvz_kvw_prc_base,
                ppvzKvwPrc: item.ppvz_kvw_prc,
                ppvzSalesCommission: item.ppvz_sales_commission,
                ppvzForPay: this.utilsService.priceToScaled(item.ppvz_for_pay),
                ppvzReward: this.utilsService.priceToScaled(item.ppvz_reward),
                ppvzVw: this.utilsService.priceToScaled(item.ppvz_vw),
                ppvzVwNds: this.utilsService.priceToScaled(item.ppvz_vw_nds),
                ppvzOfficeId: item.ppvz_office_id,
                ppvzOfficeName: item.office_name,
                ppvzSupplierId: item.ppvz_supplier_id,
                ppvzSupplierName: item.ppvz_supplier_name,
                ppvzInn: item.ppvz_inn,
                shop: shop,
              })),
            )
            .onConflict(`("rrd_d") DO NOTHING`)
            .execute();
        }
      } while (res);
    } catch (err) {
      console.error(err);
    }
  }
}
