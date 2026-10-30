import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuthUser } from '../common/auth-user';
import { calcUnitPrice } from '../common/pricing';
import { PaymentDeclinedError, PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prisma: PrismaService, private readonly payment: PaymentService) {}

  /**
   * Đặt hàng + thanh toán trong MỘT transaction (đặc tả UC-CHECKOUT):
   * kiểm tra giỏ → kiểm tra & trừ tồn kho → thanh toán mô phỏng → tạo Order/OrderItem/Payment → xoá giỏ.
   * Thanh toán thất bại ⇒ rollback toàn bộ: không có đơn, tồn kho giữ nguyên.
   * Idempotent theo header Idempotency-Key: gửi lại cùng key trả lại đúng đơn cũ, không trừ tiền lần 2.
   */
  async checkout(user: AuthUser, idempotencyKey: string | undefined, dto: CheckoutDto) {
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 100) {
      throw new BadRequestException('Thiếu hoặc sai header Idempotency-Key (8–100 ký tự, nên dùng UUID)');
    }

    const existing = await this.payment.findByKey(user.id, idempotencyKey);
    if (existing) return this.loadOrder(existing.orderId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({
          where: { userId: user.id },
          include: { items: { include: { product: true, size: true, toppings: true }, orderBy: { id: 'asc' } } },
        });
        if (!cart || cart.items.length === 0) throw new BadRequestException('Giỏ hàng trống');

        let total = 0;
        const shortages: string[] = [];
        const items: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

        for (const item of cart.items) {
          if (!item.product.isActive) throw new BadRequestException(`"${item.product.name}" hiện không còn bán`);

          // updateMany có điều kiện stock >= qty → an toàn khi nhiều người đặt cùng lúc
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            shortages.push(item.product.name);
            continue;
          }

          const unitPrice = calcUnitPrice(item.product.basePrice, item.size?.extraPrice ?? 0, item.toppings.map((t) => t.price));
          total += unitPrice * item.quantity;
          items.push({
            productId: item.productId,
            productName: item.product.name,
            sizeName: item.size?.name ?? null,
            toppings: item.toppings.map((t) => ({ name: t.name, price: t.price })),
            unitPrice,
            quantity: item.quantity,
          });
        }
        if (shortages.length > 0) {
          throw new ConflictException({
            message: `Sản phẩm ${shortages.map((n) => `"${n}"`).join(', ')} không đủ số lượng tồn kho.`,
            outOfStock: shortages,
          });
        }

        const failure = await this.payment.charge(tx, user.id, dto, total);
        if (failure) throw new PaymentDeclinedError(failure);

        const order = await tx.order.create({
          data: {
            code: `BL-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`,
            userId: user.id,
            totalAmount: total,
            note: dto.note,
            items: { create: items },
            payment: {
              create: {
                userId: user.id,
                method: dto.method,
                status: PaymentStatus.SUCCESS,
                amount: total,
                idempotencyKey,
                transactionRef: this.payment.newTransactionRef(),
                cardLast4: dto.cardNumber ? dto.cardNumber.slice(-4) : null,
              },
            },
          },
          include: { items: true, payment: true },
        });

        // Chặn 2 request song song cùng xoá 1 giỏ: chỉ request đầu xoá được đủ dòng
        const removed = await tx.cartItem.deleteMany({
          where: { cartId: cart.id, id: { in: cart.items.map((i) => i.id) } },
        });
        if (removed.count !== cart.items.length) throw new ConflictException('Giỏ hàng vừa thay đổi, vui lòng thử lại');

        return order;
      });
    } catch (e) {
      if (e instanceof PaymentDeclinedError) {
        this.logger.warn(`Thanh toán thất bại user=${user.id} method=${dto.method}: ${e.message}`);
        throw new HttpException({ message: `Thanh toán thất bại: ${e.message}` }, HttpStatus.PAYMENT_REQUIRED);
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // Hai request cùng Idempotency-Key chạy song song: request sau nhận lại đơn của request trước
        const again = await this.payment.findByKey(user.id, idempotencyKey);
        if (again) return this.loadOrder(again.orderId);
      }
      throw e;
    }
  }

  private loadOrder(id: number) {
    return this.prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true, payment: true } });
  }
}
