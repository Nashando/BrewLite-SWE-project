import { z } from 'zod';

const money = z
  .number({ invalid_type_error: 'Nhập số tiền' })
  .int('Số tiền phải là số nguyên')
  .min(0, 'Số tiền không được âm')
  .max(10_000_000, 'Tối đa 10.000.000 ₫');

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên món').max(100, 'Tối đa 100 ký tự'),
  description: z.string().trim().max(500, 'Tối đa 500 ký tự'),
  category: z.string().trim().min(1, 'Nhập danh mục').max(50, 'Tối đa 50 ký tự'),
  basePrice: money,
  imageUrl: z
    .string()
    .trim()
    .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'Ảnh phải là URL http hoặc https'),
  isActive: z.boolean(),
  sizes: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().trim().min(1, 'Nhập tên size').max(30, 'Tối đa 30 ký tự'),
        extraPrice: money,
      }),
    )
    .refine((sizes) => new Set(sizes.map((s) => s.name.trim())).size === sizes.length, 'Tên size bị trùng'),
  /** Chỉ dùng khi thêm món; món đã có chỉnh kho bằng ô riêng. */
  stock: z
    .number({ invalid_type_error: 'Nhập số lượng' })
    .int('Tồn kho phải là số nguyên')
    .min(0, 'Tồn kho không được âm')
    .max(1_000_000, 'Tối đa 1.000.000'),
});

export type ProductValues = z.infer<typeof productSchema>;

export const toppingSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên topping').max(50, 'Tối đa 50 ký tự'),
  price: money,
});

export type ToppingValues = z.infer<typeof toppingSchema>;
