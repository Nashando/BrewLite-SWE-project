import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableCors();
  app.enableShutdownHooks();
  const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
  await app.listen(port);
  new Logger('Bootstrap').log(`API đang chạy tại cổng ${port}`);
}
bootstrap();
