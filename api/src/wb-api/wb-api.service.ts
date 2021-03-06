import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import { map } from 'rxjs';

export interface ReportRow {
  realizationreport_id: bigint;
  suppliercontract_code: string;
  rid: bigint;
  rrd_id: bigint;
  gi_id: bigint;
  subject_name: string;
  nm_id: string;
  brand_name: string;
  sa_name: string;
  ts_name: string;
  barcode: string;
  doc_type_name: string;
  quantity: string;
  retail_price: string;
  retail_amount: string;
  sale_percent: string;
  commission_percent: string;
  office_name: string;
  supplier_oper_name: string;
  order_dt: string;
  sale_dt: string;
  rr_dt: string;
  shk_id: string;
  retail_price_withdisc_rub: string;
  delivery_amount: number;
  return_amount: number;
  delivery_rub: string;
  gi_box_type_name: string;
  product_discount_for_report: string;
  supplier_promo: string;
  nds: string;
  cost_amount: number;
  supplier_reward: string;
  for_pay: string;
  for_pay_nds: string;
  supplier_spp: string;
  ppvz_spp_prc: string;
  ppvz_kvw_prc_base: string;
  ppvz_kvw_prc: string;
  ppvz_sales_commission: string;
  ppvz_for_pay: string;
  ppvz_reward: string;
  ppvz_vw: string;
  ppvz_vw_nds: string;
  ppvz_office_id: string;
  ppvz_office_name: string;
  ppvz_supplier_id: string;
  ppvz_supplier_name: string;
  ppvz_inn: string;
}

export interface OrderRow {
  number: string,
  date: string,
  lastChangeDate: string,
  supplierArticle: string,
  techSize: string,
  barcode: string,
  quantity: number,
  totalPrice: number,
  discountPercent: number,
  warehouseName: string,
  oblast: string,
  incomeID: string,
  odid: string,
  nmId: string,
  subject: string,
  category: string,
  brand: string,
  isCancel: boolean,
  cancel_dt: string,
  gNumber: string,
}

export interface StockRow {
  barcode: string;
  status: string;
  supplierArticle: string;
  nmId: string;
}

const URL = 'https://suppliers-stats.wildberries.ru/api/v1/';

@Injectable()
export class WbApiService {
  constructor(private httpService: HttpService) {}

  public async isValidKey(key: string): Promise<boolean> {
    return this.httpService
      .get(URL + `supplier/reportDetailByPeriod`, {
        params: {
          key,
          dateFrom: moment().subtract(4, 'M').format('YYYY-MM-DD'),
          dateTo: moment().format('YYYY-MM-DD'),
          rrdid: 0,
          limit: 1,
        },
        responseType: 'json',
        validateStatus: (status) => [401, 200, 400].includes(status),
      })
      .pipe(map(({ status }) => status !== 401 && status !== 400))
      .toPromise()
      .catch(() => false);
  }

  public async getSalesReport(wbApiKey: string, rrdId: bigint): Promise<ReportRow[] | null> {
    return this.httpService
      .get(URL + `supplier/reportDetailByPeriod`, {
        params: {
          key: wbApiKey,
          dateFrom: moment().subtract(6, 'M').format('YYYY-MM-DD'),
          dateTo: moment().format('YYYY-MM-DD'),
          rrdid: rrdId,
          limit: 10000,
        },
        responseType: 'json',
      })
      .pipe(map((response) => response.data))
      .toPromise();
  }

  public async getOrdersReport(wbApiKey: string, dateFrom: Date | null): Promise<OrderRow[] | null> {
    return this.httpService
      .get(URL + `supplier/orders`, {
        params: {
          key: wbApiKey,
          dateFrom: dateFrom ? moment(dateFrom).toISOString() : moment().subtract(6, 'M').toISOString(),
        },
        responseType: 'json',
      })
      .pipe(map((response) => response.data))
      .toPromise();
  }

  public async getStocks(wbApiKey: string): Promise<StockRow[]> {
    return this.httpService
      .get(URL + `supplier/incomes`, {
        params: {
          dateFrom: moment().subtract(24, 'M').format('YYYY-MM-DD'),
          key: wbApiKey,
        },
      })
      .pipe(map((response) => response.data))
      .toPromise();
  }
}
