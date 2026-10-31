'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BackHeader } from '@/components/layout/BackHeader';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProductTile } from '@/components/ui/ProductTile';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ApiError, getErrorMessage } from '@/lib/errors';
import { formatVND } from '@/lib/format';
import { CartLink } from '@/features/cart/components/CartLink';
import { useCartStore } from '@/features/cart/store';
import { useProduct } from '../hooks/useProduct';
import { calculateUnitPrice } from '../utils/calculatePrice';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { ProductNotFound } from './ProductNotFound';
import { SizeSelector } from './SizeSelector';
import { ToppingSelector } from './ToppingSelector';

export function ProductDetailScreen({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch, isFetching } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);

  const [sizeId, setSizeId] = useState<string | null>(null);
  const [toppingIds, setToppingIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const header = <BackHeader backHref="/menu" backLabel="Menu" actions={<CartLink />} />;

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        {header}
        <main className="flex-1">
          <ProductDetailSkeleton />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-dvh flex-col">
        {header}
        <main className="flex-1">
          {error instanceof ApiError && error.status === 404 ? (
            <ProductNotFound />
          ) : (
            <ErrorState
              title="Không tải được món"
              message={getErrorMessage(error)}
              onRetry={() => void refetch()}
              retrying={isFetching}
            />
          )}
        </main>
      </div>
    );
  }

  const product = data;
  const unavailable = !product.isAvailable;
  // Chưa chọn thì mặc định size đầu tiên trong danh sách.
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0] ?? null;
  const selectedToppings = product.toppings.filter((t) => toppingIds.includes(t.id));
  const unitPrice = calculateUnitPrice(product.basePrice, size, selectedToppings);
  const total = unitPrice * quantity;

  const changeSize = (next: string) => {
    setAddedMessage(null);
    setSizeId(next);
  };
  const toggleTopping = (toppingId: string) => {
    setAddedMessage(null);
    setToppingIds((prev) =>
      prev.includes(toppingId) ? prev.filter((i) => i !== toppingId) : [...prev, toppingId],
    );
  };
  const changeQuantity = (next: number) => {
    setAddedMessage(null);
    setQuantity(next);
  };

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      sizeId: size?.id ?? null,
      sizeName: size?.name ?? null,
      toppings: selectedToppings.map(({ id: toppingId, name, price }) => ({
        id: toppingId,
        name,
        price,
      })),
      unitPrice,
      quantity,
    });
    setAddedMessage(`Đã thêm ${quantity} ${product.name} vào giỏ`);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {header}

      <main className="flex-1 px-4 pb-8">
        <div className="flex items-end gap-4 pt-5">
          <ProductTile
            category={product.category}
            imageUrl={product.imageUrl}
            size="lg"
            dimmed={unavailable}
          />
          <div className="min-w-0 pb-1">
            <h1 className="font-display text-3xl font-bold leading-tight">{product.name}</h1>
            {unavailable && <p className="mt-1 text-sm font-medium text-danger">Hết hàng</p>}
          </div>
        </div>

        <p className="mt-5 max-w-prose text-ink/80">{product.description}</p>

        {product.sizes.length > 0 && (
          <SizeSelector sizes={product.sizes} value={size?.id ?? ''} onChange={changeSize} />
        )}
        {product.toppings.length > 0 && (
          <ToppingSelector
            toppings={product.toppings}
            selectedIds={toppingIds}
            onToggle={toggleTopping}
          />
        )}
      </main>

      <section
        aria-label="Số lượng và giá"
        className="sticky bottom-0 border-t border-line bg-mist/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur"
      >
        {addedMessage && (
          <div
            role="status"
            className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-crema/40 px-4 py-2 text-sm"
          >
            <span>{addedMessage}</span>
            <Link href="/cart" className="shrink-0 font-semibold text-pine underline">
              Xem giỏ hàng
            </Link>
          </div>
        )}
        <div className="flex items-center gap-3">
          <QuantityStepper
            label={product.name}
            value={quantity}
            onChange={changeQuantity}
            disabled={unavailable}
          />
          <Button className="flex-1 justify-between gap-3 px-5" onClick={handleAdd} disabled={unavailable}>
            {unavailable ? (
              'Hết hàng'
            ) : (
              <>
                <span>Thêm vào giỏ</span>
                <span className="tabular-nums">{formatVND(total)}</span>
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
