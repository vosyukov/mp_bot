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

  public async updateSubscriptionExpirationDate(userId: string, date: Date): Promise<void> {
    const user = await this.userRepository.findOneOrFail({ id: userId });
    const startDate = new Date() <= user.subscriptionExpirationDate ? user.subscriptionExpirationDate : new Date();
    const endDate = moment(startDate).add(1, 'month').toDate();
    await this.userRepository.updateSubscriptionExpirationDate(userId, endDate);
    return;
  }
}
