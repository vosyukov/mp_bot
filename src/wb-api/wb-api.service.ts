import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import { map, tap } from 'rxjs';

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
  delivery_amount: string;
  return_amount: string;
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

const URL = 'https://suppliers-stats.wildberries.ru/api/v1/supplier/reportDetailByPeriod';

@Injectable()
export class WbApiService {
  constructor(private httpService: HttpService) {}

  public isValidKey(key: string): Promise<boolean> {
    return this.httpService
      .get(URL, {
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
      .toPromise();
  }

  public async getSalesReport(wbApiKey: string, rrdId: bigint): Promise<ReportRow[] | null> {
    return this.httpService
      .get(URL, {
        params: {
          key: wbApiKey,
          dateFrom: moment().subtract(4, 'M').format('YYYY-MM-DD'),
          dateTo: moment().format('YYYY-MM-DD'),
          rrdid: rrdId,
          limit: 10000,
        },
        responseType: 'json',
      })
      .pipe(map((response) => response.data))
      .toPromise();
  }
}

moment().format('dddd, MMMM Do YYYY, h:mm:ss a');
