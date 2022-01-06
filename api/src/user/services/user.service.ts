import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async findUserByTgId(id: number): Promise<UserEntity | null> {
    const result = await this.userRepository.findByTgId(id);
    return result || null;
  }

  public async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  public async getUserById(id: string): Promise<UserEntity> {
    const result = await this.userRepository.findOneOrFail({ id });
    return result;
  }

  public async updateSubscriptionExpirationDate(userId: string, countMonth: number): Promise<void> {
    const user = await this.userRepository.findOneOrFail({ id: userId });
    const startDate = new Date() <= user.subscriptionExpirationDate ? user.subscriptionExpirationDate : new Date();
    const endDate = moment(startDate).add(countMonth, 'month').toDate();
    await this.userRepository.updateSubscriptionExpirationDate(userId, endDate);
    if (user.refUserId) {
      const refUser = await this.userRepository.findOneOrFail({ id: user.refUserId });

      const startDate = new Date() <= refUser.subscriptionExpirationDate ? refUser.subscriptionExpirationDate : new Date();
      const endDate = moment(startDate).add(5, 'day').toDate();
      await this.userRepository.updateSubscriptionExpirationDate(refUser.id, endDate);
    }
    return;
  }
}
