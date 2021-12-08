import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { UserEntity } from '../../user/entities/user.entity';

export const TABLE_NAME = 'payments';

@Entity(TABLE_NAME)
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  paymentId: string;

  @Column()
  amount: string;

  @Column()
  status: string;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
