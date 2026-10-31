'use client';

import { useMemo, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { getErrorMessage } from '@/lib/errors';
import { CartLink } from '@/features/cart/components/CartLink';
import { useProducts } from '../hooks/useProducts';
import { CategoryTabs } from './CategoryTabs';
import { MenuEmpty } from './MenuEmpty';
import { MenuError } from './MenuError';
import { MenuSkeleton } from './MenuSkeleton';
import { ProductRow } from './ProductRow';

export function MenuScreen() {
  const { data, isPending, isError, error, refetch, isFetching } = useProducts();
  const [selected, setSelected] = useState<string | null>(null);

  const categories = useMemo(
    () => (data ? Array.from(new Set(data.map((p) => p.category))) : []),
    [data],
  );
  // Nếu danh mục đang chọn biến mất sau khi tải lại, quay về "Tất cả".
  const category = selected && categories.includes(selected) ? selected : null;
  const visible = useMemo(
    () => (data ? data.filter((p) => category === null || p.category === category) : []),
    [data, category],
  );

  let content: React.ReactNode;
  if (isPending) {
    content = <MenuSkeleton />;
  } else if (isError) {
    content = (
      <MenuError
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  } else if (data.length === 0) {
    content = <MenuEmpty onReload={() => void refetch()} reloading={isFetching} />;
  } else {
    content = (
      <ul className="divide-y divide-line">
        {visible.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </ul>
    );
  }

  const showTabs = !isPending && !isError && categories.length > 0;

  return (
    <>
      <AppHeader title="Hôm nay uống gì?" actions={<CartLink />} />
      {showTabs && <CategoryTabs categories={categories} active={category} onChange={setSelected} />}
      <main className="px-4 pb-[max(env(safe-area-inset-bottom),2rem)]">{content}</main>
    </>
  );
}
