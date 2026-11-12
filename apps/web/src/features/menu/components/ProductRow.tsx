import Link from 'next/link';
import { ProductTile } from '@/components/ui/ProductTile';
import { formatVND } from '@/lib/format';
import type { Product } from '@/types';

export function ProductRow({ product }: { product: Product }) {
  const unavailable = !product.isAvailable;

  // Món hết hàng vẫn mở được trang chi tiết, nhưng không thêm được vào giỏ.
  return (
    <li>
      {/* Điện thoại: dòng gồm ảnh, tên, giá bên phải.
          Tablet, máy tính: thẻ trong lưới, giá xuống dưới mô tả để tên món đủ chỗ trên một dòng. */}
      <Link
        href={`/products/${product.id}`}
        className="grid grid-cols-[auto_1fr_auto] items-start gap-x-4 py-4 md:h-full md:grid-cols-[auto_1fr] md:grid-rows-[1fr_auto] md:rounded-2xl md:border md:border-line md:bg-white md:p-4 md:transition-colors md:hover:border-pine"
      >
        <div className="md:row-span-2">
          <ProductTile imageUrl={product.imageUrl} dimmed={unavailable} />
        </div>

        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold leading-snug">{product.name}</h2>
          <p className="mt-0.5 line-clamp-2 text-sm text-ink/70">{product.description}</p>
        </div>

        <div className="text-right md:col-start-2 md:mt-1 md:flex md:items-baseline md:gap-3 md:text-left">
          <p className="font-display text-base font-semibold tabular-nums">
            {formatVND(product.basePrice)}
          </p>
          {unavailable && <p className="mt-1 text-sm font-medium text-danger md:mt-0">Hết hàng</p>}
        </div>
      </Link>
    </li>
  );
}
