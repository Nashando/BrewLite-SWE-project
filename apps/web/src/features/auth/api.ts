import { apiFetch } from '@/lib/apiClient';
import type { AuthSession, AuthUser } from '@/types';

export const meKey = ['me'] as const;

/** Tài khoản đang đăng nhập, kèm số dư ví mô phỏng. */
export function fetchMe() {
  return apiFetch<AuthUser & { walletBalance: number }>('/auth/me');
}

export function login(body: { email: string; password: string }) {
  return apiFetch<AuthSession>('/auth/login', { method: 'POST', body });
}

export function register(body: { name: string; email: string; password: string }) {
  return apiFetch<AuthSession>('/auth/register', { method: 'POST', body });
}
