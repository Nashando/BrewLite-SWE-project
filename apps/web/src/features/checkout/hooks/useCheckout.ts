import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { useCartStore } from '@/features/cart/store';
import { ApiError } from '@/lib/errors';
import { fetchOrder } from '@/features/orders/api';
import type { PaymentMethod } from '@/types';
import { createOrder, pay, type CardInput } from '../api';
import { createIdempotencyKey } from '../utils/idempotency';

export class PaymentFailedError extends Error {
  constructor(reason?: string | null) {
    super(reason || 'Thanh toán bị từ chối.');
    this.name = 'PaymentFailedError';
  }
}

/** Đơn đang giữ không còn thanh toán được (hết hạn giữ hàng hoặc đã hủy). */
export class OrderExpiredError extends Error {
  constructor() {
    super('Đơn hàng đã hết hạn giữ hàng hoặc đã bị hủy.');
    this.name = 'OrderExpiredError';
  }
}

interface CheckoutInput {
  method: PaymentMethod;
  card?: CardInput;
}

/**
 * Tạo đơn rồi thanh toán.
 * - Đơn chỉ được tạo một lần, thử thanh toán lại dùng lại đơn cũ.
 * - Lỗi mạng hoặc 5xx: giữ nguyên Idempotency-Key để gửi lại không bị trừ tiền hai lần.
 * - Bị từ chối hoặc lỗi 4xx: lần thử sau là yêu cầu mới nên đổi khóa.
 * - API trả 409: đọc trạng thái thật của đơn, vì 409 dùng chung cho đơn đã trả và đơn hết hạn.
 *   Đã trả thì coi như thành công (không tạo đơn mới để tránh thu tiền hai lần);
 *   đã hủy thì báo lỗi và lần thử sau mới tạo đơn mới, để khách biết trước khi trả tiền.
 * - Bấm nhiều lần khi đang xử lý chỉ chạy một luồng.
 */
export function useCheckout() {
  const items = useCartStore((s) => s.items);
  const orderIdRef = useRef<string | null>(null);
  const keyRef = useRef<string | null>(null);
  const inFlightRef = useRef<Promise<{ orderId: string }> | null>(null);

  async function run(input: CheckoutInput) {
    if (!orderIdRef.current) {
      const order = await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          sizeId: item.sizeId,
          toppingIds: item.toppings.map((t) => t.id),
          quantity: item.quantity,
        })),
      });
      orderIdRef.current = order.id;
    }
    const orderId = orderIdRef.current;
    const key = (keyRef.current ??= createIdempotencyKey());

    try {
      const payment = await pay({ orderId, ...input }, key);
      if (payment.status === 'FAILED') throw new PaymentFailedError(payment.failureReason);
      return { orderId };
    } catch (error) {
      const definitive =
        error instanceof PaymentFailedError ||
        (error instanceof ApiError && error.status >= 400 && error.status < 500);
      if (definitive) keyRef.current = null;

      if (error instanceof ApiError && error.status === 409) {
        const order = await fetchOrder(orderId).catch(() => null);
        if (order?.status === 'CANCELLED') {
          orderIdRef.current = null;
          throw new OrderExpiredError();
        }
        if (order && order.status !== 'PENDING_PAYMENT') return { orderId };
      }
      throw error;
    }
  }

  return useMutation({
    mutationFn: (input: CheckoutInput) => {
      inFlightRef.current ??= run(input).finally(() => {
        inFlightRef.current = null;
      });
      return inFlightRef.current;
    },
  });
}
