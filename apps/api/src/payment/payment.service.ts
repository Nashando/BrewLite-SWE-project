import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Payment, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuthUser } from '../common/auth-user';
import { releaseExpiredOrders, restockOrder } from '../common/order-expiry';
import { toPaymentView } from '../common/order-view';
import { PrismaService } from '../prisma/prisma.service';
import { PayDto } from './dto/pay.dto';

const FAILURE_REASON = 'Thanh toán thất bại, vui lòng thử lại.';

/** Thất bại trả 402 như sơ đồ tuần tự; `code` để frontend phân biệt với các lỗi khác. */
function paymentFailed(payment: Payment) {
  return new HttpException(
    { message: payment.failureReason ?? FAILURE_REASON, code: 'PAYMENT_FAILED', payment: toPaymentView(payment) },
    HttpStatus.PAYMENT_REQUIRED,
  );
}

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Thanh toán mô phỏng cho đơn PENDING_PAYMENT.
   * Idempotent theo (userId, Idempotency-Key): gửi lại cùng key trả lại kết quả cũ, không xử lý lần 2.
   *   - MOMO, VNPAY: kết quả lấy từ màn hình cổng giả lập. Thành công → đơn PAID.
   *     Thất bại → 402, huỷ đơn và trả kho; khách thử lại sẽ tạo đơn mới (theo sơ đồ tuần tự).
   *   - CASH: ghi giao dịch PENDING, đơn vẫn giữ hàng chờ nhân viên xác nhận đã thu tiền tại quầy.
   */
  async pay(user: AuthUser, idempotencyKey: string | undefined, dto: PayDto) {
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 100) {
      throw new BadRequestException('Thiếu hoặc sai header Idempotency-Key (8–100 ký tự, nên dùng UUID)');
    }

    const existing = await this.findByKey(user.id, idempotencyKey);
    if (existing) return this.replay(existing, dto);

    try {
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
      };

      const payment = await this.prisma.$transaction(async (tx) => {
        // Khách đã chọn trả tại quầy thì không thanh toán thêm bằng cách khác, tránh thu tiền hai lần
        const waitingCash = await tx.payment.findFirst({ where: { orderId: order.id, status: PaymentStatus.PENDING } });
        if (waitingCash) throw new ConflictException('Đơn hàng đang chờ thanh toán tại quầy');

        if (dto.method === PaymentMethod.CASH) {
          return tx.payment.create({ data: { ...base, status: PaymentStatus.PENDING } });
        }

        const failed = dto.simulate === 'FAILED';
        // "Giành" đơn: chỉ 1 request đổi được trạng thái khỏi PENDING_PAYMENT
        const claimed = await tx.order.updateMany({
          where: { id: order.id, status: OrderStatus.PENDING_PAYMENT },
          data: { status: failed ? OrderStatus.CANCELLED : OrderStatus.PAID },
        });
        if (claimed.count === 0) throw new ConflictException('Đơn hàng vừa được xử lý bởi yêu cầu khác');

        if (failed) await restockOrder(tx, order.id);
        return tx.payment.create({
          data: failed
            ? { ...base, status: PaymentStatus.FAILED, failureReason: FAILURE_REASON }
            : { ...base, status: PaymentStatus.SUCCESS },
        });
      });
      if (payment.status === PaymentStatus.FAILED) throw paymentFailed(payment);
      return toPaymentView(payment);
    } catch (e) {
      // Hai request cùng key chạy song song: request chậm hơn trả kết quả của request đã xong
      const lostRace = e instanceof ConflictException || (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002');
      if (lostRace) {
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
    if (payment.status === PaymentStatus.FAILED) throw paymentFailed(payment);
    return toPaymentView(payment);
  }
}
