import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from '../user/services/user.service';
import { ProductPriceTemplateService } from './services/product-price-template.service';
import { AmplitudeInterceptor } from '../amplitude/amplitued.interceprot';

@Controller()
export class TgProductController {
  constructor(private readonly productPriceTemplateService: ProductPriceTemplateService, private readonly userService: UserService) {}

  @UseInterceptors(AmplitudeInterceptor)
  @MessagePattern('getPriceTemplate')
  public async getPriceTemplate(
    @Payload()
    data: {
      userTgId: number;
    },
  ): Promise<Buffer> {
    const { userTgId } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    return this.productPriceTemplateService.getPriceTemplate(user.id);
  }

  @UseInterceptors(AmplitudeInterceptor)
  @MessagePattern('setPrice')
  public async setPrice(
    @Payload()
    data: {
      userTgId: number;
      buffer: string;
    },
  ): Promise<void> {
    const { userTgId, buffer } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    return this.productPriceTemplateService.setPrice(user.id, Buffer.from(buffer));
  }
}
