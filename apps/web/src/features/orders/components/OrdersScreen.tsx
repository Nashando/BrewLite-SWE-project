'use client';

import Link from 'next/link';
import { BackHeader } from '@/components/layout/BackHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { getErrorMessage } from '@/lib/errors';
import { formatDateTime, formatVND } from '@/lib/format';
import { useOrders } from '../hooks/useOrders';
import { OrderStatusBadge } from './OrderStatusBadge';

function OrderList() {
  const { data, isPending, isError, error, refetch, isFetching } = useOrders();

  if (isPending) {
    return (
      <div role="status" aria-live="polite" className="divide-y divide-line">
        <span className="sr-only">Đang tải đơn hàng</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} aria-hidden="true" className="flex justify-between py-4 motion-safe:animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-pine/10" />
              <div className="h-3 w-32 rounded bg-pine/10" />
            </div>
            <div className="h-4 w-16 rounded bg-pine/10" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Không tải được đơn hàng"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <h2 className="font-display text-xl font-semibold">Chưa có đơn hàng nào</h2>
        <p className="mt-2 max-w-xs text-ink/70">Các đơn bạn đã đặt sẽ hiện ở đây.</p>
        <ButtonLink href="/menu" className="mt-6">
          Xem menu
        </ButtonLink>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {data.map((order) => (
        <li key={order.id}>
          <Link href={`/orders/${order.id}`} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold">{order.code}</p>
              <p className="text-sm text-ink/70">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display font-semibold tabular-nums">{formatVND(order.total)}</p>
              <div className="mt-1">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function OrdersScreen() {
  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Đơn hàng" backHref="/menu" backLabel="Menu" />
      <main className="flex-1 px-4">
        <RequireAuth next="/orders">
          <OrderList />
        </RequireAuth>
      </main>
    </div>
  );
}
