import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentRepository } from './payment.repository';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentRepository]), HttpModule],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
