import { z } from 'zod';

const email = z.string().trim().min(1, 'Nhập email').email('Email không hợp lệ');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Nhập mật khẩu'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Tên cần ít nhất 2 ký tự'),
    email,
    password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Nhập lại mật khẩu'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
