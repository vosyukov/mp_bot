import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { Language } from '../services/user-registration.service';
import { WbApiTokenEntity } from '../../wb-api/entities/wb-api-token.entity';
import { JoinColumn } from 'typeorm';

export const TABLE_NAME = 'users';

@Entity(TABLE_NAME)
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  tgId: string;

  @Column({ nullable: true })
  tgUsername: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: false })
  language: Language;

  @OneToOne(() => WbApiTokenEntity)
  token: WbApiTokenEntity;
}
