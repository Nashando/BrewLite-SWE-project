import { apiFetch } from '@/lib/apiClient';
import type { Order, Payment, PaymentMethod } from '@/types';

export interface CreateOrderInput {
  items: { productId: string; sizeId: string | null; toppingIds: string[]; quantity: number }[];
}

/** Kết quả khách chọn trên màn hình cổng giả lập. */
export type SimulatedResult = 'SUCCESS' | 'FAILED';

export interface PayInput {
  orderId: string;
  method: PaymentMethod;
  /** Bắt buộc với MOMO, VNPAY; CASH thu tại quầy nên không có. */
  simulate?: SimulatedResult;
}

export function createOrder(input: CreateOrderInput) {
  return apiFetch<Order>('/orders', { method: 'POST', body: input });
}

export function pay(input: PayInput, idempotencyKey: string) {
  return apiFetch<Payment>('/payments', {
    method: 'POST',
    body: input,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}
