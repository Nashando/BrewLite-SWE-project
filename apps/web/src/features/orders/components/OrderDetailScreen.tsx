'use client';

import { BackHeader } from '@/components/layout/BackHeader';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { getErrorMessage, isNotFoundError } from '@/lib/errors';
import { formatDateTime, formatVND } from '@/lib/format';
import type { OrderStatus } from '@/types';
import { useOrder } from '../hooks/useOrders';
import { CancelOrderButton } from './CancelOrderButton';
import {
  canCancel,
  isWaitingCash,
  ORDER_STATUS,
  OrderStatusBadge,
  PAYMENT_METHOD_LABEL,
} from './OrderStatusBadge';

const STEPS: OrderStatus[] = ['PAID', 'PREPARING', 'READY', 'COMPLETED'];

function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = STEPS.indexOf(status);
  if (current === -1) return null; // chờ thanh toán hoặc đã hủy: không có tiến trình

  return (
    <ol className="mt-6 space-y-3">
      {STEPS.map((step, index) => (
        <li
          key={step}
          aria-current={index === current ? 'step' : undefined}
          className={`flex items-center gap-3 ${
            index === current ? 'font-semibold text-pine' : index < current ? 'text-ink' : 'text-ink/50'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-3 w-3 rounded-full ${index <= current ? 'bg-pine' : 'border border-line'}`}
          />
          {ORDER_STATUS[step].label}
        </li>
      ))}
    </ol>
  );
}

function OrderDetail({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch, isFetching } = useOrder(id);

  if (isPending) {
    return (
      <div role="status" aria-live="polite" className="pt-5">
        <span className="sr-only">Đang tải đơn hàng</span>
        <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
          <div className="h-8 w-1/2 rounded bg-pine/10" />
          <div className="h-5 w-1/3 rounded bg-pine/10" />
          <div className="h-24 rounded-xl bg-pine/10" />
        </div>
      </div>
    );
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <h2 className="font-display text-xl font-semibold">Không tìm thấy đơn</h2>
          <p className="mt-2 max-w-xs text-ink/70">Đơn này không tồn tại hoặc không phải của bạn.</p>
          <ButtonLink href="/orders" className="mt-6">
            Về danh sách đơn
          </ButtonLink>
        </div>
      );
    }
    return (
      <ErrorState
        title="Không tải được đơn hàng"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  // Giao dịch mới nhất còn hiệu lực; lần thử thất bại không cần hiện cho khách.
  const payment = data.payments?.find((p) => p.status !== 'FAILED');

  return (
    <>
      <h1 className="mt-5 font-display text-3xl font-bold">Đơn {data.code}</h1>
      <div className="mt-2 flex items-center gap-3">
        <OrderStatusBadge status={data.status} />
        <span className="text-sm text-ink/70">{formatDateTime(data.createdAt)}</span>
      </div>
      <p className="mt-3 text-ink/80">
        {isWaitingCash(data)
          ? 'Mời bạn ra quầy trả tiền mặt trong 15 phút, quá hạn đơn sẽ tự hủy.'
          : ORDER_STATUS[data.status].hint}
      </p>
      {payment && (
        <p className="mt-1 text-sm text-ink/70">
          Thanh toán: {PAYMENT_METHOD_LABEL[payment.method]}
          {payment.status === 'REFUNDED' && ' (đã hoàn tiền)'}
        </p>
      )}

      <OrderTimeline status={data.status} />
      <Button variant="secondary" className="mt-6" onClick={() => void refetch()} disabled={isFetching}>
        {isFetching ? 'Đang cập nhật…' : 'Làm mới'}
      </Button>
      {canCancel(data.status) && (
        <div className="mt-3">
          <CancelOrderButton orderId={data.id} />
        </div>
      )}

      <section aria-label="Món đã đặt" className="mt-8">
        <ul className="divide-y divide-line">
          {data.items.map((item, index) => {
            const options = [item.sizeName, ...item.toppings].filter(Boolean).join(', ');
            return (
              <li key={index} className="flex justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {item.quantity} × {item.productName}
                  </p>
                  {options && <p className="text-sm text-ink/70">{options}</p>}
                </div>
                <p className="shrink-0 tabular-nums">{formatVND(item.unitPrice * item.quantity)}</p>
              </li>
            );
          })}
        </ul>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-ink/70">Tổng cộng</span>
          <span className="font-display text-2xl font-bold tabular-nums">{formatVND(data.total)}</span>
        </div>
      </section>
    </>
  );
}

export function OrderDetailScreen({ id }: { id: string }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader backHref="/orders" backLabel="Đơn của tôi" />
      <main className="page flex-1 px-4 pb-8">
        <RequireAuth next={`/orders/${id}`}>
          <OrderDetail id={id} />
        </RequireAuth>
      </main>
    </div>
  );
}
