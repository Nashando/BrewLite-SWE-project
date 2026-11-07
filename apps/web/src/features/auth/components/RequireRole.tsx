'use client';

import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import type { Role } from '@/types';
import { useAuthStore } from '../store';
import { RequireAuth } from './RequireAuth';

/** Chỉ để ẩn giao diện; quyền thật do API kiểm tra. */
export function RequireRole({
  roles,
  next,
  children,
}: {
  roles: Role[];
  next: string;
  children: ReactNode;
}) {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <RequireAuth next={next}>
      {role && roles.includes(role) ? (
        children
      ) : (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <h2 className="font-display text-xl font-semibold">Bạn không có quyền xem trang này</h2>
          <p className="mt-2 max-w-xs text-ink/70">Đăng nhập bằng tài khoản được cấp quyền rồi thử lại.</p>
          <ButtonLink href="/menu" className="mt-6">
            Về menu
          </ButtonLink>
        </div>
      )}
    </RequireAuth>
  );
}
