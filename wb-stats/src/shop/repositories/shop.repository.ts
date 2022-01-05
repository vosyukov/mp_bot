import { EntityRepository, Repository } from 'typeorm';
import { ShopEntity } from '../entities/shop.entity';

@EntityRepository(ShopEntity)
export class ShopRepository extends Repository<ShopEntity> {}
