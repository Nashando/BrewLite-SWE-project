'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/errors';
import { register as registerAccount } from '../api';
import { safeNext } from '../safeNext';
import { registerSchema, type RegisterValues } from '../schemas';
import { useAuthStore } from '../store';

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: (session) => {
      setSession(session);
      router.replace(safeNext(next));
    },
  });

  return (
    <form
      onSubmit={handleSubmit(({ name, email, password }) =>
        mutation.mutate({ name, email, password }),
      )}
      noValidate
      className="space-y-4"
    >
      {mutation.isError && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {getErrorMessage(mutation.error)}
        </p>
      )}
      <TextField label="Họ tên" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Mật khẩu"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Nhập lại mật khẩu"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
      </Button>
      <p className="text-center text-sm text-ink/70">
        Đã có tài khoản?{' '}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="font-semibold text-pine underline"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
