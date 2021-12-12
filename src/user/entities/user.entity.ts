import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import * as moment from 'moment';
import { JoinColumn } from 'typeorm';
import { ShopEntity } from '../../shop/entities/shop.entity';

export const TABLE_NAME = 'users';

@Entity(TABLE_NAME)
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  tgId: number;

  @Column({ nullable: true })
  tgUsername: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: false })
  language: string;

  @OneToOne(() => ShopEntity)
  @JoinColumn()
  shop: ShopEntity;

  @Column({ type: 'datetime' })
  subscriptionExpirationDate: Date;
}
