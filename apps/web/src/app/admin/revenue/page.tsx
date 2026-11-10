import type { Metadata } from 'next';
import { AdminRevenueScreen } from '@/features/admin/components/AdminRevenueScreen';

export const metadata: Metadata = { title: 'Doanh thu' };

export default function AdminRevenuePage() {
  return <AdminRevenueScreen />;
}
