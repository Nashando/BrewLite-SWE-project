import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PayDto } from './dto/pay.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  @Post()
  pay(@CurrentUser() user: AuthUser, @Headers('idempotency-key') key: string | undefined, @Body() dto: PayDto) {
    return this.payment.pay(user, key, dto);
  }
}
