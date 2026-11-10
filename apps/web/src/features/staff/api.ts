import { apiFetch } from '@/lib/apiClient';
import type { Order, OrderStatus } from '@/types';

export const staffOrdersKey = ['orders', 'all'] as const;

export const fetchAllOrders = () => apiFetch<Order[]>('/orders/all');

export const updateOrderStatus = (id: string, status: OrderStatus) =>
  apiFetch<Order>(`/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } });

export const confirmCash = (id: string) =>
  apiFetch<Order>(`/orders/${encodeURIComponent(id)}/confirm-cash`, { method: 'POST' });
