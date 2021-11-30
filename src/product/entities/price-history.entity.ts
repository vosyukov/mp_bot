import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WbApiTokenEntity } from '../../wb-api/entities/wb-api-token.entity';
import { ProductEntity } from './product.entity';

export const TABLE_NAME = 'price-history';

@Entity(TABLE_NAME)
export class PriceHistoryEntity {
  public static tableName: string = TABLE_NAME;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;

  @Column()
  productNmId: string;

  @Column({ nullable: false, default: 0 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
