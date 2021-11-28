import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

export const TABLE_NAME = 'wb-api-tokens';

@Entity(TABLE_NAME)
export class WbApiTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
