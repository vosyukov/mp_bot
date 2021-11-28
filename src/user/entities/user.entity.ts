import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Language } from '../services/user-registration.service';

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

  @Column({ nullable: true })
  wbApiKey: string;
}
