import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function AppHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="bg-pine px-4 pb-7 pt-[max(env(safe-area-inset-top),1rem)] text-mist">
      <div className="flex flex-wrap items-center">
        <div className="mr-auto">
          <BrandLogo />
        </div>
        {actions}
      </div>
      <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05]">{title}</h1>
    </header>
  );
}
