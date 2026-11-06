import type { Metadata } from 'next';
import { CheckoutScreen } from '@/features/checkout/components/CheckoutScreen';

export const metadata: Metadata = { title: 'Thanh toán' };

export default function CheckoutPage() {
  return <CheckoutScreen />;
}
