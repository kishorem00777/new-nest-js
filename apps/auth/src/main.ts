import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const rabbitUrl = process.env.RABBITMQ_URL;

  if (!rabbitUrl) {
    throw new Error('RABBITMQ_URL is not defined');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: 'auth_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
