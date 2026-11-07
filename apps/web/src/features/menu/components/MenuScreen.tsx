'use client';

import { useMemo, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { getErrorMessage } from '@/lib/errors';
import { UserActions } from '@/features/auth/components/UserActions';
import { CartLink } from '@/features/cart/components/CartLink';
import { useProducts } from '../hooks/useProducts';
import { matchesSearch } from '../utils/matchesSearch';
import { CategoryTabs } from './CategoryTabs';
import { MenuEmpty } from './MenuEmpty';
import { MenuError } from './MenuError';
import { MenuSkeleton } from './MenuSkeleton';
import { ProductRow } from './ProductRow';

export function MenuScreen() {
  const { data, isPending, isError, error, refetch, isFetching } = useProducts();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const categories = useMemo(
    () => (data ? Array.from(new Set(data.map((p) => p.category))) : []),
    [data],
  );
  // Nếu danh mục đang chọn biến mất sau khi tải lại, quay về "Tất cả".
  const category = selected && categories.includes(selected) ? selected : null;
  const visible = useMemo(
    () =>
      data
        ? data.filter(
            (p) => (category === null || p.category === category) && matchesSearch(p, search),
          )
        : [],
    [data, category, search],
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
  } else if (visible.length === 0) {
    content = (
      <p role="status" className="py-16 text-center text-ink/70">
        Không tìm thấy món phù hợp.
      </p>
    );
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
      <AppHeader
        title="Hôm nay uống gì?"
        actions={
          <>
            <UserActions />
            <div className="order-2 sm:order-3">
              <CartLink />
            </div>
          </>
        }
      />
      {showTabs && (
        <div className="px-4 pb-1 pt-3">
          <input
            type="search"
            aria-label="Tìm món"
            placeholder="Tìm món…"
            spellCheck={false}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[44px] w-full rounded-full border border-line bg-white px-4 text-base"
          />
        </div>
      )}
      {showTabs && <CategoryTabs categories={categories} active={category} onChange={setSelected} />}
      <main className="px-4 pb-[max(env(safe-area-inset-bottom),2rem)]">{content}</main>
    </>
  );
}
