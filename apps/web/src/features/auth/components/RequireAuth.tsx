'use client';

import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { useAuthStore } from '../store';

/** Chặn nội dung cần đăng nhập; `next` là trang sẽ quay lại sau khi đăng nhập. */
export function RequireAuth({ children, next }: { children: ReactNode; next: string }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  if (!hydrated) {
    return (
      <div role="status" className="py-16 text-center text-ink/70">
        Đang kiểm tra đăng nhập…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <h2 className="font-display text-xl font-semibold">Bạn cần đăng nhập</h2>
        <p className="mt-2 max-w-xs text-ink/70">Đăng nhập để đặt đơn và xem lịch sử đơn hàng.</p>
        <ButtonLink href={`/login?next=${encodeURIComponent(next)}`} className="mt-6">
          Đăng nhập
        </ButtonLink>
      </div>
    );
  }

  return <>{children}</>;
}
