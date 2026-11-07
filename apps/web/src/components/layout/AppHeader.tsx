import type { ReactNode } from 'react';
import { CupIcon } from '@/components/ui/CupIcon';

interface AppHeaderProps {
  title: string;
  /** Nằm cạnh logo, luôn ở dòng đầu trên mọi cỡ màn hình. */
  actions?: ReactNode;
  /** Các link điều hướng, nằm ở dòng riêng dưới logo. */
  nav?: ReactNode;
}

export function AppHeader({ title, actions, nav }: AppHeaderProps) {
  return (
    <header className="bg-pine px-4 pb-7 pt-[max(env(safe-area-inset-top),1rem)] text-mist">
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-2">
          <CupIcon className="h-6 w-6 text-crema" />
          <span className="font-display text-lg font-semibold">BrewLite</span>
        </div>
        {actions}
      </div>
      {/* Giữ sẵn chiều cao để header không nhảy khi đọc xong phiên đăng nhập */}
      {nav && <nav aria-label="Tài khoản" className="-ml-1.5 mt-1 flex min-h-[44px] flex-wrap items-center">{nav}</nav>}
      <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05]">{title}</h1>
    </header>
  );
}
