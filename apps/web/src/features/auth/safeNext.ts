/** Chỉ cho phép chuyển hướng tới đường dẫn nội bộ, tránh open redirect (ví dụ //evil.com). */
export function safeNext(next?: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/menu';
}
