import type { Metadata } from 'next';
import { StaffOrdersScreen } from '@/features/staff/components/StaffOrdersScreen';

export const metadata: Metadata = { title: 'Quầy' };

export default function StaffPage() {
  return <StaffOrdersScreen />;
}
