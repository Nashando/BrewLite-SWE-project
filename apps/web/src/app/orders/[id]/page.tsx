import type { Metadata } from 'next';
import { OrderDetailScreen } from '@/features/orders/components/OrderDetailScreen';

export const metadata: Metadata = { title: 'Chi tiết đơn' };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailScreen key={id} id={id} />;
}
