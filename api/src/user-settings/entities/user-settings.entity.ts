import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

export const TABLE_NAME = 'user-settings';

@Entity(TABLE_NAME)
export class UserSettingsEntity {
  @Column({ primary: true, type: 'uuid' })
  userId: string;

  @JoinColumn()
  @OneToOne(() => UserEntity)
  user: UserEntity;

  @Column({ nullable: false, default: 6 })
  taxPercent: number;

  @Column({ nullable: false, default: false })
  isEnabledNewOrderNotification: boolean;
}
