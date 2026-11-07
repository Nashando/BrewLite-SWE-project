import { useQueries } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchProduct, productDetailKey } from '@/features/product/api';
import { isNotFoundError } from '@/lib/errors';
import { useCartStore } from '../store';
import { reconcileLine } from '../utils/reconcile';

export interface CartSyncNotice {
  /** Tên các món đã bỏ khỏi giỏ vì không còn bán hoặc tùy chọn không còn. */
  removed: string[];
  priceChanged: boolean;
}

/**
 * Giỏ lưu trong localStorage nên có thể đã cũ: món bị ẩn, đổi giá, hoặc còn dữ liệu từ lần chạy mock.
 * Đối chiếu với API khi mở giỏ và trang thanh toán, để khách thấy đúng trước khi đặt đơn.
 * Lỗi mạng hoặc 5xx thì giữ nguyên giỏ, không xóa món của khách chỉ vì không kết nối được.
 */
export function useCartSync() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setUnitPrice = useCartStore((s) => s.setUnitPrice);
  const [notice, setNotice] = useState<CartSyncNotice>({ removed: [], priceChanged: false });

  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  const results = useQueries({
    queries: productIds.map((id) => ({
      queryKey: productDetailKey(id),
      queryFn: () => fetchProduct(id),
      staleTime: 0,
    })),
  });

  useEffect(() => {
    const removed: string[] = [];
    let priceChanged = false;

    for (const item of items) {
      const result = results[productIds.indexOf(item.productId)];
      if (!result) continue;

      if (result.isError) {
        if (isNotFoundError(result.error)) {
          removeItem(item.lineId);
          removed.push(item.name);
        }
      } else if (result.data) {
        const outcome = reconcileLine(item, result.data);
        if (outcome.kind === 'remove') {
          removeItem(item.lineId);
          removed.push(item.name);
        } else if (outcome.kind === 'price') {
          setUnitPrice(item.lineId, outcome.unitPrice);
          priceChanged = true;
        }
      }
    }

    if (removed.length > 0 || priceChanged) {
      setNotice((prev) => ({
        removed: [...prev.removed, ...removed],
        priceChanged: prev.priceChanged || priceChanged,
      }));
    }
    // results là mảng mới sau mỗi render; effect chỉ cập nhật store khi thực sự có khác biệt nên không lặp vô hạn.
  }, [items, results, productIds, removeItem, setUnitPrice]);

  return { notice, checking: results.some((result) => result.isPending) };
}
