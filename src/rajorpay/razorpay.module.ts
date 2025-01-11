import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { RazorpayController } from './rajorpay.controller';


@Module({
  imports: [],
  controllers: [RazorpayController],
  providers: [RazorpayService],
})
export class RazorpayModule {}
