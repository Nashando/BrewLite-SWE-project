import type { CartSyncNotice } from '../hooks/useCartSync';

/** Báo cho khách biết giỏ vừa thay đổi, để giá hoặc món không tự đổi mà không rõ lý do. */
export function CartSyncMessage({ notice }: { notice: CartSyncNotice }) {
  if (notice.removed.length === 0 && !notice.priceChanged) return null;

  const names = Array.from(new Set(notice.removed)).join(', ');
  return (
    <div role="status" className="mt-4 rounded-xl bg-crema/30 px-4 py-3 text-sm">
      {notice.removed.length > 0 && <p>Đã bỏ khỏi giỏ vì không còn bán hoặc đã đổi tùy chọn: {names}.</p>}
      {notice.priceChanged && <p>Giá một số món đã thay đổi, giỏ đã cập nhật theo giá mới.</p>}
    </div>
  );
}
