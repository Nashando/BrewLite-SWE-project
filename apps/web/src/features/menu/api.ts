import { apiFetch } from '@/lib/apiClient';
import type { Product } from '@/types';

export const productKeys = {
  all: ['products'] as const,
};

export function fetchProducts() {
  return apiFetch<Product[]>('/products');
}
