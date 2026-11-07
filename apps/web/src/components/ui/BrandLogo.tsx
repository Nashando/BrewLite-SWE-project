import Link from 'next/link';
import { CupIcon } from './CupIcon';

/** Logo dùng trên nền xanh đậm: ô crema làm điểm nhấn, chữ "Lite" cùng màu để gắn với ô. */
export function BrandLogo() {
  return (
    <Link href="/menu" aria-label="BrewLite, về menu" className="flex items-center gap-2 rounded-xl min-[360px]:gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-crema text-pine min-[360px]:h-11 min-[360px]:w-11">
        <CupIcon className="h-6 w-6 min-[360px]:h-7 min-[360px]:w-7" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight min-[360px]:text-2xl">
        Brew<span className="text-crema">Lite</span>
      </span>
    </Link>
  );
}
