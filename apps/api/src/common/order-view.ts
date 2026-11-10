import { Order, OrderItem, Payment } from '@prisma/client';

/** Dạng response của giao dịch, khớp type Payment của frontend. */
export function toPaymentView(p: Payment) {
  return {
    id: p.id,
    orderId: p.orderId,
    method: p.method,
    status: p.status,
    failureReason: p.failureReason,
    transactionRef: p.transactionRef,
    createdAt: p.createdAt,
  };
}

type OrderWithRelations = Order & {
  items: OrderItem[];
  payments?: Payment[];
  user?: { name: string; email: string };
};

/** Dạng response của đơn hàng, khớp type Order của frontend (total, toppings là mảng tên). */
export function toOrderView(order: OrderWithRelations) {
  return {
    id: order.id,
    code: order.code,
    status: order.status,
    total: order.totalAmount,
    note: order.note,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
      productName: i.productName,
      sizeName: i.sizeName,
      toppings: Array.isArray(i.toppings) ? (i.toppings as unknown as { name: string }[]).map((t) => t.name) : [],
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    payments: (order.payments ?? []).map(toPaymentView),
    // Chỉ có ở màn hình nhân viên, để quầy biết đơn của ai
    ...(order.user ? { customer: { name: order.user.name, email: order.user.email } } : {}),
  };
}
