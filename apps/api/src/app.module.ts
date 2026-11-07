import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      expandVariables: true, // cho phép DATABASE_URL=postgresql://${POSTGRES_USER}:... như .env.example của nhóm
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrderModule,
    OrdersModule,
    PaymentModule,
    HealthModule,
  ],
})
export class AppModule {}
