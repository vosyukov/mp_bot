
import { OrderRow, ReportRow, WbApiService } from '../../wb-api/wb-api.service';
import * as moment from 'moment';
import { UtilsService } from '../../utils/utils.service';
import { ShopServices } from '../../shop/services/shop.services';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { OrderReportEntity } from '../entities/order-report.entity';
import { OrderReportRepository } from '../repositories/order-report.repository';

@Processor('wb_parser')
export class WbParserOrdersReportService {
  constructor(
    private readonly orderReportRepository: OrderReportRepository,
    private readonly wbApiService: WbApiService,
    private readonly utilsService: UtilsService,
    private readonly shopServices: ShopServices,
  ) {}


  @Process('parseOrdersReport')
  public async parseOrdersReport(job: Job<{ shopId: string }>): Promise<void> {
    const {shopId} = job.data
    console.log(`start parse orders ${shopId} report`);
    try {
      const shop = await this.shopServices.getShopById(shopId);

      const { id, token } = shop;

      let res: OrderRow[] | null = null;
      do {
        const lastDate = await this.orderReportRepository.getLastReportLineByApiKeyId(id);
        console.log('lastDate', lastDate);
        res = await this.wbApiService.getOrdersReport(token, lastDate);




        console.log(res?.length);

        if (res) {
          await this.orderReportRepository
            .createQueryBuilder()
            .insert()
            .into(OrderReportEntity)
            .values(
              res.map((item) => ({
                number: String(item.number),
                date: moment(item.date).toDate(),
                lastChangeDate: moment(item.lastChangeDate).toDate(),
                supplierArticle: item.supplierArticle,
                techSize: item.techSize,
                barcode: item.barcode,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                discountPercent: item.discountPercent,
                warehouseName: item.warehouseName,
                oblast: item.oblast,
                incomeID: String(item.incomeID),
                odid: String(item.odid),
                nmId: String(item.nmId),
                subject: item.subject,
                category: item.category,
                brand: item.brand,
                isCancel: item.isCancel,
                cancelDt: moment(item.cancel_dt).isBefore(moment('0002-01-01 00:00:00.000'))  ? null : moment(item.cancel_dt).toDate() ,
                gNumber: item.gNumber,
                shop: shop,
              })),
            )
            .orIgnore(true)
            .execute();
        }
      } while (res);
    } catch (err) {
      console.error(err.message);
    }
  }
}
