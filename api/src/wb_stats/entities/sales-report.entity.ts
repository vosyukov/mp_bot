import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ShopEntity } from '../../shop/entities/shop.entity';

export const TABLE_NAME = 'sales_reports';

@Entity(TABLE_NAME)
@Index(['barcode', 'shopId', 'rrDt'])
@Unique(['shopId', 'rrdId'])
export class SalesReportEntity {
  static tableName: string = TABLE_NAME;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @ManyToOne(() => ShopEntity)
  shop: ShopEntity;

  @Column({ type: 'bigint', nullable: false })
  realizationReportId: bigint;

  @Column({ nullable: true })
  supplierContractCode: string;

  @Column({ type: 'bigint', nullable: false })
  rid: bigint;

  @Column()
  rrDt: Date;

  @Column({ type: 'bigint', nullable: false, unsigned: true })
  rrdId: bigint;

  @Column({ type: 'bigint', nullable: false, unsigned: true })
  giId: bigint;

  @Column({ nullable: true })
  subjectName: string;

  @Column({ nullable: true })
  nmId: string;

  @Column({ nullable: true })
  brandName: string;

  @Column({ nullable: true })
  saName: string;

  @Column({ nullable: true })
  tsName: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ nullable: true })
  docTypeName: string;

  @Column({ nullable: true })
  quantity: string;

  @Column({ nullable: false, default: 0 })
  retailPrice: number;

  @Column({ nullable: false, default: 0 })
  retailAmount: number;

  @Column({ nullable: true })
  salePercent: string;

  @Column({ nullable: true })
  commissionPercent: string;

  @Column({ nullable: true })
  officeName: string;

  @Column({ nullable: true })
  supplierOperName: string;

  @Column({ nullable: true })
  orderDt: Date;

  @Column({ nullable: true })
  saleDt: Date;

  @Column({ nullable: true })
  shkId: string;

  @Column({ nullable: false, default: 0 })
  retailPriceWithDiscRub: number;

  @Column({ nullable: true, unsigned: true, default: 0 })
  deliveryAmount: number;

  @Column({ nullable: true, unsigned: true, default: 0 })
  returnAmount: number;

  @Column({ nullable: true, unsigned: true, default: 0 })
  deliveryRub: number;

  @Column({ nullable: true })
  giBoxTypeName: string;

  @Column({ nullable: true })
  productDiscountForReport: string;

  @Column({ nullable: true })
  supplierPromo: string;

  @Column({ nullable: true })
  ppvzSppPrc: string;

  @Column({ nullable: true })
  ppvzKvwPrcBase: string;

  @Column({ nullable: true })
  ppvzKvwPrc: string;

  @Column({ nullable: true })
  ppvzSalesCommission: string;

  @Column({ nullable: true, default: 0 })
  ppvzForPay: number;

  @Column({ nullable: false, default: 0 })
  ppvzReward: number;

  @Column({ nullable: false, default: 0 })
  ppvzVw: number;

  @Column({ nullable: false, default: 0 })
  ppvzVwNds: number;

  @Column({ nullable: true })
  ppvzOfficeId: string;

  @Column({ nullable: true })
  ppvzOfficeName: string;

  @Column({ nullable: true })
  ppvzSupplierId: string;

  @Column({ nullable: true })
  ppvzSupplierName: string;

  @Column({ nullable: true })
  ppvzInn: string;
}
