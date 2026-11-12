import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface AppHeaderProps {
  title: string;
  actions?: ReactNode;
  /** Trang danh sách: nội dung header rộng theo trang trên máy tính. */
  wide?: boolean;
}

export function AppHeader({ title, actions, wide = false }: AppHeaderProps) {
  return (
    <header className="bg-pine pb-7 pt-[max(env(safe-area-inset-top),1rem)] text-mist">
      <div className={`${wide ? 'page-wide' : 'page'} px-4`}>
        <div className="flex flex-wrap items-center">
          <div className="mr-auto">
            <BrandLogo />
          </div>
          {actions}
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05]">{title}</h1>
      </div>
    </header>
  );
}
