import type { ReactNode } from 'react';
import { CupIcon } from '@/components/ui/CupIcon';

export function AppHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="bg-pine px-4 pb-7 pt-[max(env(safe-area-inset-top),1rem)] text-mist">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CupIcon className="h-6 w-6 text-crema" />
          <span className="font-display text-lg font-semibold">BrewLite</span>
        </div>
        {actions}
      </div>
      <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05]">{title}</h1>
    </header>
  );
}
