import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentNotification, PaymentService } from './payment.service';

@Controller('/')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('callback')
  public async handlerPayment(@Body() data: PaymentNotification): Promise<void> {
    await this.paymentService.handlePayment(data);
  }
}
