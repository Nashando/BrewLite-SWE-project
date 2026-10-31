import type { Metadata } from 'next';
import { ProductDetailScreen } from '@/features/product/components/ProductDetailScreen';

export const metadata: Metadata = { title: 'Chi tiết món' };

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key={id}: chuyển sang món khác thì reset lựa chọn size, topping, số lượng.
  return <ProductDetailScreen key={id} id={id} />;
}
