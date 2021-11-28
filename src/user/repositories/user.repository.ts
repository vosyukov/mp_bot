import { UserEntity } from '../entities/user.entity';
import { EntityRepository, Not, Repository } from 'typeorm';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  public async getUsersWithValidApiKey(): Promise<UserEntity[]> {
    return this.find({ wbApiKey: Not('null') });
  }
}
