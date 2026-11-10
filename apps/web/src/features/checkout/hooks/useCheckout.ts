import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { meKey } from '@/features/auth/api';
import { useCartStore } from '@/features/cart/store';
import { productKeys } from '@/features/menu/api';
import { fetchOrder, ordersKey } from '@/features/orders/api';
import { ApiError } from '@/lib/errors';
import type { Order, PaymentMethod } from '@/types';
import { createOrder, pay, type CardInput } from '../api';
import { createIdempotencyKey } from '../utils/idempotency';

/** Đơn đang giữ không còn thanh toán được (hết hạn giữ hàng hoặc đã hủy). */
export class OrderExpiredError extends Error {
  constructor() {
    super('Đơn hàng đã hết hạn giữ hàng hoặc đã bị hủy.');
    this.name = 'OrderExpiredError';
  }
}

interface CheckoutInput {
  method: PaymentMethod;
  /** true khi khách đã xác nhận trên màn hình cổng thanh toán mô phỏng. */
  confirmed?: boolean;
  card?: CardInput;
}

/** `gateway`: đơn đã tạo, cần hiện cổng thanh toán. `done`: chuyển sang trang đơn hàng được rồi. */
type CheckoutResult = { stage: 'gateway' } | { stage: 'done'; orderId: string };

/**
 * Tạo đơn và giữ hàng trước, rồi thanh toán (theo sơ đồ tuần tự).
 * - WALLET, CARD: dừng ở màn hình cổng thanh toán mô phỏng, khách xác nhận rồi mới gọi thanh toán.
 * - CASH: ghi nhận trả tại quầy, đơn chờ nhân viên xác nhận.
 * - Thanh toán thất bại (402): API đã hủy đơn và trả kho, nên lần thử sau tạo đơn mới.
 * - Lỗi mạng hoặc 5xx: giữ nguyên Idempotency-Key để gửi lại không bị trừ tiền hai lần.
 * - API trả 409: đọc trạng thái thật của đơn, vì 409 dùng chung cho đơn đã trả và đơn hết hạn.
 *   Đã trả thì coi như thành công (không tạo đơn mới để tránh thu tiền hai lần);
 *   đã hủy thì báo lỗi và lần thử sau mới tạo đơn mới, để khách biết trước khi trả tiền.
 * - Bấm nhiều lần khi đang xử lý chỉ chạy một luồng.
 */
export function useCheckout() {
  const items = useCartStore((s) => s.items);
  const client = useQueryClient();
  const [gatewayOrder, setGatewayOrder] = useState<Order | null>(null);
  const orderRef = useRef<Order | null>(null);
  const keyRef = useRef<string | null>(null);
  const inFlightRef = useRef<Promise<CheckoutResult> | null>(null);

  async function run({ method, confirmed, card }: CheckoutInput): Promise<CheckoutResult> {
    orderRef.current ??= await createOrder({
      items: items.map((item) => ({
        productId: item.productId,
        sizeId: item.sizeId,
        toppingIds: item.toppings.map((t) => t.id),
        quantity: item.quantity,
      })),
    });
    const order = orderRef.current;

    if (method !== 'CASH' && !confirmed) {
      setGatewayOrder(order);
      return { stage: 'gateway' };
    }

    const key = (keyRef.current ??= createIdempotencyKey());
    try {
      await pay({ orderId: order.id, method, card }, key);
      return { stage: 'done', orderId: order.id };
    } catch (error) {
      // Lỗi 4xx là kết quả đã rõ, lần thử sau là yêu cầu mới nên đổi khóa
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) keyRef.current = null;

      if (error instanceof ApiError && error.status === 402) {
        orderRef.current = null;
        setGatewayOrder(null);
      }
      if (error instanceof ApiError && error.status === 409) {
        const latest = await fetchOrder(order.id).catch(() => null);
        if (latest?.status === 'CANCELLED') {
          orderRef.current = null;
          setGatewayOrder(null);
          throw new OrderExpiredError();
        }
        if (latest && latest.status !== 'PENDING_PAYMENT') return { stage: 'done', orderId: order.id };
      }
      throw error;
    }
  }

  const mutation = useMutation({
    mutationFn: (input: CheckoutInput) => {
      inFlightRef.current ??= run(input).finally(() => {
        inFlightRef.current = null;
      });
      return inFlightRef.current;
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ordersKey });
      void client.invalidateQueries({ queryKey: productKeys.all }); // tồn kho có thể đã đổi
      void client.invalidateQueries({ queryKey: meKey }); // số dư ví có thể đã đổi
    },
  });

  return { ...mutation, gatewayOrder, closeGateway: () => setGatewayOrder(null) };
}
