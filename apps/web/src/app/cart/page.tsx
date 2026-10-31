import type { Metadata } from 'next';
import { CartScreen } from '@/features/cart/components/CartScreen';

export const metadata: Metadata = { title: 'Giỏ hàng' };

export default function CartPage() {
  return <CartScreen />;
}
