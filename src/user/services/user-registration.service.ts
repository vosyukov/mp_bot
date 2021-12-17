import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import * as moment from 'moment';
import { env } from 'process';

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
    refId: number | null,
  ): Promise<void> {
    const user = await this.userRepository.findByTgId(tgId);

    let refUserId = null;
    if (refId) {
      refUserId = (await this.userRepository.findByTgId(refId)).id;
    }

    if (user) {
      await this.userRepository.update({ tgId }, { tgId, tgUsername, firstName, lastName, language });
    } else {
      await this.userRepository.save({
        tgId,
        tgUsername,
        firstName,
        lastName,
        language,
        subscriptionExpirationDate: moment().add(env.TRIAL_PERIOD_DAYS, 'day').toDate(),
        refUserId,
      });
    }
  }
}
