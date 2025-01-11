import { Controller, Post, Res, HttpStatus, Body, Req, ForbiddenException, Header, Headers } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
@Controller('payments')
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('create')
  async createOrder(@Body() body) {
    const { amount, currency='INR' } = body;
    
    try {
      const order = await this.razorpayService.createOrder(amount, currency);
      // return res.status(HttpStatus.CREATED).json(order);
      return order;
    } catch (error) {
        console.log(error)
      // return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
      throw error;
    }
  }

  @Post('webhook')
  async verifyPayment(@Body() body,  @Headers('x-razorpay-signature') signature: string) {
    // verifying body {
    //   entity: 'event',
    //   account_id: 'acc_JJk0puD2zKS4Tz',
    //   event: 'payment.captured',
    //   contains: [ 'payment' ],
    //   payload: { payment: { entity: [Object] } },
    //   created_at: 1736524407
    // }
    console.log(signature)
    console.log('verifying body',body.payload.payment);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    console.log("verifying payments", payload)
    // const isValid = await this.razorpayService.verifySignature(payload, razorpay_signature);
    const isValid = await this.razorpayService.verifyWebhookSignature(JSON.stringify(body),signature);
    if (isValid) {
      // Publish the successful payment event
      await this.razorpayService.publishPaymentSuccessEvent({
        razorpay_order_id,
        razorpay_payment_id,
        status: 'success',
      });
      return {
        success: true, 
        message: 'Payment verified successfully.'
      }
      // return res.status(HttpStatus.OK).json({ success: true, message: 'Payment verified successfully.' });
    } else {
      // return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Invalid signature' });
      throw new ForbiddenException("Not authorized");
    }
  }

  @Post('payment')
  async handlePaymentVerify(@Body() body) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    console.log("verifying payments", payload)
    const isValid = await this.razorpayService.verifySignature(payload, razorpay_signature);

    if (isValid) {
      // Publish the successful payment event
      await this.razorpayService.publishPaymentSuccessEvent({
        razorpay_order_id,
        razorpay_payment_id,
        status: 'success',
      });
      return {
        success: true, 
        message: 'Payment verified successfully.'
      }
      // return res.status(HttpStatus.OK).json({ success: true, message: 'Payment verified successfully.' });
    } else {
      // return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Invalid signature' });
      throw new ForbiddenException("Not authorized");
    }
  }
}
