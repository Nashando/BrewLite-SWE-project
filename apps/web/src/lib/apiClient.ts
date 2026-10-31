import { API_URL } from './env';
import { ApiError } from './errors';

type TokenGetter = () => string | null;
let getToken: TokenGetter = () => null;

/** Store đăng nhập (Task 5.1) gọi hàm này để apiClient tự gắn JWT vào mọi request. */
export function setTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(
  path: string,
  { body, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Network error', 0, 'NETWORK_ERROR');
  }

  if (!res.ok) {
    // NestJS trả về { statusCode, message, error }; message có thể là mảng khi validate DTO lỗi.
    const payload = (await res.json().catch(() => null)) as {
      message?: string | string[];
      code?: string;
    } | null;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : (payload?.message ?? (res.statusText || 'Request failed'));
    throw new ApiError(message, res.status, payload?.code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
