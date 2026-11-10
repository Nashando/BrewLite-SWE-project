import { z } from 'zod';

/** Thẻ hết hạn sau ngày cuối của tháng ghi trên thẻ. */
export function isExpired(expiry: string, now: Date = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return true;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return true;
  return new Date(year, month, 1) <= now; // ngày 1 của tháng kế tiếp
}

export const cardSchema = z.object({
  number: z
    .string()
    .refine((v) => /^\d{16}$/.test(v.replace(/\s/g, '')), 'Số thẻ gồm 16 chữ số'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Nhập hạn dùng dạng MM/YY')
    .refine((v) => !isExpired(v), 'Thẻ đã hết hạn'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV gồm 3 hoặc 4 chữ số'),
});

export type CardValues = z.infer<typeof cardSchema>;
