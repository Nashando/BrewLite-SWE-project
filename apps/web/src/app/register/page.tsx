import type { Metadata } from 'next';
import { BackHeader } from '@/components/layout/BackHeader';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = { title: 'Đăng ký' };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title="Đăng ký" backHref="/menu" backLabel="Menu" />
      <main className="flex-1 px-4 py-6">
        <RegisterForm next={next} />
      </main>
    </div>
  );
}
