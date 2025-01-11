import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PublishService } from 'src/pub-sub/publish.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/payment.dto';


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    // Create Order
    const order = this.paymentRepository.create({
     ...data
    });

    // Save Order
    const savedPayment = await this.paymentRepository.save(order);

    return savedPayment;
  }

  async getOrderById(orderId: string) {
    try {
      const order = await this.paymentRepository.findOne({
        where: { id: orderId },
      });
      if (!order) throw new NotFoundException('NO ORDER FOUND');
      return order;
    } catch (error) {}
  }
}
