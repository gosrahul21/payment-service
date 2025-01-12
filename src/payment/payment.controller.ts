// src/orders/orders.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Headers,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentStatus } from './types/payment-status.enum';
import { Payment } from './entities/payment.entity';

@Controller('orders')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * create payment object for order
   * @param message 
   */
  @EventPattern('order.created') // Listen for Kafka topic 'order.created'
  async handleOrderCreated(@Payload() message: any) {
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
  
  /**
   * called by frontend to process payment , called on checkout click
   * @param orderId 
   * @returns 
   */
  @Get(':orderId')
  async checkoutPayment(
    @Param('orderId') orderId: string,
  ): Promise<Payment> {
    const userId = 1;
    return await this.paymentService.checkoutPayment(orderId);
  }

  @Post('webhook')
  async verifyPayment(
    @Body() body,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    // verifying body 
    // {
    //   entity: 'event',
    //   account_id: 'acc_JJk0puD2zKS4Tz',
    //   event: 'payment.captured',
    //   contains: [ 'payment' ],
    //   payload: { payment: { entity: [Object] } },
    //   created_at: 1736524407
    // }    
    return this.paymentService.verifyPayment(body, signature);
  }

  @Post('payment')
  async handlePaymentVerify(@Body() body) {
    return await this.paymentService.handleVerifyPayment(body);
  }
}
