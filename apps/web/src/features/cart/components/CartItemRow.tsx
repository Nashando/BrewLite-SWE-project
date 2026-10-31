'use client';

import { ProductTile } from '@/components/ui/ProductTile';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatVND } from '@/lib/format';
import { useCartStore } from '../store';
import type { CartItem } from '../types';
import { calculateLineTotal } from '../utils/calculateTotal';

export function CartItemRow({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const options = [item.sizeName, ...item.toppings.map((t) => t.name)].filter(Boolean).join(', ');

  return (
    <li className="py-4">
      <div className="flex gap-4">
        <ProductTile category={item.category} imageUrl={item.imageUrl} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold leading-snug">{item.name}</h2>
          {options && <p className="mt-0.5 text-sm text-ink/70">{options}</p>}
          <p className="mt-0.5 text-sm text-ink/70 tabular-nums">
            Đơn giá {formatVND(item.unitPrice)}
          </p>
        </div>
        <p className="shrink-0 font-display text-base font-semibold tabular-nums">
          {formatVND(calculateLineTotal(item))}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between pl-[88px]">
        <QuantityStepper
          label={item.name}
          value={item.quantity}
          onChange={(quantity) => setQuantity(item.lineId, quantity)}
        />
        <button
          type="button"
          aria-label={`Xóa ${item.name} khỏi giỏ`}
          onClick={() => removeItem(item.lineId)}
          className="min-h-[44px] px-2 text-sm font-medium text-danger underline"
        >
          Xóa
        </button>
      </div>
    </li>
  );
}
