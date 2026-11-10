'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/errors';
import { login } from '../api';
import { safeNext } from '../safeNext';
import { loginSchema, type LoginValues } from '../schemas';
import { useAuthStore } from '../store';

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session);
      router.replace(safeNext(next));
    },
  });

  return (
    <form method="post" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
      {mutation.isError && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {getErrorMessage(mutation.error)}
        </p>
      )}
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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </Button>
      <p className="text-center text-sm text-ink/70">
        Chưa có tài khoản?{' '}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
          className="font-semibold text-pine underline"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
