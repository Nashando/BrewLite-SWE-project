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

/**
 * Dùng cho request lấy theo id: 404 là không có bản ghi,
 * 400 là id sai định dạng (API kiểm tra UUID), với người dùng đều là "không tìm thấy".
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 400);
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
