import { ButtonLink } from '@/components/ui/ButtonLink';
import { CupIcon } from '@/components/ui/CupIcon';

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-crema/40 text-pine">
        <CupIcon className="h-8 w-8" />
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold">Giỏ hàng đang trống</h2>
      <p className="mt-2 max-w-xs text-ink/70">Chọn món từ menu, món bạn thêm sẽ hiện ở đây.</p>
      <ButtonLink href="/menu" className="mt-6">
        Xem menu
      </ButtonLink>
    </div>
  );
}
