import { Injectable } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

/** Ném ra khi cổng mô phỏng từ chối → làm rollback toàn bộ transaction đặt hàng. */
export class PaymentDeclinedError extends Error {}

/**
 * Cổng thanh toán mô phỏng (ADR 004).
 *  - WALLET: trừ số dư ví; không đủ → từ chối.
 *  - CARD: số thẻ kết thúc 0002 → từ chối; kết thúc 0003 → mô phỏng timeout; còn lại thành công.
 */
@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tìm giao dịch đã xử lý theo (user, Idempotency-Key). */
  findByKey(userId: number, idempotencyKey: string) {
    return this.prisma.payment.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } } });
  }

  newTransactionRef(): string {
    return `TXN-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
  }

  /** Trả về lý do thất bại, hoặc null nếu thành công. Chạy trong transaction của đơn hàng. */
  async charge(
    tx: Prisma.TransactionClient,
    userId: number,
    input: { method: PaymentMethod; cardNumber?: string },
    amount: number,
  ): Promise<string | null> {
    if (input.method === PaymentMethod.WALLET) {
      const res = await tx.user.updateMany({
        where: { id: userId, walletBalance: { gte: amount } },
        data: { walletBalance: { decrement: amount } },
      });
      return res.count === 0 ? 'Số dư ví không đủ' : null;
    }
    if (input.cardNumber!.endsWith('0002')) return 'Thẻ bị từ chối';
    if (input.cardNumber!.endsWith('0003')) return 'Hết thời gian chờ từ cổng thanh toán';
    return null;
  }
}
