import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store';
import { API_URL } from '@/lib/env';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Order } from '@/types';
import { OrderDetailScreen } from '../components/OrderDetailScreen';
import { OrdersScreen } from '../components/OrdersScreen';

const preparing: Order = {
  id: 'o-2',
  code: 'BL-1002',
  status: 'PREPARING',
  total: 153000,
  createdAt: '2026-10-31T03:00:00.000Z',
  items: [
    { productName: 'Cà phê sữa đá', sizeName: 'Lớn', toppings: ['Kem cheese'], quantity: 2, unitPrice: 57000 },
    { productName: 'Bánh croissant bơ', sizeName: null, toppings: [], quantity: 1, unitPrice: 39000 },
  ],
};

const completed: Order = { ...preparing, id: 'o-1', code: 'BL-1001', status: 'COMPLETED' };

const currentStep = () =>
  screen.getAllByRole('listitem').find((li) => li.getAttribute('aria-current') === 'step');

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    token: 'mock-token-u-1',
    user: { id: 'u-1', name: 'Khách demo', email: 'demo@brewlite.vn' },
    hydrated: true,
  });
});

describe('OrdersScreen (lịch sử đơn)', () => {
  it('hiển thị trạng thái loading rồi danh sách đơn', async () => {
    server.use(http.get(`${API_URL}/orders`, () => HttpResponse.json([preparing, completed])));
    renderWithProviders(<OrdersScreen />);

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải đơn hàng');

    const link = (await screen.findByText('BL-1002')).closest('a');
    expect(link).toHaveAttribute('href', '/orders/o-2');
    expect(within(link as HTMLElement).getByText('Đang pha chế')).toBeInTheDocument();
    expect(within(link as HTMLElement).getByText(/153\.000\s₫/)).toBeInTheDocument();
    expect(screen.getByText('Hoàn tất')).toBeInTheDocument();
  });

  it('hiển thị trạng thái empty khi chưa có đơn', async () => {
    server.use(http.get(`${API_URL}/orders`, () => HttpResponse.json([])));
    renderWithProviders(<OrdersScreen />);

    expect(await screen.findByText('Chưa có đơn hàng nào')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem menu' })).toHaveAttribute('href', '/menu');
  });

  it('hiển thị lỗi và cho phép thử lại', async () => {
    const user = userEvent.setup();
    server.use(http.get(`${API_URL}/orders`, () => HttpResponse.json({ message: 'boom' }, { status: 500 })));
    renderWithProviders(<OrdersScreen />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được đơn hàng');

    server.use(http.get(`${API_URL}/orders`, () => HttpResponse.json([preparing])));
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText('BL-1002')).toBeInTheDocument();
  });

  it('yêu cầu đăng nhập khi chưa có phiên', () => {
    useAuthStore.setState({ token: null, user: null });
    renderWithProviders(<OrdersScreen />);

    expect(screen.getByText('Bạn cần đăng nhập')).toBeInTheDocument();
  });
});

describe('OrderDetailScreen (xác nhận và trạng thái đơn)', () => {
  it('hiển thị mã đơn, trạng thái, tiến trình, món đã đặt và tổng tiền', async () => {
    server.use(http.get(`${API_URL}/orders/o-2`, () => HttpResponse.json(preparing)));
    renderWithProviders(<OrderDetailScreen id="o-2" />);

    expect(await screen.findByRole('heading', { name: 'Đơn BL-1002' })).toBeInTheDocument();
    expect(currentStep()).toHaveTextContent('Đang pha chế');
    expect(screen.getByText('Quầy đang chuẩn bị đồ uống của bạn.')).toBeInTheDocument();

    const items = screen.getByRole('region', { name: 'Món đã đặt' });
    expect(within(items).getByText('2 × Cà phê sữa đá')).toBeInTheDocument();
    expect(within(items).getByText('Lớn, Kem cheese')).toBeInTheDocument();
    expect(within(items).getByText(/153\.000\s₫/)).toBeInTheDocument();
  });

  it('cập nhật trạng thái khi bấm Làm mới', async () => {
    const user = userEvent.setup();
    let calls = 0;
    server.use(
      http.get(`${API_URL}/orders/o-2`, () => {
        calls += 1;
        return HttpResponse.json({ ...preparing, status: calls === 1 ? 'PREPARING' : 'READY' });
      }),
    );
    renderWithProviders(<OrderDetailScreen id="o-2" />);
    await screen.findByRole('heading', { name: 'Đơn BL-1002' });
    expect(currentStep()).toHaveTextContent('Đang pha chế');

    await user.click(screen.getByRole('button', { name: 'Làm mới' }));

    await waitFor(() => expect(currentStep()).toHaveTextContent('Sẵn sàng nhận'));
  });

  it('đơn chờ thanh toán không có tiến trình', async () => {
    server.use(
      http.get(`${API_URL}/orders/o-2`, () =>
        HttpResponse.json({ ...preparing, status: 'PENDING_PAYMENT' }),
      ),
    );
    renderWithProviders(<OrderDetailScreen id="o-2" />);

    expect(await screen.findByText('Đơn chưa được thanh toán.')).toBeInTheDocument();
    expect(currentStep()).toBeUndefined();
  });

  it('hiển thị "không tìm thấy" khi đơn không tồn tại', async () => {
    server.use(
      http.get(`${API_URL}/orders/khong-co`, () =>
        HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy đơn' }, { status: 404 }),
      ),
    );
    renderWithProviders(<OrderDetailScreen id="khong-co" />);

    expect(await screen.findByText('Không tìm thấy đơn')).toBeInTheDocument();
  });
});
