import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CartScreen } from '../components/CartScreen';
import { useCartStore } from '../store';
import type { CartItem } from '../types';

const latte: CartItem = {
  lineId: 'p-01|size-l|top-cheese',
  productId: 'p-01',
  name: 'Cà phê sữa đá',
  category: 'Cà phê',
  imageUrl: null,
  sizeId: 'size-l',
  sizeName: 'Lớn',
  toppings: [{ id: 'top-cheese', name: 'Kem cheese', price: 10000 }],
  unitPrice: 57000,
  quantity: 2,
};

const croissant: CartItem = {
  lineId: 'p-10|none',
  productId: 'p-10',
  name: 'Bánh croissant bơ',
  category: 'Bánh',
  imageUrl: null,
  sizeId: null,
  sizeName: null,
  toppings: [],
  unitPrice: 39000,
  quantity: 1,
};

const summary = () => screen.getByRole('region', { name: 'Tổng cộng' });

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], hydrated: true });
});

describe('CartScreen', () => {
  it('hiển thị loading khi chưa đọc xong giỏ từ localStorage', () => {
    useCartStore.setState({ hydrated: false });
    renderWithProviders(<CartScreen />);

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải giỏ hàng');
  });

  it('hiển thị trạng thái giỏ trống kèm đường dẫn về menu', () => {
    renderWithProviders(<CartScreen />);

    expect(screen.getByText('Giỏ hàng đang trống')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem menu' })).toHaveAttribute('href', '/menu');
    expect(screen.queryByRole('region', { name: 'Tổng cộng' })).not.toBeInTheDocument();
  });

  it('hiển thị các dòng, tùy chọn và tổng tiền', () => {
    useCartStore.setState({ items: [latte, croissant] });
    renderWithProviders(<CartScreen />);

    expect(screen.getByText('Lớn, Kem cheese')).toBeInTheDocument();
    expect(within(summary()).getByText(/153\.000\s₫/)).toBeInTheDocument(); // 57.000 x 2 + 39.000
    expect(within(summary()).getByText('Tổng cộng (3 món)')).toBeInTheDocument();
  });

  it('cập nhật tổng tiền khi tăng giảm số lượng', async () => {
    const user = userEvent.setup();
    useCartStore.setState({ items: [latte, croissant] });
    renderWithProviders(<CartScreen />);

    await user.click(screen.getByRole('button', { name: 'Tăng số lượng Bánh croissant bơ' }));
    expect(within(summary()).getByText(/192\.000\s₫/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Giảm số lượng Cà phê sữa đá' }));
    expect(within(summary()).getByText(/135\.000\s₫/)).toBeInTheDocument(); // 57.000 + 78.000
  });

  it('xóa một dòng khỏi giỏ', async () => {
    const user = userEvent.setup();
    useCartStore.setState({ items: [latte, croissant] });
    renderWithProviders(<CartScreen />);

    await user.click(screen.getByRole('button', { name: 'Xóa Cà phê sữa đá khỏi giỏ' }));

    expect(screen.queryByText('Cà phê sữa đá')).not.toBeInTheDocument();
    expect(within(summary()).getByText(/39\.000\s₫/)).toBeInTheDocument();
  });

  it('về trạng thái trống khi xóa dòng cuối cùng', async () => {
    const user = userEvent.setup();
    useCartStore.setState({ items: [croissant] });
    renderWithProviders(<CartScreen />);

    await user.click(screen.getByRole('button', { name: 'Xóa Bánh croissant bơ khỏi giỏ' }));

    expect(screen.getByText('Giỏ hàng đang trống')).toBeInTheDocument();
  });
});
