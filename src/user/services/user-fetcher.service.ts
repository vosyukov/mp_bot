import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserFetcherService {
  constructor(private readonly userRepository: UserRepository) {}

  public async getUsersWithValidWBApiKey(): Promise<UserEntity[]> {
    return this.userRepository.getUsersWithValidApiKey();
  }
}
