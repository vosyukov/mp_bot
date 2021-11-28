import {Inject, Injectable} from "@nestjs/common";
import {UserRepository} from "../repositories/user.repository";

export enum Language {
    EN = 'en'
}

@Injectable()
export class UserRegistrationService {
    constructor(private readonly userRepository: UserRepository) {}

    public async registrationByTelegram(tgId: string, tgUsername: string, firstName: string, lastName: string, language: Language): Promise<void> {
        await this.userRepository.save({tgId, tgUsername, firstName, lastName, language})
    }

    public async addWbApiKeyByTelegram(tgId: string, wbApiKey: string): Promise<void> {
        await this.userRepository.update({tgId}, {wbApiKey})
    }
}