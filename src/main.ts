import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
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

  const configService = app.get(ConfigService);
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.enableCors();
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));

  const port = configService.get<number>('app.port') || 3001;

  await app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}`);
  });

}

bootstrap();
