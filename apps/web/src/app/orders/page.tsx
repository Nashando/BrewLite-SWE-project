import type { Metadata } from 'next';
import { OrdersScreen } from '@/features/orders/components/OrdersScreen';

export const metadata: Metadata = { title: 'Đơn hàng' };

export default function OrdersPage() {
  return <OrdersScreen />;
}
