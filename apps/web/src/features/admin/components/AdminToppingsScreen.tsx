'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { TextField } from '@/components/ui/TextField';
import { productKeys } from '@/features/menu/api';
import { getErrorMessage } from '@/lib/errors';
import { formatVND } from '@/lib/format';
import type { AdminTopping } from '@/types';
import { adminToppingsKey, createTopping, fetchAdminToppings, updateTopping } from '../api';
import { toppingSchema, type ToppingValues } from '../schemas';
import { AdminLayout } from './AdminLayout';

function useInvalidateToppings() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: adminToppingsKey });
    void client.invalidateQueries({ queryKey: productKeys.all }); // chi tiết món có danh sách topping
  };
}

function ToppingForm({ topping, onDone }: { topping?: AdminTopping; onDone: () => void }) {
  const invalidate = useInvalidateToppings();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ToppingValues>({
    resolver: zodResolver(toppingSchema),
    defaultValues: topping ? { name: topping.name, price: topping.price } : { name: '' },
  });
  const save = useMutation({
    mutationFn: (values: ToppingValues) =>
      topping ? updateTopping(topping.id, values) : createTopping({ ...values, isActive: true }),
    onSuccess: () => {
      invalidate();
      reset();
      onDone();
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => save.mutate(values))} noValidate className="space-y-3 py-3">
      <TextField label="Tên topping" error={errors.name?.message} {...register('name')} />
      <TextField
        label="Giá (₫)"
        type="number"
        min={0}
        step={1000}
        error={errors.price?.message}
        {...register('price', { valueAsNumber: true })}
      />
      {save.isError && (
        <p role="alert" className="text-sm text-danger">
          {getErrorMessage(save.error)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Đang lưu…' : 'Lưu topping'}
        </Button>
        <Button variant="secondary" disabled={save.isPending} onClick={onDone}>
          Quay lại
        </Button>
      </div>
    </form>
  );
}

function ToppingRow({ topping }: { topping: AdminTopping }) {
  const invalidate = useInvalidateToppings();
  const [editing, setEditing] = useState(false);
  const toggle = useMutation({
    mutationFn: () => updateTopping(topping.id, { isActive: !topping.isActive }),
    onSuccess: invalidate,
  });

  if (editing) {
    return (
      <li>
        <ToppingForm topping={topping} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">
            {topping.name}
            {!topping.isActive && <span className="ml-2 text-sm font-normal text-ink/70">(đang ẩn)</span>}
          </p>
          <p className="text-sm text-ink/70 tabular-nums">{formatVND(topping.price)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" aria-label={`Sửa ${topping.name}`} onClick={() => setEditing(true)}>
            Sửa
          </Button>
          <Button
            variant="secondary"
            aria-label={`${topping.isActive ? 'Ẩn' : 'Hiện'} ${topping.name}`}
            disabled={toggle.isPending}
            onClick={() => toggle.mutate()}
          >
            {topping.isActive ? 'Ẩn' : 'Hiện'}
          </Button>
        </div>
      </div>
      {toggle.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {getErrorMessage(toggle.error)}
        </p>
      )}
    </li>
  );
}

function ToppingList() {
  const [adding, setAdding] = useState(false);
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminToppingsKey,
    queryFn: fetchAdminToppings,
  });

  if (isPending) {
    return (
      <p role="status" className="py-16 text-center text-ink/70">
        Đang tải topping…
      </p>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Không tải được topping"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  return (
    <>
      <div className="pt-4">
        {adding ? <ToppingForm onDone={() => setAdding(false)} /> : <Button onClick={() => setAdding(true)}>Thêm topping</Button>}
      </div>
      {data.length === 0 ? (
        <p role="status" className="py-16 text-center text-ink/70">
          Chưa có topping nào.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {data.map((topping) => (
            <ToppingRow key={topping.id} topping={topping} />
          ))}
        </ul>
      )}
    </>
  );
}

export function AdminToppingsScreen() {
  return (
    <AdminLayout title="Quản lý topping">
      <ToppingList />
    </AdminLayout>
  );
}
