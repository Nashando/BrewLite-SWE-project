import type { Order, OrderStatus, PaymentMethod } from '@/types';

export const ORDER_STATUS: Record<OrderStatus, { label: string; hint: string; style: string }> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    hint: 'Đơn chưa được thanh toán.',
    style: 'bg-crema/40 text-ink',
  },
  PAID: {
    label: 'Đã thanh toán',
    hint: 'Đã nhận thanh toán. Quầy sẽ sớm bắt đầu pha chế.',
    style: 'bg-pine/10 text-pine',
  },
  PREPARING: {
    label: 'Đang pha chế',
    hint: 'Quầy đang chuẩn bị đồ uống của bạn.',
    style: 'bg-pine/10 text-pine',
  },
  READY: {
    label: 'Sẵn sàng nhận',
    hint: 'Đồ uống đã xong, mời bạn ra quầy nhận.',
    style: 'bg-pine/10 text-pine',
  },
  COMPLETED: { label: 'Hoàn tất', hint: 'Cảm ơn bạn đã đặt hàng.', style: 'bg-ink/10 text-ink' },
  CANCELLED: { label: 'Đã hủy', hint: 'Đơn này đã bị hủy.', style: 'bg-danger/10 text-danger' },
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  WALLET: 'Ví BrewLite',
  CARD: 'Thẻ ngân hàng',
  CASH: 'Tiền mặt tại quầy',
};

/** Đơn đang chờ khách trả tiền mặt tại quầy. */
export const isWaitingCash = (order: Order) =>
  order.status === 'PENDING_PAYMENT' &&
  (order.payments ?? []).some((p) => p.method === 'CASH' && p.status === 'PENDING');

/** Khớp API: chỉ hủy được khi chưa bắt đầu pha chế. */
export const canCancel = (status: OrderStatus) => status === 'PENDING_PAYMENT' || status === 'PAID';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS[status].style}`}
    >
      {ORDER_STATUS[status].label}
    </span>
  );
}
