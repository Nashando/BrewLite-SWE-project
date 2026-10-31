/** Cùng món, cùng size, cùng bộ topping (không phụ thuộc thứ tự) thì gộp thành một dòng. */
export function buildLineId(
  productId: string,
  sizeId: string | null,
  toppingIds: string[],
): string {
  return [productId, sizeId ?? 'none', ...[...toppingIds].sort()].join('|');
}
