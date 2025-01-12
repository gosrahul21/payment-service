
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { RazorpayModule } from './razorpay/razorpay.module';
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config accessible globally
      load: [config], // Loads the custom configuration
    }),
    RazorpayModule, // Import other modules here
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'rahul@321',
      database: 'ecommerce',
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity.{js,ts}'], // Path to entities
      migrations: [__dirname + '/migrations/*.{js,ts}'], // Path to migrations
      synchronize: false, // Disable synchronize in favor of migrations
      migrationsRun: true, // Auto-run migrations at startup
    }),
    OrdersModule,
  ],
})
export class AppModule {}
