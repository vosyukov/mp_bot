import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from '../user/services/user.service';
import { PaymentService } from './payment.service';

@Controller()
export class TgPaymentController {
  constructor(private readonly paymentService: PaymentService, private readonly userService: UserService) {}

  @MessagePattern('createPayment')
  public async createPayment(
    @Payload()
    data: {
      userTgId: number;
      planId: string;
    },
  ): Promise<string> {
    console.log(data);
    const { userTgId, planId } = data;

    const user = await this.userService.findUserByTgId(userTgId);
    return this.paymentService.createPayment(user.id, planId);
  }
}
