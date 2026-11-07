'use client';

import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { canOrder } from '../roles';
import { useAuthStore } from '../store';

/** Chặn trang đặt đơn với nhân viên, quản lý. Chỉ để ẩn giao diện; quyền thật do API kiểm tra. */
export function RequireCustomer({ children }: { children: ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  if (canOrder(role)) return <>{children}</>;

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <h2 className="font-display text-xl font-semibold">Tài khoản này không đặt đơn được</h2>
      <p className="mt-2 max-w-xs text-ink/70">Nhân viên và quản lý chỉ xem menu và xử lý đơn của khách.</p>
      <ButtonLink href="/staff" className="mt-6">
        Về màn hình quầy
      </ButtonLink>
    </div>
  );
}
