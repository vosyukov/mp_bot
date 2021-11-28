import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

export const TABLE_NAME = 'sales_reports';

@Entity(TABLE_NAME)
export class SalesReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column({ type: 'bigint', nullable: false, unsigned: true })
  realizationReportId: bigint;
  // suppliercontractCode
  // rid
  // rrDt
  @Column({ type: 'bigint', nullable: false, unsigned: true, unique: true })
  rrdId: bigint;

  @Column({ type: 'bigint', nullable: false, unsigned: true })
  giId: bigint;

  @Column()
  subjectName: string;
  // NMId
  // brandName
  // saName
  // tsName
  // barcode
  @Column()
  docTypeName: string;
  // quantity
  // retailPrice
  // retailAmount
  // salePercent
  // commissionPercent
  // officeName
  // supplierOperName
  // orderDt
  // saleDt
  // shkId
  // retailPriceWithdiscRub
  // deliveryAmount
  // returnAmount
  // deliveryRub
  // giBoxTypeName
  // productDiscountForReport
  // supplierPromo
  // ppvzSppPrc
  // ppvzKvwPrcBase
  // ppvzKvwPrc
  // ppvzSalesCommission
  // ppvzForPay
  // ppvzReward
  // ppvzVw
  // ppvzVwNds
  // ppvzOffice_id
  // ppvzOffice_name
  // ppvzSupplier_id
  // ppvzSupplier_name
  // ppvzInn
}
