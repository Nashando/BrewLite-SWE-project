'use client';

import { BackHeader } from '@/components/layout/BackHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { useCartStore } from '../store';
import { calculateTotal, countItems } from '../utils/calculateTotal';
import { CartEmpty } from './CartEmpty';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';

function CartSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Đang tải giỏ hàng</span>
      <div aria-hidden="true" className="flex gap-4 py-4 motion-safe:animate-pulse">
        <div className="h-[72px] w-[72px] shrink-0 rounded-2xl bg-pine/10" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-pine/10" />
          <div className="h-3 w-1/2 rounded bg-pine/10" />
        </div>
      </div>
    </div>
  );
}

export function CartScreen() {
  const hydrated = useCartStore((s) => s.hydrated);
  const items = useCartStore((s) => s.items);

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Giỏ hàng" backHref="/menu" backLabel="Menu" />

      <main className="flex-1 px-4">
        {!hydrated ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <CartEmpty />
        ) : (
          <>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <CartItemRow key={item.lineId} item={item} />
              ))}
            </ul>
            <ButtonLink href="/menu" className="mt-4 bg-transparent text-pine ring-1 ring-pine hover:bg-pine/5">
              Thêm món khác
            </ButtonLink>
          </>
        )}
      </main>

      {/* Sprint 2: truyền checkoutHref="/checkout" khi trang đặt đơn (cần đăng nhập) đã có. */}
      {hydrated && items.length > 0 && (
        <CartSummary total={calculateTotal(items)} count={countItems(items)} />
      )}
    </div>
  );
}
