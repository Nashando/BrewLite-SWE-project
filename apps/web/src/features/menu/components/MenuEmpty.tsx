import { Button } from '@/components/ui/Button';
import { CupIcon } from '@/components/ui/CupIcon';

export function MenuEmpty({ onReload, reloading }: { onReload: () => void; reloading: boolean }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-crema/40 text-pine">
        <CupIcon className="h-8 w-8" />
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold">Menu đang trống</h2>
      <p className="mt-2 max-w-xs text-ink/70">
        Quầy chưa đăng món nào. Tải lại sau ít phút để xem món mới.
      </p>
      <Button className="mt-6" onClick={onReload} disabled={reloading}>
        {reloading ? 'Đang tải…' : 'Tải lại menu'}
      </Button>
    </div>
  );
}
