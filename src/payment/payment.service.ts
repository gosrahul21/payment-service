import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PublishService } from 'src/pub-sub/publish.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/payment.dto';
import { RazorpayService } from 'src/razorpay/razorpay.service';
import { PaymentStatus } from './types/payment-status.enum';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly razorpayService: RazorpayService,
    private readonly publishService: PublishService,
  ) {}

  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    // call razorpayService to create payment
    // Create Order
    const order = this.paymentRepository.create({
      ...data,

      // razorPayOrderId: razorPayOrder.id,
    });

    // Save Order
    const savedPayment = await this.paymentRepository.save(order);
    return savedPayment;
  }

  async getPaymentByOrderId(orderId: string) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: orderId },
      });
      if (!payment) throw new NotFoundException('No payment found');
      return payment;
    } catch (error) {
      throw error;
    }
  }

  async checkoutPayment(orderId: string) {
    try {
      const payment = await this.getPaymentByOrderId(orderId);
      // call razorpayService to create payment
      const razorPayOrder = await this.razorpayService.createOrder(
        payment.amount,
        'INR',
      );
      // update payment with razorpayOrderId
      await this.updatePayment(orderId, {
        razorPayOrderId: razorPayOrder.id,
      });
      return { ...payment, razorPayOrderId: razorPayOrder.id };
      // Create Order
    } catch (error) {
      throw error;
    }
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

  async verifyPayment(body: any, signature: string) {
    const isValid = await this.razorpayService.verifyWebhookSignature(
      JSON.stringify(body),
      signature,
    );

    const paymentEntity = body.payload?.payment?.entity;

    if (!isValid) {
      await this.handlePaymentEvent({
        razorPayOrderId: paymentEntity?.order_id,
        paymentId: paymentEntity?.id,
        status: PaymentStatus.FAILED,
        reason: 'Invalid signature',
        payload: paymentEntity,
      });
      throw new ForbiddenException('Not authorized');
    }

    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;
    const paymentStatus = paymentEntity?.status;

    if (!razorpayOrderId || !razorpayPaymentId || !paymentStatus) {
      await this.handlePaymentEvent({
        razorPayOrderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        status: PaymentStatus.FAILED,
        reason: 'Missing required fields',
        payload: paymentEntity,
      });
      throw new Error('Incomplete payment data received');
    }

    // Handle payment status and update DB for all cases
    switch (paymentStatus) {
      case 'captured':
        await this.handlePaymentEvent({
          razorPayOrderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          status: PaymentStatus.SUCCESSFULL,
          payload: paymentEntity,
        });
        return {
          success: true,
          message: 'Payment verified and captured successfully.',
        };

      case 'failed':
        await this.handlePaymentEvent({
          razorPayOrderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          status: PaymentStatus.FAILED,
          reason: paymentEntity?.error_description || 'Payment failed',
          payload: paymentEntity,
        });
        return {
          success: false,
          message: 'Payment verification failed. Please try again.',
        };

      case 'pending':
        await this.handlePaymentEvent({
          razorPayOrderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          status: PaymentStatus.PENDING,
          payload: paymentEntity,
        });
        return {
          success: false,
          message: 'Payment is still pending. Awaiting confirmation.',
        };

      default:
        await this.handlePaymentEvent({
          razorPayOrderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          status: PaymentStatus.FAILED,
          reason: 'Unhandled payment status',
          payload: paymentEntity,
        });
        return {
          success: false,
          message: 'Unhandled payment status. Please contact support.',
        };
    }
  }

  async updatePayment(orderId: string, updatePaymentDto) {
    await this.paymentRepository.update({ orderId }, updatePaymentDto);

    // Retrieve the updated entity
    const updatedPayment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (!updatedPayment) {
      throw new Error(`Payment with order ID ${orderId} not found`);
    }

    return updatedPayment;
  }

  private async handlePaymentEvent(eventData: {
    razorPayOrderId: string;
    paymentId: string;
    status: PaymentStatus;
    reason?: string;
    payload: any;
  }) {
    const { razorPayOrderId, paymentId, status, reason, payload } = eventData;
    let payment;
    // Update the database with the event details
    try {
      payment = await this.paymentRepository.update(
        { razorPayOrderId: razorPayOrderId },
        {
          status,
          razorpayPaymentId: paymentId,
        },
      );
    } catch (error) {
      console.error(
        `Failed to update payment for order ${razorPayOrderId}:`,
        error.message,
      );
      throw new Error('Failed to update payment status in the database');
    }

    // Emit the Kafka event
    await this.publishService.publishEvent('payment.status.update', {
      orderId: payment?.orderId, // actual orderId
      razorpay_order_id: razorPayOrderId,
      razorpay_payment_id: paymentId,
      status,
      reason: reason || null,
      payload,
    });
  }

  async handleVerifyPayment(body: any) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const isValid = await this.razorpayService.verifySignature(
      payload,
      razorpay_signature,
    );

    if (isValid) {
      // Publish the successful payment event
      await this.publishService.publishEvent('', {
        razorpay_order_id,
        razorpay_payment_id,
        status: 'success',
      });
      return {
        success: true,
        message: 'Payment verified successfully.',
      };
    } else {
      throw new ForbiddenException('Not authorized');
    }
  }
}
