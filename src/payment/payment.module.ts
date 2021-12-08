import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentRepository } from './payment.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentRepository]), HttpModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
