import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { WbApiTokenEntity } from '../../wb-api/entities/wb-api-token.entity';

export const TABLE_NAME = 'sales_reports';

@Entity(TABLE_NAME)
export class SalesReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WbApiTokenEntity)
  token: WbApiTokenEntity;

  @Column({ type: 'bigint', nullable: false, unsigned: true })
  realizationReportId: bigint;

  @Column({ nullable: true })
  supplierContractCode: string;

  @Column({ type: 'bigint', nullable: false, unsigned: true })
  rid: bigint;

  @Column()
  rrDt: Date;

  @Column({ type: 'bigint', nullable: false, unsigned: true, unique: true })
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

  @Column({ nullable: true })
  retailPrice: string;

  @Column({ nullable: true })
  retailAmount: string;

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

  @Column({ nullable: true })
  retailPriceWithdiscRub: string;

  @Column({ nullable: true })
  deliveryAmount: string;

  @Column({ nullable: true })
  returnAmount: string;

  @Column({ nullable: true })
  deliveryRub: string;

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

  @Column({ nullable: true, unsigned: true, default: 0 })
  ppvzForPay: number;

  @Column({ nullable: true })
  ppvzReward: string;

  @Column({ nullable: true })
  ppvzVw: string;

  @Column({ nullable: true })
  ppvzVwNds: string;

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
