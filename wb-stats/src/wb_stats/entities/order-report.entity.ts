import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ShopEntity } from '../../shop/entities/shop.entity';

export const TABLE_NAME = 'orders_reports';

@Entity(TABLE_NAME)
@Index(['shopId'])
@Index(['lastChangeDate'])
@Unique(['odid'])
export class OrderReportEntity {
  static tableName: string = TABLE_NAME;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @ManyToOne(() => ShopEntity)
  shop: ShopEntity;

  @Column({ nullable: false })
  number: string;

  @Column({ type: 'timestamp',nullable: false })
  date: Date;

  @Column({ type: 'timestamp',nullable: false })
  lastChangeDate: Date;

  @Column({ nullable: false })
  supplierArticle: string;

  @Column({ nullable: false })
  techSize: string;

  @Column({ nullable: false })
  barcode: string;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false })
  totalPrice: number;

  @Column({ nullable: false })
  discountPercent: number;

  @Column({ nullable: false })
  warehouseName: string

  @Column({ nullable: false })
  oblast: string;

  @Column({ nullable: false })
  incomeID: string;

  @Column({ nullable: false })
  odid: string;

  @Column({ nullable: false })
  nmId: string;

  @Column({ nullable: false })
  subject: string;

  @Column({ nullable: false })
  category: string;

  @Column({ nullable: false })
  brand: string

  @Column({ nullable: false })
  isCancel: boolean

  @Column({ type: 'timestamp',nullable: true })
  cancelDt?: Date;

  @Column({ nullable: false })
  gNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
