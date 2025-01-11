// src/orders/orders.controller.ts
import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentStatus } from './types/payment-status.enum';

@Controller('orders')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('order.created') // Listen for Kafka topic 'order.created'
  async handleOrderCreated(@Payload() message: any) {
    console.log('Received order.created message:', message);
    // {
    //   id: 'cf0a2568-060b-4a1d-96d0-1494a400c311',
    //   status: 'PENDING',
    //   userId: 1,
    //   items: [
    //     { productId: 'prod123', quantity: 2, price: 49.99 },
    //     { productId: 'prod456', quantity: 1, price: 89.99 }
    //   ],
    //   amount: 189.97
    // }
    const { id: orderId, amount } = message;

    const createPaymentDto = {
      orderId,
      amount,
      status: PaymentStatus.PENDING, // Default status for new payments
    };

    await this.paymentService.createPayment(createPaymentDto);
  }

  // @Get(':orderId')
  // async getOrderById(@Param('orderId') orderId: string): Promise<Order> {
  //   const userId = 1;
  //   // return this.ordersService.createOrder(userId, body);
  //   return await this.ordersService.getOrderById(orderId);
  // }
}
