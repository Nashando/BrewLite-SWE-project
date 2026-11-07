import type { Metadata } from 'next';
import { AdminProductsScreen } from '@/features/admin/components/AdminProductsScreen';

export const metadata: Metadata = { title: 'Quản lý món' };

export default function AdminProductsPage() {
  return <AdminProductsScreen />;
}
