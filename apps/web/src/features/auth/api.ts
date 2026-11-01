import { apiFetch } from '@/lib/apiClient';
import type { AuthSession } from '@/types';

export function login(body: { email: string; password: string }) {
  return apiFetch<AuthSession>('/auth/login', { method: 'POST', body });
}

export function register(body: { name: string; email: string; password: string }) {
  return apiFetch<AuthSession>('/auth/register', { method: 'POST', body });
}
