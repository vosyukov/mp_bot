import { ShopEntity } from '../entities/shop.entity';
import { ShopRepository } from '../repositories/shop.repository';
import { WbApiService } from '../../wb-api/wb-api.service';
import { UserService } from '../../user/services/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopServices {
  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly wbApiService: WbApiService,
    private readonly userService: UserService,
  ) {}

  public async addShop(userId: string, name: string, token: string): Promise<ShopEntity> {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new Error(`Invalid user ${userId}`);
    }

    const IsValid = await this.wbApiService.isValidKey(token);

    if (!IsValid) {
      throw new Error(`Invalid api key ${token}`);
    }

    return this.shopRepository.save({ name, token, user });
  }

  public async getShopByUserID(userId: string): Promise<ShopEntity> {
    return this.shopRepository.findOneOrFail({ where: { user: { id: userId } }, relations: ['user'] });
  }

  public async findShopByUserId(userId: string): Promise<ShopEntity | null> {
    const shop = await this.shopRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    return shop || null;
  }

  public async isValidToken(token: string): Promise<boolean> {
    return this.wbApiService.isValidKey(token);
  }

  public async getAllShops(): Promise<ShopEntity[]> {
    return this.shopRepository.find();
  }

  public async getShopById(id): Promise<ShopEntity> {
    return this.shopRepository.findOneOrFail({ id });
  }
}
