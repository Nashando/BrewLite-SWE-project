import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Trả lại tồn kho của đơn, khoá sản phẩm theo thứ tự id giống lúc tạo đơn để tránh deadlock. */
export async function restockOrder(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  for (const productId of [...quantities.keys()].sort()) {
    await tx.product.update({ where: { id: productId }, data: { stock: { increment: quantities.get(productId)! } } });
  }
}

/** Đơn bị huỷ khi đang chờ thu tiền mặt thì giao dịch đó không còn hiệu lực. */
export function voidPendingPayments(tx: Prisma.TransactionClient, orderId: string, failureReason: string) {
  return tx.payment.updateMany({
    where: { orderId, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.FAILED, failureReason },
  });
}

/**
 * Đơn PENDING_PAYMENT đang giữ hàng. Nếu khách bỏ dở hoặc không ra quầy trả tiền, tự huỷ đơn quá hạn và trả lại tồn kho.
 * Gọi "lười" mỗi khi có đơn/thanh toán mới hoặc khi xem đơn nên không cần cron job.
 */
export async function releaseExpiredOrders(prisma: PrismaService, ttlMinutes?: number) {
  const ttl = ttlMinutes ?? (Number(process.env.ORDER_PAYMENT_TTL_MINUTES) || 15);
  const cutoff = new Date(Date.now() - ttl * 60_000);
  const stale = await prisma.order.findMany({
    where: { status: OrderStatus.PENDING_PAYMENT, createdAt: { lt: cutoff } },
    select: { id: true },
  });
  for (const { id } of stale) {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id, status: OrderStatus.PENDING_PAYMENT },
        data: { status: OrderStatus.CANCELLED },
      });
      if (claimed.count === 0) return;
      await restockOrder(tx, id);
      await voidPendingPayments(tx, id, 'Đơn đã hết hạn giữ hàng');
    });
  }
}
