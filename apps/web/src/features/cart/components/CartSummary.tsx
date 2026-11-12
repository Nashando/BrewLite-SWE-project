import { ButtonLink } from '@/components/ui/ButtonLink';
import { formatVND } from '@/lib/format';

interface CartSummaryProps {
  total: number;
  count: number;
  /** Chỉ truyền khi trang thanh toán đã có. */
  checkoutHref?: string;
}

export function CartSummary({ total, count, checkoutHref }: CartSummaryProps) {
  return (
    <section
      aria-label="Tổng cộng"
      // Điện thoại: dính đáy màn hình, nền trải tràn lề; máy tính: thẻ dính phía trên cột phải
      className="sticky bottom-0 -mx-4 mt-auto border-t border-line bg-mist/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur lg:bottom-auto lg:top-6 lg:mx-0 lg:mt-0 lg:rounded-2xl lg:border lg:bg-white lg:p-5 lg:backdrop-blur-none"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-ink/70">Tổng cộng ({count} món)</p>
        <p className="font-display text-2xl font-bold tabular-nums">{formatVND(total)}</p>
      </div>
      {checkoutHref && (
        <ButtonLink href={checkoutHref} className="mt-3 w-full">
          Thanh toán
        </ButtonLink>
      )}
    </section>
  );
}
