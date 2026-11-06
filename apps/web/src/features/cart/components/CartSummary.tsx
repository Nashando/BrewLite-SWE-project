import { ButtonLink } from '@/components/ui/ButtonLink';
import { formatVND } from '@/lib/format';

interface CartSummaryProps {
  total: number;
  count: number;
  /** Chỉ truyền khi trang đặt đơn đã có. */
  checkoutHref?: string;
}

export function CartSummary({ total, count, checkoutHref }: CartSummaryProps) {
  return (
    <section
      aria-label="Tổng cộng"
      className="sticky bottom-0 border-t border-line bg-mist/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-ink/70">Tổng cộng ({count} món)</p>
        <p className="font-display text-2xl font-bold tabular-nums">{formatVND(total)}</p>
      </div>
      {checkoutHref && (
        <ButtonLink href={checkoutHref} className="mt-3 w-full">
          Đặt đơn
        </ButtonLink>
      )}
    </section>
  );
}
