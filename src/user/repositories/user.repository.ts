import { UserEntity } from '../entities/user.entity';
import { EntityRepository, Not, Repository } from 'typeorm';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  public async findByTgId(id: number): Promise<UserEntity | null> {
    const result = await this.findOne({ where: { tgId: id }, relations: ['shop'] });
    return result ?? null;
  }

  public async updateSubscriptionExpirationDate(userId: string, date: Date): Promise<void> {
    await this.update({ id: userId }, { subscriptionExpirationDate: date });
    return;
  }
}
