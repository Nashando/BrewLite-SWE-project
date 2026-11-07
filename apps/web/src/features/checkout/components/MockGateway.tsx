'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { fetchMe, meKey } from '@/features/auth/api';
import { PAYMENT_METHOD_LABEL } from '@/features/orders/components/OrderStatusBadge';
import { formatVND } from '@/lib/format';
import type { Order, PaymentMethod } from '@/types';
import type { CardInput } from '../api';
import { cardSchema, type CardValues } from '../schemas';
import { CardFields } from './CardFields';

interface MockGatewayProps {
  order: Order;
  method: PaymentMethod;
  pending: boolean;
  onConfirm: (card?: CardInput) => void;
  onBack: () => void;
}

function WalletBalance({ total }: { total: number }) {
  const { data } = useQuery({ queryKey: meKey, queryFn: fetchMe });
  if (!data) return null;
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-ink/70">Số dư ví</dt>
        <dd className="font-medium tabular-nums">{formatVND(data.walletBalance)}</dd>
      </div>
      {data.walletBalance < total && (
        <div className="text-danger">
          <dt className="sr-only">Cảnh báo</dt>
          <dd>Số dư không đủ, thanh toán sẽ thất bại.</dd>
        </div>
      )}
    </>
  );
}

/** Màn hình thay cho cổng thanh toán thật, không kết nối ngân hàng và không trừ tiền thật. */
export function MockGateway({ order, method, pending, onConfirm, onBack }: MockGatewayProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardValues>({ resolver: zodResolver(cardSchema) });

  const submit = handleSubmit(({ number, expiry, cvv }) =>
    onConfirm({ number: number.replace(/\s/g, ''), expiry, cvv }),
  );

  return (
    <section aria-label="Cổng thanh toán mô phỏng" className="mt-6 rounded-xl border border-line bg-white p-5">
      <p className="text-sm font-medium text-ink/70">Cổng thanh toán mô phỏng</p>
      <h2 className="mt-1 font-display text-2xl font-bold">{PAYMENT_METHOD_LABEL[method]}</h2>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink/70">Mã đơn</dt>
          <dd className="font-medium">{order.code}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ink/70">Số tiền</dt>
          <dd className="font-display text-xl font-bold tabular-nums">{formatVND(order.total)}</dd>
        </div>
        {method === 'WALLET' && <WalletBalance total={order.total} />}
      </dl>

      <form
        noValidate
        onSubmit={(event) => {
          if (method === 'CARD') return submit(event);
          event.preventDefault();
          onConfirm();
        }}
      >
        {method === 'CARD' && <CardFields register={register} errors={errors} />}
        <p className="mt-4 text-sm text-ink/70">
          Đây là màn hình mô phỏng, không trừ tiền thật.
          {method === 'CARD' && ' Thẻ bắt đầu bằng 4000 sẽ bị từ chối.'}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Đang xử lý…' : 'Xác nhận thanh toán'}
          </Button>
          <Button variant="secondary" disabled={pending} onClick={onBack}>
            Chọn phương thức khác
          </Button>
        </div>
      </form>
    </section>
  );
}
