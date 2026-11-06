import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const config = app.get(ConfigService);
  // CORS_ORIGIN: danh sách origin được phép, ngăn cách bằng dấu phẩy (vd http://localhost:3000). Bỏ trống = cho phép tất cả.
  const origins = (config.get<string>('CORS_ORIGIN') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  app.enableCors({ origin: origins.length > 0 ? origins : true });
  app.enableShutdownHooks();

  // API_PREFIX (vd /api/v1) khớp .env.example của nhóm. Bỏ trống = không tiền tố. /health luôn nằm ngoài tiền tố.
  const prefix = (config.get<string>('API_PREFIX') ?? '').trim().replace(/^\/+|\/+$/g, '');
  if (prefix) app.setGlobalPrefix(prefix, { exclude: ['health'] });

  const port = Number(config.get('PORT')) || 3001; // khớp docker-compose và NEXT_PUBLIC_API_URL của frontend
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`API đang chạy tại cổng ${port}`);
}
bootstrap();
