import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async findUserByTgId(id: number): Promise<UserEntity | null> {
    const result = await this.userRepository.findByTgId(id);
    return result || null;
  }
}
