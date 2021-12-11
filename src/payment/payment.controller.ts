import { Body, Controller } from '@nestjs/common';
import { PaymentNotification, PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  public async handlerPayment(@Body() data: PaymentNotification): Promise<void> {
    await this.paymentService.handlePayment(data);
  }
}
