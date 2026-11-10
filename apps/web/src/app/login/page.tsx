import type { Metadata } from 'next';
import { BackHeader } from '@/components/layout/BackHeader';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = { title: 'Đăng nhập' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Đăng nhập" backHref="/menu" backLabel="Menu" />
      <main className="flex-1 px-4 py-6">
        <LoginForm next={next} />
      </main>
    </div>
  );
}
