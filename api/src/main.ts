import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

const options: any = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

if (process.env.REDIS_PASSWORD) {
  options.password = process.env.REDIS_PASSWORD;
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice( {
    transport: Transport.REDIS,
    options: options,
  });

  await app.startAllMicroservices();
  await app.listen(4200)

}
bootstrap();
