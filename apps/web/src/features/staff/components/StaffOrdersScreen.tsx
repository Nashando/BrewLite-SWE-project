'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { BackHeader } from '@/components/layout/BackHeader';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { RequireRole } from '@/features/auth/components/RequireRole';
import { productKeys } from '@/features/menu/api';
import { CancelOrderButton } from '@/features/orders/components/CancelOrderButton';
import {
  canCancel,
  isWaitingCash,
  OrderStatusBadge,
  PAYMENT_METHOD_LABEL,
} from '@/features/orders/components/OrderStatusBadge';
import { getErrorMessage } from '@/lib/errors';
import { formatDateTime, formatVND } from '@/lib/format';
import type { Order, OrderStatus } from '@/types';
import { confirmCash, fetchAllOrders, staffOrdersKey, updateOrderStatus } from '../api';

/** Bước tiếp theo khớp thứ tự API cho phép. */
const NEXT_STEP: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  PAID: { status: 'PREPARING', label: 'Bắt đầu pha chế' },
  PREPARING: { status: 'READY', label: 'Pha chế xong' },
  READY: { status: 'COMPLETED', label: 'Đã giao khách' },
};

/** Tự làm mới để quầy thấy đơn mới mà không cần bấm. */
const REFRESH_MS = 15_000;

/** Đơn quầy cần làm. Đơn chờ thanh toán online chưa cần xử lý, khách còn ở cổng thanh toán. */
const needsAction = (order: Order) => isWaitingCash(order) || order.status in NEXT_STEP;

function OrderCard({ order }: { order: Order }) {
  const client = useQueryClient();
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ['orders'] });
    void client.invalidateQueries({ queryKey: productKeys.all });
  };
  const step = NEXT_STEP[order.status];
  const waitingCash = isWaitingCash(order);

  const action = useMutation({
    mutationFn: () => (waitingCash ? confirmCash(order.id) : updateOrderStatus(order.id, step!.status)),
    // Thành công hay lỗi đều tải lại: lỗi thường do nhân viên khác vừa cập nhật đơn này
    onSettled: refresh,
  });
  const payment = order.payments?.find((p) => p.status !== 'FAILED');

  return (
    <li className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold">{order.code}</p>
          <p className="text-sm text-ink/70">
            {order.customer?.name} · {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-2 text-sm">
        {order.items.map((item, index) => (
          <li key={index}>
            {item.quantity} × {item.productName}
            {item.sizeName && ` (${item.sizeName})`}
            {item.toppings.length > 0 && `, ${item.toppings.join(', ')}`}
          </li>
        ))}
      </ul>

      <p className="mt-2 text-sm">
        <span className="font-semibold tabular-nums">{formatVND(order.total)}</span>
        {payment && <span className="text-ink/70"> · {PAYMENT_METHOD_LABEL[payment.method]}</span>}
      </p>

      <div className="mt-3 flex flex-wrap items-start gap-2">
        {(waitingCash || step) && (
          <Button disabled={action.isPending} onClick={() => action.mutate()}>
            {action.isPending ? 'Đang cập nhật…' : waitingCash ? 'Đã thu tiền mặt' : step!.label}
          </Button>
        )}
        {canCancel(order.status) && <CancelOrderButton orderId={order.id} />}
      </div>
      {action.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {getErrorMessage(action.error)}
        </p>
      )}
    </li>
  );
}

function OrderBoard() {
  const [showAll, setShowAll] = useState(false);
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: staffOrdersKey,
    queryFn: fetchAllOrders,
    refetchInterval: REFRESH_MS,
  });

  if (isPending) {
    return (
      <p role="status" className="py-16 text-center text-ink/70">
        Đang tải đơn hàng…
      </p>
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

  const orders = showAll ? data : data.filter(needsAction);

  return (
    <>
      <div role="group" aria-label="Lọc đơn" className="flex flex-wrap gap-2 pt-4">
        <Button variant={showAll ? 'secondary' : 'primary'} aria-pressed={!showAll} onClick={() => setShowAll(false)}>
          Cần xử lý
        </Button>
        <Button variant={showAll ? 'primary' : 'secondary'} aria-pressed={showAll} onClick={() => setShowAll(true)}>
          Tất cả
        </Button>
        <Button variant="secondary" disabled={isFetching} onClick={() => void refetch()}>
          {isFetching ? 'Đang cập nhật…' : 'Làm mới'}
        </Button>
      </div>
      {orders.length === 0 ? (
        <p role="status" className="py-16 text-center text-ink/70">
          {showAll ? 'Chưa có đơn nào.' : 'Không có đơn cần xử lý.'}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </>
  );
}

export function StaffOrdersScreen() {
  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Quầy" backHref="/menu" backLabel="Menu" />
      <main className="flex-1 px-4 pb-8">
        <RequireRole roles={['STAFF', 'MANAGER']} next="/staff">
          <OrderBoard />
        </RequireRole>
      </main>
    </div>
  );
}
