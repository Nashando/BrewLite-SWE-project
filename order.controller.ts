import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderService } from './order.service';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly order: OrderService) {}

  @Post('checkout')
  checkout(@CurrentUser() user: AuthUser, @Headers('idempotency-key') key: string | undefined, @Body() dto: CheckoutDto) {
    return this.order.checkout(user, key, dto);
  }
}
