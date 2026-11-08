'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '../store';

const linkClass = 'inline-flex min-h-[44px] items-center px-2 text-sm font-medium';

export function UserActions() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  if (!hydrated) return null;

  if (!token) {
    return (
      <Link href="/login" className={linkClass}>
        Đăng nhập
      </Link>
    );
  }

  return (
    <>
      <Link href="/orders" className={linkClass}>
        Đơn hàng
      </Link>
      <button
        type="button"
        className={linkClass}
        onClick={() => {
          logout();
          queryClient.clear(); // bỏ dữ liệu đơn hàng của người dùng cũ
        }}
      >
        Đăng xuất
      </button>
    </>
  );
}
