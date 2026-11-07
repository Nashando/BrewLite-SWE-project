'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/errors';
import { useCancelOrder } from '../hooks/useOrders';

/** Hủy đơn không hoàn tác được nên hỏi lại một bước trước khi gửi. */
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [confirming, setConfirming] = useState(false);
  const cancel = useCancelOrder();

  if (!confirming) {
    return (
      <Button variant="secondary" onClick={() => setConfirming(true)}>
        Hủy đơn
      </Button>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium">Hủy đơn này? Thao tác không thể hoàn tác.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          disabled={cancel.isPending}
          onClick={() => cancel.mutate(orderId, { onSuccess: () => setConfirming(false) })}
        >
          {cancel.isPending ? 'Đang hủy…' : 'Xác nhận hủy'}
        </Button>
        <Button variant="secondary" disabled={cancel.isPending} onClick={() => setConfirming(false)}>
          Giữ đơn
        </Button>
      </div>
      {cancel.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {getErrorMessage(cancel.error)}
        </p>
      )}
    </div>
  );
}
