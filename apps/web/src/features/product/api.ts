import { apiFetch } from '@/lib/apiClient';
import type { ProductDetail } from '@/types';

// Bắt đầu bằng 'products' nên invalidate ['products'] sẽ làm mới cả danh sách lẫn chi tiết.
export const productDetailKey = (id: string) => ['products', 'detail', id] as const;

export function fetchProduct(id: string) {
  return apiFetch<ProductDetail>(`/products/${encodeURIComponent(id)}`);
}
