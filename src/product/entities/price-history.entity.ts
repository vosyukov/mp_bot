import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { ShopEntity } from '../../shop/entities/shop.entity';

export const TABLE_NAME = 'cost_price_history';

@Entity(TABLE_NAME)
@Index(['barcode', 'createdAt', 'updatedAt'])
export class PriceHistoryEntity {
  public static tableName: string = TABLE_NAME;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  barcode: string;

  @Column({ nullable: false, default: 0 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ShopEntity)
  shop: ShopEntity;
}
