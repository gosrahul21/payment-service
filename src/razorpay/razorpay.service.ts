import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService implements OnModuleInit {
  private readonly razorpay: Razorpay;
  private readonly logger = new Logger(RazorpayService.name);

  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not found in environment variables');
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async onModuleInit() {
    try {
      await this.razorpay.payments.all();
      this.logger.log('Razorpay initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Razorpay:', error);
      throw error;
    }
  }

  async createOrder(amount: number, currency: string) {
    try {
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const orderOptions = {
        amount: amount * 1000,
        currency: currency,
        payment_capture: true,
      };
      this.logger.log(`Order created successfully`);
      const order = await this.razorpay.orders.create(orderOptions);
      console.log(order)
      this.logger.log(`Order created successfully: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }

  async verifySignature(payload: string, signature: string): Promise<boolean> {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest('hex');
      
      return expectedSignature === signature;
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      throw error;
    }
  }

  async verifyWebhookSignature(payload: any, signature){
    return Razorpay.validateWebhookSignature((payload),signature, process.env.RAZORPAY_KEY_SECRET);
  }

  async publishPaymentSuccessEvent(data: any) {
    try {
      // this.clientProxy.emit('payment.success', data);
      this.logger.log('Payment successful:', data);
      console.log("payment successful");
    } catch (error) {
      this.logger.error(`Failed to publish event: ${error.message}`);
      throw error;
    }
  }
}