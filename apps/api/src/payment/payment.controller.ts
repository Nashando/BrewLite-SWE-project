import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PayDto } from './dto/pay.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  @Post()
  pay(@CurrentUser() user: AuthUser, @Headers('idempotency-key') key: string | undefined, @Body() dto: PayDto) {
    return this.payment.pay(user, key, dto);
  }
}
