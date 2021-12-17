import { PaymentEvent, PaymentNotification, PaymentService } from './payment.service';
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { PaymentRepository } from './payment.repository';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { UserService } from '../user/services/user.service';

describe('paymentService', () => {
  let paymentService: PaymentService;
  let paymentRepository: PaymentRepository;
  let userService: UserService;

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
            findOne: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            updateSubscriptionExpirationDate: jest.fn(),
          },
        },
      ],
    }).compile();

    paymentService = module.get(PaymentService);
    paymentRepository = module.get(PaymentRepository);
    userService = module.get(UserService);
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
      jest.spyOn(paymentRepository, 'findOne').mockResolvedValueOnce({
        id: '54da6b71-39a7-4090-9d29-fb0ebfe3638d',
        userId: 'ac0e026a-0c00-447d-842a-ffc3f30d2d20',
        planId: 'PLAN_1',
      } as PaymentEntity);

      jest.spyOn(userService, 'updateSubscriptionExpirationDate').mockResolvedValueOnce(null);

      actual = await paymentService.handlePayment(notificationMock);
    });

    it('must return payment by id', () => {
      expect(paymentRepository.findOne).toHaveBeenCalledTimes(1);
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        paymentId: '29447bf2-000f-5000-a000-17fc2a0bf1f2',
        status: {
          _getSql: undefined,
          _multipleParameters: false,
          _objectLiteralParameters: undefined,
          _type: 'not',
          _useParameter: true,
          _value: 0,
        },
      });
    });

    it('must update subscription date', () => {
      expect(userService.updateSubscriptionExpirationDate).toHaveBeenCalledTimes(1);
      expect(userService.updateSubscriptionExpirationDate).toHaveBeenCalledWith('ac0e026a-0c00-447d-842a-ffc3f30d2d20', 1);
    });

    it('must update payment status', () => {
      expect(paymentRepository.update).toHaveBeenCalledTimes(1);
      expect(paymentRepository.update).toHaveBeenCalledWith(
        { id: '54da6b71-39a7-4090-9d29-fb0ebfe3638d' },
        { status: PaymentStatus.SUCCEEDED },
      );
    });

    it('must return void', () => {
      expect(actual).toBeUndefined();
    });
  });

  describe('when payment canceled', () => {
    let actual;
    const notificationMock = {
      type: 'notification',
      event: PaymentEvent.PaymentCanceled,
      object: {
        id: '29447bf2-000f-5000-a000-17fc2a0bf1f2',
      },
    } as PaymentNotification;

    beforeEach(async () => {
      actual = await paymentService.handlePayment(notificationMock);
    });

    it('must update payment status', () => {
      expect(paymentRepository.update).toHaveBeenCalledTimes(1);
      expect(paymentRepository.update).toHaveBeenCalledWith(
        { paymentId: '29447bf2-000f-5000-a000-17fc2a0bf1f2' },
        { status: PaymentStatus.CANCELED },
      );
    });

    it('must return void', () => {
      expect(actual).toBeUndefined();
    });
  });

  describe('when payment waiting_for_capture', () => {
    let actual;
    const notificationMock = {
      type: 'notification',
      event: PaymentEvent.PaymentWaitingForCapture,
      object: {
        id: '29447bf2-000f-5000-a000-17fc2a0bf1f2',
      },
    } as PaymentNotification;

    beforeEach(async () => {
      actual = await paymentService.handlePayment(notificationMock);
    });

    it('must update payment status', () => {
      expect(paymentRepository.update).toHaveBeenCalledTimes(1);
      expect(paymentRepository.update).toHaveBeenCalledWith(
        { paymentId: '29447bf2-000f-5000-a000-17fc2a0bf1f2' },
        { status: PaymentStatus.WAITING_FOR_CAPTURE },
      );
    });

    it('must return void', () => {
      expect(actual).toBeUndefined();
    });
  });
});
