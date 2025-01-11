import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create the HTTP application
  const app = await NestFactory.create(AppModule);

  // Configure the Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'], // Replace with your Kafka broker address
      },
      consumer: {
        groupId: 'payment-consumer', // Unique consumer group ID for the service
      },
    },
  });

  // Start both the HTTP app and the Kafka microservice
  await app.startAllMicroservices();
  await app.listen(3001);

  console.log('Application is running on http://localhost:3000');
}

bootstrap();
