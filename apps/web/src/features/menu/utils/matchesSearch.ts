import type { Product } from '@/types';

/** Bỏ dấu tiếng Việt để gõ "tra dao" vẫn tìm thấy "Trà đào". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
}

export function matchesSearch(product: Pick<Product, 'name' | 'description'>, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return normalize(`${product.name} ${product.description}`).includes(q);
}
