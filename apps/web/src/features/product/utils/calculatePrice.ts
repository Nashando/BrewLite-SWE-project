import type { ProductSize, Topping } from '@/types';

/** Đơn giá một phần = giá gốc + phụ thu size + tổng giá topping đã chọn. */
export function calculateUnitPrice(
  basePrice: number,
  size: Pick<ProductSize, 'extraPrice'> | null | undefined,
  toppings: Pick<Topping, 'price'>[],
): number {
  const toppingsTotal = toppings.reduce((sum, t) => sum + t.price, 0);
  return basePrice + (size?.extraPrice ?? 0) + toppingsTotal;
}
