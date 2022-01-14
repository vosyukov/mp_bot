import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from '../user/services/user.service';
import { ShopServices } from './services/shop.services';
import { AmplitudeInterceptor } from '../amplitude/amplitued.interceprot';

@Controller()
export class TgShopController {
  constructor(private readonly shopServices: ShopServices, private readonly userService: UserService) {}

  @UseInterceptors(AmplitudeInterceptor)
  @MessagePattern('addShop')
  public async addShop(
    @Payload()
    data: {
      userTgId: number;
      name: string;
      token: string;
    },
  ): Promise<string> {
    const { userTgId, name, token } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    const shop = await this.shopServices.addShop(user.id, name, token);
    return shop.id;
  }

  @UseInterceptors(AmplitudeInterceptor)
  @MessagePattern('findShopByUserTgId')
  public async findShopByUserTgId(
    @Payload()
    data: {
      userTgId: number;
    },
  ): Promise<any> {
    const { userTgId } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    const shop = await this.shopServices.findShopByUserId(user.id);
    return shop;
  }

  @MessagePattern('isValidToken')
  public async isValidToken(
    @Payload()
    data: {
      token: string;
    },
  ): Promise<boolean> {
    const { token } = data;

    return await this.shopServices.isValidToken(token);
  }
}
