import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/store';
import { useCartStore } from '@/features/cart/store';
import type { CartItem } from '@/features/cart/types';
import { API_URL } from '@/lib/env';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Order } from '@/types';
import { CheckoutScreen } from '../components/CheckoutScreen';

const nav = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav }));

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

const order: Order = {
  id: 'o-1',
  code: 'BL-1001',
  status: 'PENDING_PAYMENT',
  total: 153000,
  createdAt: '2026-10-31T03:00:00.000Z',
  items: [],
};

interface PaymentBody {
  orderId: string;
  method: string;
  card?: { number: string };
}

// Ghi lại các request để kiểm tra đơn chỉ tạo một lần và khóa idempotency.
const calls = { orders: 0, payments: [] as { key: string | null; body: PaymentBody }[] };

const paymentResult = (status: 'SUCCESS' | 'FAILED', failureReason?: string) =>
  HttpResponse.json({ id: 'pay-1', orderId: 'o-1', method: 'CARD', status, failureReason });

function onPayment(responder: (callNumber: number, body: PaymentBody) => Response) {
  server.use(
    http.post(`${API_URL}/payments`, async ({ request }) => {
      const body = (await request.json()) as PaymentBody;
      calls.payments.push({ key: request.headers.get('idempotency-key'), body });
      return responder(calls.payments.length, body);
    }),
  );
}

const payButton = () => screen.getByRole('button', { name: /^Thanh toán/ });

async function fillCard(number: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('radio', { name: 'Thẻ ngân hàng' }));
  await user.type(screen.getByLabelText('Số thẻ'), number);
  await user.type(screen.getByLabelText('Hạn dùng (MM/YY)'), '12/40');
  await user.type(screen.getByLabelText('CVV'), '123');
  return user;
}

beforeEach(() => {
  localStorage.clear();
  nav.push.mockClear();
  calls.orders = 0;
  calls.payments = [];
  useAuthStore.setState({
    token: 'mock-token-u-1',
    user: { id: 'u-1', name: 'Khách demo', email: 'demo@brewlite.vn' },
    hydrated: true,
  });
  useCartStore.setState({ items: [latte, croissant], hydrated: true });
  server.use(
    http.post(`${API_URL}/orders`, () => {
      calls.orders += 1;
      return HttpResponse.json(order, { status: 201 });
    }),
  );
});

describe('CheckoutScreen', () => {
  it('hiển thị tóm tắt đơn hàng và tổng tiền', () => {
    renderWithProviders(<CheckoutScreen />);

    const summary = screen.getByRole('region', { name: 'Tóm tắt đơn hàng' });
    expect(within(summary).getByText('2 × Cà phê sữa đá')).toBeInTheDocument();
    expect(within(summary).getByText('Lớn, Kem cheese')).toBeInTheDocument();
    expect(within(summary).getByText(/153\.000\s₫/)).toBeInTheDocument(); // 57.000 x 2 + 39.000
  });

  it('yêu cầu đăng nhập khi chưa có phiên', () => {
    useAuthStore.setState({ token: null, user: null });
    renderWithProviders(<CheckoutScreen />);

    expect(screen.getByText('Bạn cần đăng nhập')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Tóm tắt đơn hàng' })).not.toBeInTheDocument();
  });

  it('hiển thị giỏ trống khi chưa có món', () => {
    useCartStore.setState({ items: [] });
    renderWithProviders(<CheckoutScreen />);

    expect(screen.getByText('Giỏ hàng đang trống')).toBeInTheDocument();
  });

  it('thanh toán bằng Ví: tạo đơn, thanh toán, xóa giỏ và chuyển tới đơn hàng', async () => {
    const user = userEvent.setup();
    onPayment(() => paymentResult('SUCCESS'));
    renderWithProviders(<CheckoutScreen />);

    await user.click(payButton());

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
    expect(calls.orders).toBe(1);
    expect(calls.payments).toHaveLength(1);
    expect(calls.payments[0].body).toMatchObject({ orderId: 'o-1', method: 'WALLET' });
    expect(calls.payments[0].key).toBeTruthy();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('không gửi request khi thông tin thẻ không hợp lệ', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutScreen />);

    await user.click(screen.getByRole('radio', { name: 'Thẻ ngân hàng' }));
    await user.type(screen.getByLabelText('Số thẻ'), '1234');
    await user.click(payButton());

    expect(await screen.findByText('Số thẻ gồm 16 chữ số')).toBeInTheDocument();
    expect(screen.getByText('Nhập hạn dùng dạng MM/YY')).toBeInTheDocument();
    expect(screen.getByText('CVV gồm 3 hoặc 4 chữ số')).toBeInTheDocument();
    expect(calls.orders).toBe(0);
    expect(calls.payments).toHaveLength(0);
  });

  it('thẻ bị từ chối: báo lỗi, giữ đơn, thử lại với khóa mới và thành công', async () => {
    onPayment((_, body) =>
      body.card?.number.startsWith('4000')
        ? paymentResult('FAILED', 'Thẻ bị từ chối')
        : paymentResult('SUCCESS'),
    );
    renderWithProviders(<CheckoutScreen />);

    const user = await fillCard('4000 0000 0000 0002');
    await user.click(payButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Thanh toán không thành công');
    expect(screen.getByRole('alert')).toHaveTextContent('Thẻ bị từ chối');
    expect(nav.push).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toHaveLength(2); // giỏ vẫn còn

    await user.clear(screen.getByLabelText('Số thẻ'));
    await user.type(screen.getByLabelText('Số thẻ'), '4242 4242 4242 4242');
    await user.click(screen.getByRole('button', { name: 'Thử thanh toán lại' }));

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
    expect(calls.orders).toBe(1); // không tạo đơn thứ hai
    expect(calls.payments).toHaveLength(2);
    expect(calls.payments[0].body.card?.number).toBe('4000000000000002'); // đã bỏ khoảng trắng
    expect(calls.payments[1].key).not.toBe(calls.payments[0].key);
  });

  it('lỗi mạng: thử lại dùng lại đúng Idempotency-Key và không tạo đơn mới', async () => {
    const user = userEvent.setup();
    onPayment((callNumber) =>
      callNumber === 1 ? HttpResponse.error() : paymentResult('SUCCESS'),
    );
    renderWithProviders(<CheckoutScreen />);

    await user.click(payButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('Không kết nối được tới máy chủ');

    await user.click(screen.getByRole('button', { name: 'Thử thanh toán lại' }));

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
    expect(calls.orders).toBe(1);
    expect(calls.payments).toHaveLength(2);
    expect(calls.payments[1].key).toBe(calls.payments[0].key);
  });

  it('bấm đúp chỉ gửi một yêu cầu thanh toán', async () => {
    const user = userEvent.setup();
    onPayment(() => paymentResult('SUCCESS'));
    renderWithProviders(<CheckoutScreen />);

    await user.dblClick(payButton());

    await waitFor(() => expect(nav.push).toHaveBeenCalled());
    expect(calls.orders).toBe(1);
    expect(calls.payments).toHaveLength(1);
  });

  it('có món hết hàng: báo lỗi, không thanh toán, dẫn về giỏ hàng', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${API_URL}/orders`, () =>
        HttpResponse.json(
          { statusCode: 409, code: 'OUT_OF_STOCK', message: 'Trà sen vàng đã hết hàng' },
          { status: 409 },
        ),
      ),
    );
    onPayment(() => paymentResult('SUCCESS'));
    renderWithProviders(<CheckoutScreen />);

    await user.click(payButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Trà sen vàng đã hết hàng');
    expect(screen.getByRole('link', { name: 'Quay lại giỏ hàng' })).toHaveAttribute('href', '/cart');
    expect(calls.payments).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Thử thanh toán lại' })).toBeDisabled();
  });

  describe('thanh toán bị 409', () => {
    const conflict = () =>
      HttpResponse.json({ statusCode: 409, message: 'Đơn không thanh toán được' }, { status: 409 });
    const orderStatus = (status: Order['status']) =>
      server.use(http.get(`${API_URL}/orders/o-1`, () => HttpResponse.json({ ...order, status })));

    it('đơn đã hết hạn: báo lỗi, chưa tự tạo đơn, lần thử sau mới tạo đơn mới', async () => {
      const user = userEvent.setup();
      orderStatus('CANCELLED');
      onPayment((callNumber) => (callNumber === 1 ? conflict() : paymentResult('SUCCESS')));
      renderWithProviders(<CheckoutScreen />);

      await user.click(payButton());

      expect(await screen.findByRole('alert')).toHaveTextContent('Đơn hàng không còn hiệu lực');
      expect(calls.orders).toBe(1);
      expect(nav.push).not.toHaveBeenCalled();
      expect(useCartStore.getState().items).toHaveLength(2);

      await user.click(screen.getByRole('button', { name: 'Thử thanh toán lại' }));

      await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
      expect(calls.orders).toBe(2);
      expect(calls.payments[1].key).not.toBe(calls.payments[0].key);
    });

    it('đơn thực ra đã được thanh toán: coi như thành công, không tạo đơn mới', async () => {
      const user = userEvent.setup();
      orderStatus('PAID');
      onPayment(conflict);
      renderWithProviders(<CheckoutScreen />);

      await user.click(payButton());

      await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
      expect(calls.orders).toBe(1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('không đọc được trạng thái đơn: báo lỗi gốc, giữ đơn và giỏ hàng', async () => {
      const user = userEvent.setup();
      server.use(http.get(`${API_URL}/orders/o-1`, () => HttpResponse.error()));
      onPayment(conflict);
      renderWithProviders(<CheckoutScreen />);

      await user.click(payButton());

      expect(await screen.findByRole('alert')).toHaveTextContent('Đơn không thanh toán được');
      expect(nav.push).not.toHaveBeenCalled();
      expect(useCartStore.getState().items).toHaveLength(2);

      await user.click(screen.getByRole('button', { name: 'Thử thanh toán lại' }));
      await waitFor(() => expect(calls.payments).toHaveLength(2));
      expect(calls.orders).toBe(1);
    });
  });
});
