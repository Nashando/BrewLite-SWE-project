/** Đơn giá 1 ly = giá gốc + phụ thu size + tổng giá topping. */
export function calcUnitPrice(basePrice: number, sizeExtra: number, toppingPrices: number[]): number {
  return basePrice + sizeExtra + toppingPrices.reduce((sum, p) => sum + p, 0);
}
