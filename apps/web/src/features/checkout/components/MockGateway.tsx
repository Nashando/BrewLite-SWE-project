import { Button } from '@/components/ui/Button';
import { PAYMENT_METHOD_LABEL } from '@/features/orders/components/OrderStatusBadge';
import { formatVND } from '@/lib/format';
import type { Order, PaymentMethod } from '@/types';
import type { SimulatedResult } from '../api';

interface MockGatewayProps {
  order: Order;
  method: PaymentMethod;
  pending: boolean;
  onResult: (result: SimulatedResult) => void;
  onBack: () => void;
}

/** Màn hình thay cho cổng thanh toán thật. Không kết nối MoMo hay VNPAY, không trừ tiền thật. */
export function MockGateway({ order, method, pending, onResult, onBack }: MockGatewayProps) {
  return (
    <section aria-label="Cổng thanh toán mô phỏng" className="mt-6 rounded-xl border border-line bg-white p-5">
      <p className="text-sm font-medium text-ink/70">Cổng thanh toán mô phỏng</p>
      <h2 className="mt-1 font-display text-2xl font-bold">{PAYMENT_METHOD_LABEL[method]}</h2>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink/70">Mã đơn</dt>
          <dd className="font-medium">{order.code}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ink/70">Số tiền</dt>
          <dd className="font-display text-xl font-bold tabular-nums">{formatVND(order.total)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-ink/70">Đây là màn hình mô phỏng, không trừ tiền thật.</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button disabled={pending} onClick={() => onResult('SUCCESS')}>
          {pending ? 'Đang xử lý…' : 'Xác nhận thanh toán'}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => onResult('FAILED')}>
          Mô phỏng thất bại
        </Button>
        <Button variant="secondary" disabled={pending} onClick={onBack}>
          Chọn phương thức khác
        </Button>
      </div>
    </section>
  );
}
