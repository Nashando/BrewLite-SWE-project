'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BackHeader } from '@/components/layout/BackHeader';
import { RequireRole } from '@/features/auth/components/RequireRole';

const TABS = [
  { href: '/admin/products', label: 'Món' },
  { href: '/admin/toppings', label: 'Topping' },
  { href: '/admin/revenue', label: 'Doanh thu' },
];

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader title={title} backHref="/menu" backLabel="Menu" wide />
      <nav aria-label="Quản lý" className="border-b border-line">
        <div className="page-wide flex gap-2 px-4 py-2">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium ${
                  active ? 'bg-pine text-mist' : 'border border-line text-ink'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="page-wide flex-1 px-4 pb-8">
        <RequireRole roles={['MANAGER']} next={pathname}>
          {children}
        </RequireRole>
      </main>
    </div>
  );
}
