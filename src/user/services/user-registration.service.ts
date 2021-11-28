import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { WbApiService } from '../../wb-api/wb-api.service';
import { WbApiTokenRepository } from '../../wb-api/repositories/wb-api-token.repository';
import { WbApiTokenService } from '../../wb-api/wb-api-token.service';

export enum Language {
  EN = 'en',
}

@Injectable()
export class UserRegistrationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly wbApiService: WbApiService,
    private readonly wbApiTokenService: WbApiTokenService,
  ) {}

  public async registrationByTelegram(
    tgId: string,
    tgUsername: string,
    firstName: string,
    lastName: string,
    language: Language,
  ): Promise<void> {
    const user = await this.userRepository.findByTgId(tgId);

    if (user) {
      await this.userRepository.update({ tgId }, { tgId, tgUsername, firstName, lastName, language });
    } else {
      await this.userRepository.save({ tgId, tgUsername, firstName, lastName, language });
    }
  }

  public async addWbApiKeyByTelegram(tgId: string, wbApiKey: string): Promise<void> {
    const result = await this.wbApiService.isValidKey(wbApiKey);
    const user = await this.userRepository.findByTgId(tgId);

    if (result) {
      await this.wbApiTokenService.addKey(user, wbApiKey);

      return;
    }

    throw new Error('невалидный ключ');
  }
}
