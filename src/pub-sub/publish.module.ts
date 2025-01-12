// src/pub-sub/pub-sub.module.ts

import { Module } from '@nestjs/common';
import { PublishService } from './publish.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_ORDER_SERVICE_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId:"order-service",
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId:"order-group",
          }
        },
      },
    ]),
  ],
  providers: [PublishService],
  exports: [PublishService],
})
export class PubSubModule {}
