import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  listMine(@CurrentUser() user: AuthUser) {
    return this.orders.listMine(user.id);
  }

  @Get('all')
  @Roles(Role.STAFF, Role.MANAGER)
  listAll() {
    return this.orders.listAll();
  }

  @Get('code/:code')
  findByCode(@CurrentUser() user: AuthUser, @Param('code') code: string) {
    return this.orders.findByCode(user, code);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.orders.findOne(user, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.orders.cancel(user, id);
  }

  /** Nhân viên xác nhận đã thu tiền mặt tại quầy. */
  @Post(':id/confirm-cash')
  @Roles(Role.STAFF, Role.MANAGER)
  confirmCash(@Param('id', ParseUUIDPipe) id: string) {
    return this.orders.confirmCash(id);
  }

  @Patch(':id/status')
  @Roles(Role.STAFF, Role.MANAGER)
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
