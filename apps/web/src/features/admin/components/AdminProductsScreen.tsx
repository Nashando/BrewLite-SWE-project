'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { getErrorMessage } from '@/lib/errors';
import { formatVND } from '@/lib/format';
import { adminProductsKey, fetchAdminProducts } from '../api';
import { AdminLayout } from './AdminLayout';
import { ProductForm } from './ProductForm';

function ProductList() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminProductsKey,
    queryFn: fetchAdminProducts,
  });
  /** id món đang sửa, 'new' khi thêm món, null khi xem danh sách. */
  const [editing, setEditing] = useState<string | null>(null);

  if (isPending) {
    return (
      <p role="status" className="py-16 text-center text-ink/70">
        Đang tải danh sách món…
      </p>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Không tải được danh sách món"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  const categories = Array.from(new Set(data.map((p) => p.category)));

  if (editing) {
    return (
      <ProductForm
        key={editing}
        product={data.find((p) => p.id === editing)}
        categories={categories}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <div className="pt-4">
        <Button onClick={() => setEditing('new')}>Thêm món</Button>
      </div>
      {data.length === 0 ? (
        <p role="status" className="py-16 text-center text-ink/70">
          Chưa có món nào.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {data.map((product) => (
            <li key={product.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {product.name}
                  {!product.isActive && <span className="ml-2 text-sm font-normal text-ink/70">(đang ẩn)</span>}
                </p>
                <p className="text-sm text-ink/70">
                  {product.category} · {formatVND(product.basePrice)} · Kho:{' '}
                  <span className={product.stock === 0 ? 'font-semibold text-danger' : 'tabular-nums'}>
                    {product.stock === 0 ? 'hết hàng' : product.stock}
                  </span>
                </p>
              </div>
              <Button
                variant="secondary"
                className="shrink-0"
                aria-label={`Sửa ${product.name}`}
                onClick={() => setEditing(product.id)}
              >
                Sửa
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function AdminProductsScreen() {
  return (
    <AdminLayout title="Quản lý món">
      <ProductList />
    </AdminLayout>
  );
}
