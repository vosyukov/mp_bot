import { PaymentEvent, PaymentNotification, PaymentService } from './payment.service';
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { PaymentRepository } from './payment.repository';
import { PaymentStatus } from './entities/payment.entity';

describe('paymentService', () => {
  let paymentService: PaymentService;
  let paymentRepository: PaymentRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: HttpService,
          useValue: {},
        },
        {
          provide: PaymentRepository,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    paymentService = module.get(PaymentService);
    paymentRepository = module.get(PaymentRepository);
  });

  describe('when payment succeeded', () => {
    let actual;
    const notificationMock = {
      type: 'notification',
      event: PaymentEvent.PaymentSucceeded,
      object: {
        id: '29447bf2-000f-5000-a000-17fc2a0bf1f2',
      },
    } as PaymentNotification;

    beforeEach(async () => {
      actual = await paymentService.handlePayment(notificationMock);
    });

    it('jj', () => {
      expect(actual).toBe(undefined);
    });

    it('j99j', () => {
      expect(paymentRepository.update).toHaveBeenCalledTimes(1);
      expect(paymentRepository.update).toHaveBeenCalledWith({ paymentId: notificationMock.object.id }, { status: PaymentStatus.SUCCEEDED });
    });
  });
});
