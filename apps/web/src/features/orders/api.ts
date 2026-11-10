import { apiFetch } from '@/lib/apiClient';
import type { Order } from '@/types';

export const ordersKey = ['orders'] as const;
export const orderKey = (id: string) => ['orders', id] as const;

export const fetchOrders = () => apiFetch<Order[]>('/orders');
export const fetchOrder = (id: string) => apiFetch<Order>(`/orders/${encodeURIComponent(id)}`);
export const cancelOrder = (id: string) =>
  apiFetch<Order>(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
