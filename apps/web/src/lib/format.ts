const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/** 45000 -> "45.000 ₫" */
export function formatVND(amount: number): string {
  return vnd.format(amount);
}
