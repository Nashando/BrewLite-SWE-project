export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** Chuyển lỗi bất kỳ thành thông báo hiển thị cho người dùng. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.';
    if (error.status >= 500) return 'Máy chủ đang gặp sự cố. Thử lại sau ít phút.';
    return error.message;
  }
  return 'Đã có lỗi xảy ra. Thử lại sau.';
}
