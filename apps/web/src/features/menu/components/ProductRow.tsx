import Link from 'next/link';
import { ProductTile } from '@/components/ui/ProductTile';
import { formatVND } from '@/lib/format';
import type { Product } from '@/types';

export function ProductRow({ product }: { product: Product }) {
  const unavailable = !product.isAvailable;

  // Món hết hàng vẫn mở được trang chi tiết, nhưng không thêm được vào giỏ.
  return (
    <li>
      <Link href={`/products/${product.id}`} className="flex gap-4 py-4">
        <ProductTile
          category={product.category}
          imageUrl={product.imageUrl}
          dimmed={unavailable}
        />

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold leading-snug">{product.name}</h2>
          <p className="mt-0.5 line-clamp-2 text-sm text-ink/70">{product.description}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-base font-semibold tabular-nums">
            {formatVND(product.basePrice)}
          </p>
          {unavailable && <p className="mt-1 text-sm font-medium text-danger">Hết hàng</p>}
        </div>
      </Link>
    </li>
  );
}
