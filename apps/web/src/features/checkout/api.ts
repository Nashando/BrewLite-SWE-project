import { apiFetch } from '@/lib/apiClient';
import type { Order, Payment, PaymentMethod } from '@/types';

export interface CreateOrderInput {
  items: { productId: string; sizeId: string | null; toppingIds: string[]; quantity: number }[];
}

export interface CardInput {
  number: string;
  expiry: string;
  cvv: string;
}

export interface PayInput {
  orderId: string;
  method: PaymentMethod;
  card?: CardInput;
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
