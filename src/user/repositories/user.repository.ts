import { UserEntity } from '../entities/user.entity';
import { EntityRepository, Not, Repository } from 'typeorm';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  public async findByTgId(id: string): Promise<UserEntity | null> {
    const result = await this.findOne({ tgId: id });
    return result ?? null;
  }
}
