import { ApiError } from './errors';

/** Không retry lỗi 4xx (không tìm thấy, dữ liệu sai); lỗi mạng và 5xx thử lại một lần. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}
