import { Controller, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { RazorpayModule } from './rajorpay/razorpay.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config accessible globally
      load: [config], // Loads the custom configuration
    }),

    RazorpayModule, // Import other modules here
  ],
  providers:[AppService],
  controllers: [AppController],
})
export class AppModule {}
