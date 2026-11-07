import type { Metadata } from 'next';
import { MenuScreen } from '@/features/menu/components/MenuScreen';

export const metadata: Metadata = { title: 'Menu' };

export default function MenuPage() {
  return <MenuScreen />;
}
