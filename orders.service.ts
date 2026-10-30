import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Role } from '@prisma/client';
import { AuthUser } from '../common/auth-user';
import { PrismaService } from '../prisma/prisma.service';

/** Luồng trạng thái do nhân viên / quản lý cập nhật. */
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PENDING]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.READY,
  [OrderStatus.READY]: OrderStatus.COMPLETED,
};

const detailInclude = { items: true, payment: true } as const;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lịch sử đơn của chính người dùng. */
  listMine(userId: number) {
    return this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: detailInclude });
  }

  /** Nhân viên / quản lý xem tất cả đơn. */
  listAll() {
    return this.prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: detailInclude });
  }

  /** Chi tiết / xác nhận đơn. Khách chỉ xem được đơn của mình. */
  async findOne(user: AuthUser, id: number) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: detailInclude });
    if (!order || (user.role === Role.CUSTOMER && order.userId !== user.id)) {
      throw new NotFoundException(`Không tìm thấy đơn hàng #${id}`);
    }
    return order;
  }

  /** Tra cứu theo mã đơn (BL-XXXXXXXX). */
  async findByCode(user: AuthUser, code: string) {
    const order = await this.prisma.order.findUnique({ where: { code: code.toUpperCase() }, include: detailInclude });
    if (!order || (user.role === Role.CUSTOMER && order.userId !== user.id)) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${code}`);
    }
    return order;
  }

  /**
   * Huỷ đơn khi chưa pha chế (PENDING): hoàn lại tồn kho và hoàn tiền
   * (ví cộng lại số dư; thẻ mô phỏng chỉ đổi trạng thái giao dịch sang REFUNDED).
   */
  async cancel(user: AuthUser, id: number) {
    const order = await this.findOne(user, id);
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id, status: OrderStatus.PENDING },
        data: { status: OrderStatus.CANCELLED },
      });
      if (claimed.count === 0) throw new ConflictException('Chỉ huỷ được đơn chưa bắt đầu pha chế');

      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }

      const paid = await tx.payment.findUnique({ where: { orderId: id } });
      if (paid && paid.status === PaymentStatus.SUCCESS) {
        await tx.payment.update({ where: { id: paid.id }, data: { status: PaymentStatus.REFUNDED } });
        if (paid.method === PaymentMethod.WALLET) {
          await tx.user.update({ where: { id: order.userId }, data: { walletBalance: { increment: paid.amount } } });
        }
      }
      return tx.order.findUniqueOrThrow({ where: { id }, include: detailInclude });
    });
  }

  /** Nhân viên / quản lý chuyển trạng thái theo đúng thứ tự. */
  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Không tìm thấy đơn hàng #${id}`);
    if (NEXT_STATUS[order.status] !== status) {
      throw new ConflictException(`Không thể chuyển từ ${order.status} sang ${status}`);
    }
    // updateMany + điều kiện status hiện tại để tránh 2 nhân viên cập nhật chồng nhau
    const res = await this.prisma.order.updateMany({ where: { id, status: order.status }, data: { status } });
    if (res.count === 0) throw new ConflictException('Trạng thái đơn vừa bị thay đổi, vui lòng tải lại');
    return this.prisma.order.findUniqueOrThrow({ where: { id }, include: detailInclude });
  }
}
