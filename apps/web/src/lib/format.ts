const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/** 45000 -> "45.000 ₫" */
export function formatVND(amount: number): string {
  return vnd.format(amount);
}

const dateTime = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

/** ISO string -> "31/10/2026 10:30" */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
