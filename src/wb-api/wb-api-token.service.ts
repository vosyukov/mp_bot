import { Injectable } from '@nestjs/common';
import { WbApiTokenRepository } from './repositories/wb-api-token.repository';
import { UserEntity } from '../user/entities/user.entity';
import { WbApiTokenEntity } from './entities/wb-api-token.entity';

@Injectable()
export class WbApiTokenService {
  constructor(private readonly wbApiTokenRepository: WbApiTokenRepository) {}

  public async addKey(user: UserEntity, token: string): Promise<WbApiTokenEntity> {
    const t = await this.wbApiTokenRepository.findOne({ user });
    if (t) {
      return await this.wbApiTokenRepository.save({ id: t.id, token });
    }

    return this.wbApiTokenRepository.save({ user, token });
  }

  public async findAll(): Promise<WbApiTokenEntity[]> {
    return this.wbApiTokenRepository.find();
  }
}
