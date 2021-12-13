import { HttpService } from '@nestjs/axios';
import { env } from 'process';
import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { PaymentStatus } from './entities/payment.entity';
import { UserService } from '../user/services/user.service';
import * as moment from 'moment';
import { Not } from 'typeorm';

export enum PaymentEvent {
  PaymentSucceeded = 'payment.succeeded',
  PaymentWaitingForCapture = 'payment.waiting_for_capture',
  PaymentCanceled = 'payment.canceled',
  RefundSucceeded = 'refund.succeeded',
}

export interface Plan {
  amount: number;
  month: number;
}

export const PLANS: Record<string, Plan> = {
  PLAN_1: { amount: 490, month: 1 },
  PLAN_2: { amount: 800, month: 2 },
  PLAN_3: { amount: 1200, month: 3 },
};

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
      const payment = await this.paymentRepository.findOne({
        paymentId: notification.object.id,
        status: Not(PaymentStatus.SUCCEEDED),
      });

      if (payment) {
        await this.userService.updateSubscriptionExpirationDate(payment.userId, PLANS[payment.planId].month);
        this.paymentRepository.update({ id: payment.id }, { status: PaymentStatus.SUCCEEDED });
      }
    } else if (notification.event === PaymentEvent.PaymentCanceled) {
      await this.paymentRepository.update({ paymentId: notification.object.id }, { status: PaymentStatus.CANCELED });
    } else if (notification.event === PaymentEvent.PaymentWaitingForCapture) {
      await this.paymentRepository.update({ paymentId: notification.object.id }, { status: PaymentStatus.WAITING_FOR_CAPTURE });
    } else {
      throw new Error('Undefined notification');
    }
  }

  public async createPayment(userId: string, planId: string): Promise<string> {
    const { data } = await this.httpService
      .post(
        'https://api.yookassa.ru/v3/payments',
        {
          amount: {
            value: PLANS[planId].amount,
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: 'https://t.me/wb_sales_pro_bot',
          },
          description: `Оплата доступа к сервису https://t.me/wb_sales_pro_bot сроком на ${PLANS[planId].month} месяц(а)`,
        },
        {
          auth: {
            username: env.YOOKASSA_ID,
            password: env.YOOKASSA_TOKEN,
          },
          headers: {
            'Idempotence-Key': `${Math.round(Date.now() / 10000)}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .toPromise();

    await this.paymentRepository.save({
      paymentId: data.id,
      amount: data.amount.value,
      status: PaymentStatus.PENDING,
      userId,
      planId: planId,
    });

    return data.confirmation.confirmation_url;
  }
}
