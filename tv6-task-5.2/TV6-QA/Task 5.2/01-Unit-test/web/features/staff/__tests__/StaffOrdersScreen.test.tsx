import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store';
import { API_URL } from '@/lib/env';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Order } from '@/types';
import { StaffOrdersScreen } from '../components/StaffOrdersScreen';

const base: Order = {
  id: 'o-1',
  code: 'BL-1001',
  status: 'PAID',
  total: 57000,
  createdAt: '2026-10-31T03:00:00.000Z',
  customer: { name: 'Khách A', email: 'a@b.vn' },
  items: [{ productName: 'Cà phê sữa đá', sizeName: 'M', toppings: ['Kem cheese'], quantity: 2, unitPrice: 28500 }],
  payments: [{ id: 'p1', orderId: 'o-1', method: 'WALLET', status: 'SUCCESS' }],
};
const cash: Order = {
  ...base,
  id: 'o-2',
  code: 'BL-1002',
  status: 'PENDING_PAYMENT',
  payments: [{ id: 'p2', orderId: 'o-2', method: 'CASH', status: 'PENDING' }],
};
const onlinePending: Order = { ...base, id: 'o-3', code: 'BL-1003', status: 'PENDING_PAYMENT', payments: [] };
const done: Order = { ...base, id: 'o-4', code: 'BL-1004', status: 'COMPLETED' };

let orders: Order[];

const row = (code: string) => screen.getByText(code).closest('li') as HTMLElement;

beforeEach(() => {
  orders = [base, cash, onlinePending, done];
  useAuthStore.setState({
    token: 'mock-token-u-2',
    user: { id: 'u-2', name: 'NV', email: 'staff@brewlite.vn', role: 'STAFF' },
    hydrated: true,
  });
  server.use(http.get(`${API_URL}/orders/all`, () => HttpResponse.json(orders)));
});

describe('StaffOrdersScreen', () => {
  it('khách không vào được màn hình quầy', () => {
    useAuthStore.setState({ user: { id: 'u-1', name: 'K', email: 'k@b.vn', role: 'CUSTOMER' } });
    renderWithProviders(<StaffOrdersScreen />);
    expect(screen.getByText('Bạn không có quyền xem trang này')).toBeInTheDocument();
  });

  it('mặc định chỉ hiện đơn cần xử lý, kèm khách, món và phương thức', async () => {
    renderWithProviders(<StaffOrdersScreen />);

    const paid = within(await screen.findByText('BL-1001').then((el) => el.closest('li') as HTMLElement));
    expect(paid.getByText(/Khách A/)).toBeInTheDocument();
    expect(paid.getByText(/2 × Cà phê sữa đá \(M\), Kem cheese/)).toBeInTheDocument();
    expect(paid.getByText(/Ví BrewLite/)).toBeInTheDocument();
    expect(screen.getByText('BL-1002')).toBeInTheDocument();
    expect(screen.queryByText('BL-1003')).not.toBeInTheDocument(); // khách còn ở cổng thanh toán
    expect(screen.queryByText('BL-1004')).not.toBeInTheDocument(); // đã xong
  });

  it('bộ lọc Tất cả hiện mọi đơn', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StaffOrdersScreen />);
    await screen.findByText('BL-1001');

    await user.click(screen.getByRole('button', { name: 'Tất cả' }));

    expect(screen.getByText('BL-1003')).toBeInTheDocument();
    expect(screen.getByText('BL-1004')).toBeInTheDocument();
  });

  it('chuyển trạng thái đơn theo đúng bước tiếp theo', async () => {
    const user = userEvent.setup();
    let sent: unknown;
    server.use(
      http.patch(`${API_URL}/orders/o-1/status`, async ({ request }) => {
        sent = await request.json();
        orders = [{ ...base, status: 'PREPARING' }];
        return HttpResponse.json(orders[0]);
      }),
    );
    renderWithProviders(<StaffOrdersScreen />);
    await screen.findByText('BL-1001');

    await user.click(within(row('BL-1001')).getByRole('button', { name: 'Bắt đầu pha chế' }));

    expect(await screen.findByRole('button', { name: 'Pha chế xong' })).toBeInTheDocument();
    expect(sent).toEqual({ status: 'PREPARING' });
  });

  it('xác nhận đã thu tiền mặt', async () => {
    const user = userEvent.setup();
    let called = false;
    server.use(
      http.post(`${API_URL}/orders/o-2/confirm-cash`, () => {
        called = true;
        orders = [{ ...cash, status: 'PAID' }];
        return HttpResponse.json(orders[0], { status: 201 });
      }),
    );
    renderWithProviders(<StaffOrdersScreen />);
    await screen.findByText('BL-1002');

    await user.click(within(row('BL-1002')).getByRole('button', { name: 'Đã thu tiền mặt' }));

    await waitFor(() => expect(called).toBe(true));
    expect(await screen.findByRole('button', { name: 'Bắt đầu pha chế' })).toBeInTheDocument();
  });

  it('nhân viên khác vừa cập nhật: báo lỗi và tải lại danh sách', async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${API_URL}/orders/o-1/status`, () => {
        orders = [{ ...base, status: 'PREPARING' }];
        return HttpResponse.json({ statusCode: 409, message: 'Trạng thái đơn vừa bị thay đổi' }, { status: 409 });
      }),
    );
    renderWithProviders(<StaffOrdersScreen />);
    await screen.findByText('BL-1001');

    await user.click(within(row('BL-1001')).getByRole('button', { name: 'Bắt đầu pha chế' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Trạng thái đơn vừa bị thay đổi');
    expect(await screen.findByRole('button', { name: 'Pha chế xong' })).toBeInTheDocument();
  });
});
