'use client';

import Link from 'next/link';
import { BagIcon } from '@/components/ui/icons';
import { useCartStore } from '../store';
import { countItems } from '../utils/calculateTotal';

export function CartLink() {
  const hydrated = useCartStore((s) => s.hydrated);
  const count = useCartStore((s) => countItems(s.items));
  const shown = hydrated ? count : 0;

  return (
    <Link
      href="/cart"
      aria-label={shown > 0 ? `Giỏ hàng, ${shown} món` : 'Giỏ hàng'}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-mist"
    >
      <BagIcon className="h-6 w-6" />
      {shown > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 min-w-5 rounded-full bg-crema px-1 text-center text-xs font-semibold leading-5 text-pine tabular-nums"
        >
          {shown}
        </span>
      )}
    </Link>
  );
}
