import { HttpService } from '@nestjs/axios';
import { env } from 'process';
import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { observable } from 'rxjs';
import objectContaining = jasmine.objectContaining;
import { PaymentStatus } from './entities/payment.entity';
import { UserService } from '../user/services/user.service';
import moment from 'moment';

export enum PaymentEvent {
  PaymentSucceeded = 'payment.succeeded',
  PaymentWaitingForCapture = 'payment.waiting_for_capture',
  PaymentCanceled = 'payment.canceled',
  RefundSucceeded = 'refund.succeeded',
}

export interface PaymentNotification {
  type: string;
  event: PaymentEvent;
  object: {
    id: string;
    status: string;
    amount: {
      value: string;
      currency: string;
    };
    income_amount: {
      value: string;
      currency: string;
    };
    description: string;
    recipient: {
      account_id: string;
      gateway_id: string;
    };
    payment_method: {
      type: string;
      id: string;
      saved: boolean;
      title: string;
    };
  };
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly paymentRepository: PaymentRepository,
    private readonly userService: UserService,
  ) {}

  public async handlePayment(notification: PaymentNotification): Promise<void> {
    if (notification.event === PaymentEvent.PaymentSucceeded) {
      await this.paymentRepository.update({ paymentId: notification.object.id }, { status: PaymentStatus.SUCCEEDED });
      const payment = await this.paymentRepository.findOneOrFail({ paymentId: notification.object.id });
      await this.userService.updateSubscriptionExpirationDate(payment.userId, moment().add(1, 'month').toDate());
    }
    if (notification.event === PaymentEvent.PaymentCanceled) {
      await this.paymentRepository.update({ paymentId: notification.object.id }, { status: PaymentStatus.CANCELED });
    }
    if (notification.event === PaymentEvent.PaymentWaitingForCapture) {
      await this.paymentRepository.update({ paymentId: notification.object.id }, { status: PaymentStatus.WAITING_FOR_CAPTURE });
    }

    throw new Error('Undefined notification');
  }

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
            return_url: 'https://webhook.site/a50b3bc4-c0e2-4da3-be6b-55c014395b87',
          },
          description: 'Заказ №1',
        },
        {
          auth: {
            username: env.YOOKASSA_ID,
            password: env.YOOKASSA_TOKEN,
          },
          headers: {
            'Idempotence-Key': '1Fd3',
            'Content-Type': 'application/json',
          },
        },
      )
      .toPromise();

    await this.paymentRepository.save({ paymentId: data.id, amount: data.amount.value, status: PaymentStatus.PENDING, userId });
    console.log(data);
    return data.confirmation.confirmation_url;
  }
}
