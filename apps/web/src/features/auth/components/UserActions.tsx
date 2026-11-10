'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useCartStore } from '@/features/cart/store';
import { canOrder } from '../roles';
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
      <Link href="/login" className={`order-1 ${linkClass}`}>
        Đăng nhập
      </Link>
    );
  }

  // Trên điện thoại các link xuống dòng riêng để giỏ hàng luôn cạnh logo; màn hình rộng thì cùng một dòng
  return (
    <nav aria-label="Tài khoản" className="order-3 -ml-1.5 flex w-full flex-wrap items-center sm:order-2 sm:ml-0 sm:w-auto">
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
      {canOrder(role) && (
        <Link href="/orders" className={linkClass}>
          Đơn của tôi
        </Link>
      )}
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
    </nav>
  );
}
