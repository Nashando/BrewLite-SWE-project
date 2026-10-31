import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeftIcon } from '@/components/ui/icons';

interface BackHeaderProps {
  backHref: string;
  backLabel: string;
  /** Bỏ trống khi tiêu đề (h1) nằm trong nội dung trang, ví dụ tên sản phẩm. */
  title?: string;
  actions?: ReactNode;
}

export function BackHeader({ backHref, backLabel, title, actions }: BackHeaderProps) {
  return (
    <header className="bg-pine px-4 pb-4 pt-[max(env(safe-area-inset-top),0.5rem)] text-mist">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          {backLabel}
        </Link>
        {actions}
      </div>
      {title && <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{title}</h1>}
    </header>
  );
}
