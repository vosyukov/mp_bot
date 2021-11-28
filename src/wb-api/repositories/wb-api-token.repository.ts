import { EntityRepository, Repository } from 'typeorm';

import { WbApiTokenEntity } from '../entities/wb-api-token.entity';

@EntityRepository(WbApiTokenEntity)
export class WbApiTokenRepository extends Repository<WbApiTokenEntity> {}
