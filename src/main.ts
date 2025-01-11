import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.enableCors();
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));

  const port = configService.get<number>('app.port') || 3000;

  await app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}`);
  });
}
bootstrap();