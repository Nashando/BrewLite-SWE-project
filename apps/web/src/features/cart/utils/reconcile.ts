import { calculateUnitPrice } from '@/features/product/utils/calculatePrice';
import type { ProductDetail } from '@/types';
import type { CartItem } from '../types';

export type ReconcileResult =
  | { kind: 'ok' }
  | { kind: 'remove' }
  | { kind: 'price'; unitPrice: number };

/** So một dòng trong giỏ với dữ liệu mới nhất của món: size, topping còn hợp lệ không, giá có đổi không. */
export function reconcileLine(item: CartItem, product: ProductDetail): ReconcileResult {
  const size = product.sizes.find((s) => s.id === item.sizeId) ?? null;
  const sizeValid = item.sizeId === null ? product.sizes.length === 0 : size !== null;
  if (!sizeValid) return { kind: 'remove' };

  const toppings = item.toppings.map((t) => product.toppings.find((p) => p.id === t.id));
  if (toppings.some((t) => !t)) return { kind: 'remove' };

  const unitPrice = calculateUnitPrice(product.basePrice, size, toppings.flatMap((t) => (t ? [t] : [])));
  return unitPrice === item.unitPrice ? { kind: 'ok' } : { kind: 'price', unitPrice };
}
