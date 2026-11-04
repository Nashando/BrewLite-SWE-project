import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Payment, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuthUser } from '../common/auth-user';
import { releaseExpiredOrders } from '../common/order-expiry';
import { toPaymentView } from '../common/order-view';
import { PrismaService } from '../prisma/prisma.service';
import { PayDto } from './dto/pay.dto';

/** Lỗi nội bộ để rollback transaction khi cổng mô phỏng từ chối. */
class PaymentDeclinedError extends Error {}

function isExpired(expiry: string, now = new Date()): boolean {
  const [mm, yy] = expiry.split('/').map(Number);
  return new Date(2000 + yy, mm, 1) <= now; // ngày 1 của tháng kế tiếp
}

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Thanh toán mô phỏng cho đơn PENDING_PAYMENT (ADR 004).
   * Idempotent theo (userId, Idempotency-Key): gửi lại cùng key trả lại kết quả cũ, không trừ tiền lần 2.
   * Thất bại vẫn trả 201 với `status: "FAILED"` + `failureReason`; đơn giữ nguyên PENDING_PAYMENT để thử lại.
   *   - WALLET: trừ số dư ví; không đủ → thất bại.
   *   - CARD: số thẻ bắt đầu 4000 hoặc kết thúc 0002 → từ chối; kết thúc 0003 → mô phỏng timeout; còn lại thành công.
   */
  async pay(user: AuthUser, idempotencyKey: string | undefined, dto: PayDto) {
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 100) {
      throw new BadRequestException('Thiếu hoặc sai header Idempotency-Key (8–100 ký tự, nên dùng UUID)');
    }

    const existing = await this.findByKey(user.id, idempotencyKey);
    if (existing) return this.replay(existing, dto);

    let cardDigits: string | null = null;
    if (dto.method === PaymentMethod.CARD) {
      cardDigits = dto.card!.number.replace(/\D/g, '');
      if (cardDigits.length < 13 || cardDigits.length > 19) throw new BadRequestException('Số thẻ không hợp lệ');
      if (isExpired(dto.card!.expiry)) throw new BadRequestException('Thẻ đã hết hạn');
    }

    await releaseExpiredOrders(this.prisma);
    const order = await this.prisma.order.findFirst({ where: { id: dto.orderId, userId: user.id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new ConflictException('Đơn hàng đã được thanh toán, đã hết hạn thanh toán hoặc đã bị huỷ');
    }

    const base = {
      orderId: order.id,
      userId: user.id,
      method: dto.method,
      amount: order.totalAmount,
      idempotencyKey,
      transactionRef: `TXN-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`,
      cardLast4: cardDigits ? cardDigits.slice(-4) : null,
    };

    try {
      const payment = await this.prisma.$transaction(async (tx) => {
        // "Giành" đơn: chỉ 1 request đổi được PENDING_PAYMENT → PAID
        const claimed = await tx.order.updateMany({
          where: { id: order.id, status: OrderStatus.PENDING_PAYMENT },
          data: { status: OrderStatus.PAID },
        });
        if (claimed.count === 0) throw new ConflictException('Đơn hàng vừa được thanh toán bởi yêu cầu khác');

        const failure = await this.charge(tx, user.id, dto.method, cardDigits, order.totalAmount);
        if (failure) throw new PaymentDeclinedError(failure);
        return tx.payment.create({ data: { ...base, status: PaymentStatus.SUCCESS } });
      });
      return toPaymentView(payment);
    } catch (e) {
      if (e instanceof PaymentDeclinedError) {
        // Transaction đã rollback (đơn vẫn PENDING_PAYMENT) → ghi lại lần thử thất bại
        const failed = await this.prisma.payment.create({
          data: { ...base, status: PaymentStatus.FAILED, failureReason: e.message },
        });
        return toPaymentView(failed);
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // Hai request cùng Idempotency-Key chạy song song
        const again = await this.findByKey(user.id, idempotencyKey);
        if (again) return this.replay(again, dto);
      }
      throw e;
    }
  }

  private findByKey(userId: string, idempotencyKey: string) {
    return this.prisma.payment.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } } });
  }

  private replay(payment: Payment, dto: PayDto) {
    if (payment.orderId !== dto.orderId) {
      throw new ConflictException('Idempotency-Key này đã được dùng cho đơn hàng khác');
    }
    return toPaymentView(payment);
  }

  /** Trả về lý do thất bại, hoặc null nếu thành công. */
  private async charge(
    tx: Prisma.TransactionClient,
    userId: string,
    method: PaymentMethod,
    cardDigits: string | null,
    amount: number,
  ): Promise<string | null> {
    if (method === PaymentMethod.WALLET) {
      const res = await tx.user.updateMany({
        where: { id: userId, walletBalance: { gte: amount } },
        data: { walletBalance: { decrement: amount } },
      });
      return res.count === 0 ? 'Số dư ví không đủ' : null;
    }
    if (cardDigits!.startsWith('4000') || cardDigits!.endsWith('0002')) return 'Thẻ bị từ chối. Vui lòng dùng thẻ khác.';
    if (cardDigits!.endsWith('0003')) return 'Hết thời gian chờ từ cổng thanh toán';
    return null;
  }
}
