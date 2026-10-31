import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '@/features/cart/store';
import { API_URL } from '@/lib/env';
import { mockProductDetails } from '@/mocks/data';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ProductDetailScreen } from '../components/ProductDetailScreen';

const latte = mockProductDetails.find((p) => p.id === 'p-01')!;

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], hydrated: true });
});

async function renderLatte() {
  renderWithProviders(<ProductDetailScreen id="p-01" />);
  await screen.findByRole('heading', { name: latte.name });
  return screen.getByRole('region', { name: 'Số lượng và giá' });
}

describe('ProductDetailScreen', () => {
  it('hiển thị trạng thái loading khi đang tải', async () => {
    renderWithProviders(<ProductDetailScreen id="p-01" />);

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải món');

    await screen.findByRole('heading', { name: latte.name });
  });

  it('hiển thị size, topping và chọn sẵn size đầu tiên', async () => {
    const bar = await renderLatte();

    expect(screen.getByRole('radio', { name: /Nhỏ/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Lớn/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Kem cheese/ })).not.toBeChecked();
    expect(within(bar).getByRole('button', { name: /Thêm vào giỏ.*35\.000\s₫/ })).toBeEnabled();
  });

  it('cập nhật giá khi đổi size, thêm topping và đổi số lượng', async () => {
    const user = userEvent.setup();
    const bar = await renderLatte();

    await user.click(screen.getByRole('radio', { name: /Lớn/ })); // 35.000 + 12.000
    expect(within(bar).getByRole('button', { name: /47\.000\s₫/ })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Kem cheese/ })); // + 10.000
    expect(within(bar).getByRole('button', { name: /57\.000\s₫/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `Tăng số lượng ${latte.name}` }));
    expect(within(bar).getByRole('button', { name: /114\.000\s₫/ })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Kem cheese/ })); // bỏ topping
    expect(within(bar).getByRole('button', { name: /94\.000\s₫/ })).toBeInTheDocument(); // 47.000 x 2
  });

  it('không cho giảm số lượng dưới 1', async () => {
    await renderLatte();

    expect(screen.getByRole('button', { name: `Giảm số lượng ${latte.name}` })).toBeDisabled();
  });

  it('thêm vào giỏ với đúng lựa chọn và hiện thông báo', async () => {
    const user = userEvent.setup();
    await renderLatte();

    await user.click(screen.getByRole('radio', { name: /Lớn/ }));
    await user.click(screen.getByRole('checkbox', { name: /Kem cheese/ }));
    await user.click(screen.getByRole('button', { name: `Tăng số lượng ${latte.name}` }));
    await user.click(screen.getByRole('button', { name: /Thêm vào giỏ/ }));

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]).toMatchObject({
      productId: 'p-01',
      sizeId: 'size-l',
      sizeName: 'Lớn',
      toppings: [{ id: 'top-cheese', name: 'Kem cheese', price: 10000 }],
      unitPrice: 57000,
      quantity: 2,
    });
    expect(await screen.findByText('Đã thêm 2 Cà phê sữa đá vào giỏ')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem giỏ hàng' })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: 'Giỏ hàng, 2 món' })).toBeInTheDocument();
  });

  it('món không có size (bánh) vẫn thêm được vào giỏ', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductDetailScreen id="p-10" />);
    await screen.findByRole('heading', { name: 'Bánh croissant bơ' });

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Thêm vào giỏ/ }));

    expect(useCartStore.getState().items[0]).toMatchObject({
      productId: 'p-10',
      sizeId: null,
      sizeName: null,
      unitPrice: 39000,
    });
  });

  it('món hết hàng không thêm được vào giỏ', async () => {
    renderWithProviders(<ProductDetailScreen id="p-07" />);
    await screen.findByRole('heading', { name: 'Trà sen vàng' });

    expect(screen.getByRole('button', { name: 'Hết hàng' })).toBeDisabled();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('hiển thị "không tìm thấy" khi món không tồn tại', async () => {
    renderWithProviders(<ProductDetailScreen id="khong-ton-tai" />);

    expect(await screen.findByText('Không tìm thấy món')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về menu' })).toHaveAttribute('href', '/menu');
  });

  it('hiển thị lỗi máy chủ và cho phép thử lại', async () => {
    const user = userEvent.setup();
    const url = `${API_URL}/products/p-01`;
    server.use(http.get(url, () => HttpResponse.json({ message: 'boom' }, { status: 500 })));
    renderWithProviders(<ProductDetailScreen id="p-01" />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được món');

    server.use(http.get(url, () => HttpResponse.json(latte)));
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByRole('heading', { name: latte.name })).toBeInTheDocument();
  });
});
