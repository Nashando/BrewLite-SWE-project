import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { useCartStore } from '@/features/cart/store';
import { ApiError } from '@/lib/errors';
import type { PaymentMethod } from '@/types';
import { createOrder, pay, type CardInput } from '../api';
import { createIdempotencyKey } from '../utils/idempotency';

export class PaymentFailedError extends Error {
  constructor(reason?: string | null) {
    super(reason || 'Thanh toán bị từ chối.');
    this.name = 'PaymentFailedError';
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
