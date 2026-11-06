'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { BackHeader } from '@/components/layout/BackHeader';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { useCartStore } from '@/features/cart/store';
import { calculateLineTotal, calculateTotal } from '@/features/cart/utils/calculateTotal';
import { ApiError, getErrorMessage } from '@/lib/errors';
import { formatVND } from '@/lib/format';
import type { PaymentMethod } from '@/types';
import { OrderExpiredError, PaymentFailedError, useCheckout } from '../hooks/useCheckout';
import { cardSchema, type CardValues } from '../schemas';
import { CardFields } from './CardFields';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'WALLET', label: 'Ví BrewLite' },
  { value: 'CARD', label: 'Thẻ ngân hàng' },
];

function CheckoutError({ error }: { error: unknown }) {
  const box = 'mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm';

  if (error instanceof PaymentFailedError) {
    return (
      <div role="alert" className={box}>
        <p className="font-semibold text-danger">Thanh toán không thành công</p>
        <p className="mt-1">{error.message}</p>
        <p className="mt-1 text-ink/70">
          Đơn hàng của bạn vẫn được giữ. Kiểm tra thông tin rồi thử lại, hoặc chọn phương thức khác.
        </p>
      </div>
    );
  }

  if (error instanceof OrderExpiredError) {
    return (
      <div role="alert" className={box}>
        <p className="font-semibold text-danger">Đơn hàng không còn hiệu lực</p>
        <p className="mt-1">{error.message}</p>
        <p className="mt-1 text-ink/70">Bạn chưa bị trừ tiền. Bấm thanh toán lại để tạo đơn mới.</p>
      </div>
    );
  }

  if (error instanceof ApiError && error.code === 'OUT_OF_STOCK') {
    return (
      <div role="alert" className={box}>
        <p className="font-semibold text-danger">Có món đã hết hàng</p>
        <p className="mt-1">{error.message}</p>
        <Link href="/cart" className="mt-2 inline-block font-semibold text-pine underline">
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  return (
    <div role="alert" className={box}>
      <p className="font-semibold text-danger">Không thể hoàn tất đặt đơn</p>
      <p className="mt-1">{getErrorMessage(error)}</p>
    </div>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const hydrated = useCartStore((s) => s.hydrated);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const [method, setMethod] = useState<PaymentMethod>('WALLET');
  const checkout = useCheckout();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardValues>({ resolver: zodResolver(cardSchema) });

  if (checkout.isSuccess) {
    return (
      <p role="status" className="py-16 text-center text-ink/70">
        Đặt đơn thành công, đang chuyển tới đơn hàng…
      </p>
    );
  }

  if (!hydrated) {
    return (
      <p role="status" className="py-16 text-center text-ink/70">
        Đang tải giỏ hàng…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <h2 className="font-display text-xl font-semibold">Giỏ hàng đang trống</h2>
        <p className="mt-2 max-w-xs text-ink/70">Chọn món trước khi thanh toán.</p>
        <ButtonLink href="/menu" className="mt-6">
          Xem menu
        </ButtonLink>
      </div>
    );
  }

  const total = calculateTotal(items);
  const outOfStock =
    checkout.error instanceof ApiError && checkout.error.code === 'OUT_OF_STOCK';

  const submitPayment = (input: Parameters<typeof checkout.mutate>[0]) =>
    checkout.mutate(input, {
      onSuccess: ({ orderId }) => {
        router.push(`/orders/${orderId}`);
        clearCart();
      },
    });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (method === 'CARD') {
      return handleSubmit((card) =>
        submitPayment({
          method: 'CARD',
          card: { number: card.number.replace(/\s/g, ''), expiry: card.expiry, cvv: card.cvv },
        }),
      )(event);
    }
    event.preventDefault();
    submitPayment({ method: 'WALLET' });
  };

  const buttonLabel = checkout.isPending
    ? 'Đang xử lý…'
    : checkout.isError
      ? 'Thử thanh toán lại'
      : `Thanh toán ${formatVND(total)}`;

  return (
    <>
      <section aria-label="Tóm tắt đơn hàng" className="pt-4">
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const options = [item.sizeName, ...item.toppings.map((t) => t.name)]
              .filter(Boolean)
              .join(', ');
            return (
              <li key={item.lineId} className="flex justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {item.quantity} × {item.name}
                  </p>
                  {options && <p className="text-sm text-ink/70">{options}</p>}
                </div>
                <p className="shrink-0 tabular-nums">{formatVND(calculateLineTotal(item))}</p>
              </li>
            );
          })}
        </ul>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-ink/70">Tổng cộng</span>
          <span className="font-display text-2xl font-bold tabular-nums">{formatVND(total)}</span>
        </div>
      </section>

      <form onSubmit={onSubmit} noValidate>
        <fieldset className="mt-8">
          <legend className="font-display text-lg font-semibold">Phương thức thanh toán</legend>
          <div className="mt-3 space-y-2">
            {METHODS.map((m) => (
              <label
                key={m.value}
                className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-2 has-[:checked]:border-pine has-[:checked]:bg-pine/5"
              >
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={method === m.value}
                  onChange={() => setMethod(m.value)}
                  className="h-5 w-5 accent-pine"
                />
                <span className="flex-1 font-medium">{m.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-ink/70">Thanh toán mô phỏng, không trừ tiền thật.</p>
        </fieldset>

        {method === 'CARD' && <CardFields register={register} errors={errors} />}

        {checkout.isError && <CheckoutError error={checkout.error} />}

        <div className="sticky bottom-0 -mx-4 mt-8 border-t border-line bg-mist/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur">
          <Button type="submit" className="w-full" disabled={checkout.isPending || outOfStock}>
            {buttonLabel}
          </Button>
        </div>
      </form>
    </>
  );
}

export function CheckoutScreen() {
  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Thanh toán" backHref="/cart" backLabel="Giỏ hàng" />
      <main className="flex-1 px-4">
        <RequireAuth next="/checkout">
          <CheckoutForm />
        </RequireAuth>
      </main>
    </div>
  );
}
