import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Đơn PENDING_PAYMENT đang giữ hàng. Nếu khách bỏ dở, tự huỷ đơn quá hạn và trả lại tồn kho.
 * Gọi "lười" mỗi khi có đơn/thanh toán mới nên không cần cron job.
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
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    });
  }
}
