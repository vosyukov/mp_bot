import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import * as moment from 'moment';

export enum Language {
  EN = 'en',
}

@Injectable()
export class UserRegistrationService {
  constructor(private readonly userRepository: UserRepository) {}

  public async registrationByTelegram(
    tgId: number,
    tgUsername: string,
    firstName: string,
    lastName: string,
    language: string,
  ): Promise<void> {
    const user = await this.userRepository.findByTgId(tgId);

    if (user) {
      await this.userRepository.update({ tgId }, { tgId, tgUsername, firstName, lastName, language });
    } else {
      await this.userRepository.save({
        tgId,
        tgUsername,
        firstName,
        lastName,
        language,
        subscriptionExpirationDate: moment().add(10, 'day').toDate(),
      });
    }
  }
}
