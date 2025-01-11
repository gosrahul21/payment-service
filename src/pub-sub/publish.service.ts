import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class PublishService {
  constructor(@Inject('KAFKA_ORDER_SERVICE_CLIENT') private readonly kafkaClient: ClientKafka) {}
  public publishEvent(eventName: string, data: any): void {
   const res = this.kafkaClient.emit(eventName, {
      ...data,
    });
    console.log(res);
  }
}
