'use client';

import { BackHeader } from '@/components/layout/BackHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { useCartStore } from '../store';
import { calculateTotal, countItems } from '../utils/calculateTotal';
import { CartEmpty } from './CartEmpty';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';
import { RequireCustomer } from '@/features/auth/components/RequireCustomer';
import { canOrder } from '@/features/auth/roles';
import { useAuthStore } from '@/features/auth/store';
import { useCartSync } from '../hooks/useCartSync';
import { CartSyncMessage } from './CartSyncMessage';

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
  const { notice } = useCartSync();
  const hydrated = useCartStore((s) => s.hydrated);
  const items = useCartStore((s) => s.items);
  const role = useAuthStore((s) => s.user?.role);

  if (!canOrder(role)) {
    return (
      <div className="flex min-h-dvh flex-col">
        <BackHeader title="Giỏ hàng" backHref="/menu" backLabel="Menu" />
        <main className="flex-1 px-4">
          <RequireCustomer>{null}</RequireCustomer>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Giỏ hàng" backHref="/menu" backLabel="Menu" />

      <main className="flex-1 px-4">
        <CartSyncMessage notice={notice} />
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
            <ButtonLink href="/menu" variant="secondary" className="mt-4">
              Thêm món khác
            </ButtonLink>
          </>
        )}
      </main>

      {hydrated && items.length > 0 && (
        <CartSummary
          total={calculateTotal(items)}
          count={countItems(items)}
          checkoutHref="/checkout"
        />
      )}
    </div>
  );
}
