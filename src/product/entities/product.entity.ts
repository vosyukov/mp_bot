import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WbApiTokenEntity } from '../../wb-api/entities/wb-api-token.entity';

export const TABLE_NAME = 'products';

@Entity(TABLE_NAME)
export class ProductEntity {
  public static tableName: string = TABLE_NAME;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true, primary: true })
  nmId: string;

  @Column({ nullable: false })
  barcode: string;

  @Column({ nullable: false })
  supplierArticle: string;

  @Column({ nullable: false })
  status: string;

  @ManyToOne(() => WbApiTokenEntity)
  token: WbApiTokenEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
