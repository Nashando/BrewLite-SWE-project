import { apiFetch } from '@/lib/apiClient';
import type { AdminProduct, AdminTopping, RevenueReport } from '@/types';

export const adminProductsKey = ['admin', 'products'] as const;
export const adminToppingsKey = ['admin', 'toppings'] as const;
export const revenueKey = (days: number) => ['admin', 'revenue', days] as const;

export interface ProductInput {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  sizes: { id?: string; name: string; extraPrice: number }[];
}

export const fetchAdminProducts = () => apiFetch<AdminProduct[]>('/admin/products');

export const createProduct = (input: ProductInput & { stock: number }) =>
  apiFetch<AdminProduct>('/admin/products', { method: 'POST', body: input });

export const updateProduct = (id: string, input: Partial<ProductInput>) =>
  apiFetch<AdminProduct>(`/admin/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });

export const adjustStock = (id: string, delta: number) =>
  apiFetch<AdminProduct>(`/admin/products/${encodeURIComponent(id)}/stock`, {
    method: 'POST',
    body: { delta },
  });

export interface ToppingInput {
  name: string;
  price: number;
  isActive: boolean;
}

export const fetchAdminToppings = () => apiFetch<AdminTopping[]>('/admin/toppings');

export const createTopping = (input: ToppingInput) =>
  apiFetch<AdminTopping>('/admin/toppings', { method: 'POST', body: input });

export const updateTopping = (id: string, input: Partial<ToppingInput>) =>
  apiFetch<AdminTopping>(`/admin/toppings/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });

export const fetchRevenue = (days: number) =>
  apiFetch<RevenueReport>(`/admin/reports/revenue?days=${days}`);
