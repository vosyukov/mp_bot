import { HttpService } from '@nestjs/axios';
import { env } from 'process';
import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly httpService: HttpService, private readonly paymentRepository: PaymentRepository) {}

  public async createPayment(userId: string, amount: number): Promise<string> {
    const { data } = await this.httpService
      .post(
        'https://api.yookassa.ru/v3/payments',
        {
          amount: {
            value: amount,
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: 'https://www.merchant-website.com/return_url',
          },
          description: 'Заказ №1',
        },
        {
          auth: {
            username: env.YOOKASSA_ID,
            password: env.YOOKASSA_TOKEN,
          },
          headers: {
            'Idempotence-Key': '1',
            'Content-Type': 'application/json',
          },
        },
      )
      .toPromise();

    await this.paymentRepository.save({ paymentId: data.id, amount: data.amount.value, status: data.status, userId });
    return data.confirmation.confirmation_url;
  }
}
