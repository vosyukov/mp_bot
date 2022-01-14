import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from '../user/services/user.service';
import { UserSettingsService } from './services/user-settings.service';
import { AmplitudeService } from '../amplitude/amplitude.service';
import { AmplitudeInterceptor } from '../amplitude/amplitued.interceprot';

@Controller()
export class TgUserSettingsController {
  constructor(
    private readonly userSettingsService: UserSettingsService,
    private readonly userService: UserService,
    private readonly amplitudeService: AmplitudeService,
  ) {}

  @UseInterceptors(AmplitudeInterceptor)
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
    await this.userSettingsService.updateTaxPercent(user.id, value);
    await this.amplitudeService.logEvent({ event_type: 'qwe' });
  }

  @UseInterceptors(AmplitudeInterceptor)
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
