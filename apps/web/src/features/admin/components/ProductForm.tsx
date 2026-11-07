'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { productKeys } from '@/features/menu/api';
import { getErrorMessage } from '@/lib/errors';
import type { AdminProduct } from '@/types';
import { adjustStock, adminProductsKey, createProduct, updateProduct } from '../api';
import { productSchema, type ProductValues } from '../schemas';

function useInvalidateCatalog() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: adminProductsKey });
    void client.invalidateQueries({ queryKey: productKeys.all }); // menu của khách
  };
}

/** Đổi kho bằng số thay đổi, không ghi đè, để không mất số đơn khách vừa đặt. */
function StockAdjuster({ product }: { product: AdminProduct }) {
  const invalidate = useInvalidateCatalog();
  const [stock, setStock] = useState(product.stock);
  const [delta, setDelta] = useState('');
  const adjust = useMutation({
    mutationFn: (value: number) => adjustStock(product.id, value),
    onSuccess: (updated) => {
      setStock(updated.stock);
      setDelta('');
      invalidate();
    },
  });
  const value = Number(delta);
  const valid = delta !== '' && Number.isInteger(value) && value !== 0;

  return (
    <section aria-label="Tồn kho" className="mt-6 rounded-xl border border-line p-4">
      <p className="font-medium">
        Tồn kho hiện tại: <span className="tabular-nums">{stock}</span>
      </p>
      <div className="mt-2 flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="Số lượng thay đổi (âm là giảm)"
            type="number"
            step={1}
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
          />
        </div>
        <Button variant="secondary" disabled={!valid || adjust.isPending} onClick={() => adjust.mutate(value)}>
          Cập nhật kho
        </Button>
      </div>
      {adjust.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {getErrorMessage(adjust.error)}
        </p>
      )}
    </section>
  );
}

interface ProductFormProps {
  /** Bỏ trống khi thêm món mới. */
  product?: AdminProduct;
  categories: string[];
  onDone: () => void;
}

export function ProductForm({ product, categories, onDone }: ProductFormProps) {
  const invalidate = useInvalidateCatalog();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          category: product.category,
          basePrice: product.basePrice,
          isActive: product.isActive,
          sizes: product.sizes,
          stock: product.stock,
        }
      : { name: '', description: '', category: '', isActive: true, sizes: [], stock: 0 },
  });
  // keyName khác "id" để giữ id của size đã có, API dựa vào đó phân biệt sửa và thêm
  const sizes = useFieldArray({ control, name: 'sizes', keyName: 'fieldKey' });

  const save = useMutation({
    mutationFn: ({ stock, ...input }: ProductValues) =>
      product ? updateProduct(product.id, input) : createProduct({ ...input, stock }),
    onSuccess: () => {
      invalidate();
      onDone();
    },
  });

  return (
    <div className="pt-4">
      <h2 className="font-display text-xl font-semibold">{product ? `Sửa ${product.name}` : 'Thêm món'}</h2>

      {product && <StockAdjuster product={product} />}

      <form onSubmit={handleSubmit((values) => save.mutate(values))} noValidate className="mt-4 space-y-4">
        <TextField label="Tên món" error={errors.name?.message} {...register('name')} />
        <TextField label="Mô tả" error={errors.description?.message} {...register('description')} />
        <TextField
          label="Danh mục"
          list="admin-categories"
          error={errors.category?.message}
          {...register('category')}
        />
        <datalist id="admin-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <TextField
          label="Giá gốc (₫)"
          type="number"
          min={0}
          step={1000}
          error={errors.basePrice?.message}
          {...register('basePrice', { valueAsNumber: true })}
        />
        {!product && (
          <TextField
            label="Tồn kho ban đầu"
            type="number"
            min={0}
            error={errors.stock?.message}
            {...register('stock', { valueAsNumber: true })}
          />
        )}
        <label className="flex min-h-[44px] items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-pine" {...register('isActive')} />
          <span className="font-medium">Đang bán (bỏ chọn để ẩn khỏi menu)</span>
        </label>

        <fieldset>
          <legend className="font-medium">Size</legend>
          <p className="text-sm text-ink/70">Món không có size (như bánh) sẽ không có topping.</p>
          <div className="mt-2 space-y-3">
            {sizes.fields.map((field, index) => (
              <div key={field.fieldKey} className="flex items-start gap-2">
                <div className="flex-1">
                  <TextField
                    label={`Tên size ${index + 1}`}
                    error={errors.sizes?.[index]?.name?.message}
                    {...register(`sizes.${index}.name`)}
                  />
                </div>
                <div className="flex-1">
                  <TextField
                    label={`Phụ thu size ${index + 1} (₫)`}
                    type="number"
                    min={0}
                    step={1000}
                    error={errors.sizes?.[index]?.extraPrice?.message}
                    {...register(`sizes.${index}.extraPrice`, { valueAsNumber: true })}
                  />
                </div>
                <Button
                  variant="secondary"
                  className="mt-6 !px-3"
                  aria-label={`Xóa size ${index + 1}`}
                  onClick={() => sizes.remove(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
          {errors.sizes?.root?.message && (
            <p className="mt-1 text-sm text-danger">{errors.sizes.root.message}</p>
          )}
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => sizes.append({ name: '', extraPrice: 0 })}
          >
            Thêm size
          </Button>
        </fieldset>

        {save.isError && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {getErrorMessage(save.error)}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Đang lưu…' : 'Lưu món'}
          </Button>
          <Button variant="secondary" disabled={save.isPending} onClick={onDone}>
            Quay lại
          </Button>
        </div>
      </form>
    </div>
  );
}
