import { PaymentStatus } from '../types/payment-status.enum';

export class CreatePaymentDto {
  orderId: string;

  razorPayOrderId?: string;

  razorpayPaymentId?: string;

  amount: number;
}
