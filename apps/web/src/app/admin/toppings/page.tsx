import type { Metadata } from 'next';
import { AdminToppingsScreen } from '@/features/admin/components/AdminToppingsScreen';

export const metadata: Metadata = { title: 'Quản lý topping' };

export default function AdminToppingsPage() {
  return <AdminToppingsScreen />;
}
