import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_URL } from '@/lib/env';
import { mockProducts } from '@/mocks/data';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MenuScreen } from '../components/MenuScreen';

const productsUrl = `${API_URL}/products`;
const firstProduct = mockProducts[0].name;

describe('MenuScreen', () => {
  it('hiển thị trạng thái loading khi đang tải', async () => {
    renderWithProviders(<MenuScreen />);

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải menu');

    // Chờ dữ liệu về để test kết thúc sạch sẽ
    await screen.findByText(firstProduct);
  });

  it('hiển thị toàn bộ sản phẩm với giá VND', async () => {
    renderWithProviders(<MenuScreen />);

    await screen.findByText(firstProduct);
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(
      mockProducts.length,
    );
    expect(screen.getAllByText(/35\.000\s₫/).length).toBeGreaterThan(0);
  });

  it('hiển thị trạng thái empty khi menu không có món nào', async () => {
    server.use(http.get(productsUrl, () => HttpResponse.json([])));
    renderWithProviders(<MenuScreen />);

    expect(await screen.findByText('Menu đang trống')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tải lại menu' })).toBeInTheDocument();
  });

  it('hiển thị lỗi máy chủ và cho phép thử lại', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(productsUrl, () => HttpResponse.json({ message: 'boom' }, { status: 500 })),
    );
    renderWithProviders(<MenuScreen />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không tải được menu');
    expect(alert).toHaveTextContent('Máy chủ đang gặp sự cố');

    // Backend hồi phục, người dùng bấm "Thử lại"
    server.use(http.get(productsUrl, () => HttpResponse.json(mockProducts)));
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText(firstProduct)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hiển thị lỗi mạng khi không kết nối được API', async () => {
    server.use(http.get(productsUrl, () => HttpResponse.error()));
    renderWithProviders(<MenuScreen />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Không kết nối được tới máy chủ');
  });

  it('lọc sản phẩm theo danh mục', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MenuScreen />);
    await screen.findByText('Cà phê sữa đá');

    await user.click(screen.getByRole('button', { name: 'Trà' }));

    expect(screen.getByText('Trà đào cam sả')).toBeInTheDocument();
    expect(screen.queryByText('Cà phê sữa đá')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tất cả' }));
    expect(screen.getByText('Cà phê sữa đá')).toBeInTheDocument();
  });

  it('đánh dấu món hết hàng', async () => {
    renderWithProviders(<MenuScreen />);
    const row = (await screen.findByText('Trà sen vàng')).closest('li') as HTMLElement;

    expect(within(row).getByText('Hết hàng')).toBeInTheDocument();
  });

  it('mỗi món dẫn tới trang chi tiết', async () => {
    renderWithProviders(<MenuScreen />);
    const link = (await screen.findByText(firstProduct)).closest('a');

    expect(link).toHaveAttribute('href', `/products/${mockProducts[0].id}`);
  });

  it('có liên kết tới giỏ hàng trên header', async () => {
    renderWithProviders(<MenuScreen />);
    await screen.findByText(firstProduct);

    expect(screen.getByRole('link', { name: 'Giỏ hàng' })).toHaveAttribute('href', '/cart');
  });
});
