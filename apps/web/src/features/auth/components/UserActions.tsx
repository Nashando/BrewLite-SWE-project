'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useCartStore } from '@/features/cart/store';
import { useAuthStore } from '../store';

const linkClass = 'inline-flex min-h-[44px] items-center whitespace-nowrap px-1.5 text-sm font-medium';

export function UserActions() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clear);
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
      {(role === 'STAFF' || role === 'MANAGER') && (
        <Link href="/staff" className={linkClass}>
          Quầy
        </Link>
      )}
      {role === 'MANAGER' && (
        <Link href="/admin/products" className={linkClass}>
          Quản lý
        </Link>
      )}
      <Link href="/orders" className={linkClass}>
        Đơn hàng
      </Link>
      <button
        type="button"
        className={linkClass}
        onClick={() => {
          logout();
          clearCart(); // người sau dùng chung máy không thấy giỏ của người trước
          queryClient.clear(); // bỏ dữ liệu đơn hàng của người dùng cũ
        }}
      >
        Đăng xuất
      </button>
    </>
  );
}
