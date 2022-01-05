import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from '../user/services/user.service';
import { UserSettingsService } from './services/user-settings.service';

@Controller()
export class TgUserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService, private readonly userService: UserService) {}

  @MessagePattern('updateTaxPercent')
  public async updateTaxPercent(
    @Payload()
    data: {
      userTgId: number;
      value: number;
    },
  ): Promise<void> {
    const { userTgId, value } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    return this.userSettingsService.updateTaxPercent(user.id, value);
  }

  @MessagePattern('getTaxPercent')
  public async getTaxPercent(
    @Payload()
    data: {
      userTgId: number;
    },
  ): Promise<number> {
    console.log(data);
    const { userTgId } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    return this.userSettingsService.getTaxPercent(user.id);
  }
}
