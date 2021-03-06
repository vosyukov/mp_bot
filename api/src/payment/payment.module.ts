import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentRepository } from './payment.repository';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './payment.controller';
import { UserModule } from '../user/user.module';
import { TgPaymentController } from './tg-payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentRepository]), HttpModule, UserModule],
  providers: [PaymentService],
  controllers: [PaymentController, TgPaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
