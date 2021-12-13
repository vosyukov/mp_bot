import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { UserEntity } from '../../user/entities/user.entity';

export const TABLE_NAME = 'payments';

export enum PaymentStatus {
  SUCCEEDED,
  CANCELED,
  PENDING,
  WAITING_FOR_CAPTURE,
}

@Entity(TABLE_NAME)
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  paymentId: string;

  @Column()
  amount: string;

  @Column()
  status: PaymentStatus;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: string;

  @Column()
  planId: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
