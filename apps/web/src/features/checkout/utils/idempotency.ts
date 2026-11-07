/**
 * Khóa định danh một yêu cầu thanh toán. Gửi lại cùng khóa (bấm đúp, retry sau lỗi mạng)
 * thì server trả kết quả cũ thay vì trừ tiền lần nữa.
 */
export function createIdempotencyKey(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // crypto.randomUUID chỉ có trên HTTPS/localhost
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
