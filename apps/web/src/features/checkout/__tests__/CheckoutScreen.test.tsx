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
  simulate?: string;
}

// Ghi lại các request để kiểm tra số đơn đã tạo và khóa idempotency.
const calls = { orders: 0, payments: [] as { key: string | null; body: PaymentBody }[] };

const paid = () =>
  HttpResponse.json({ id: 'pay-1', orderId: 'o-1', method: 'MOMO', status: 'SUCCESS' }, { status: 201 });

const declined = () =>
  HttpResponse.json(
    { statusCode: 402, code: 'PAYMENT_FAILED', message: 'Thanh toán thất bại, vui lòng thử lại.' },
    { status: 402 },
  );

function onPayment(responder: (callNumber: number, body: PaymentBody) => Response) {
  server.use(
    http.post(`${API_URL}/payments`, async ({ request }) => {
      const body = (await request.json()) as PaymentBody;
      calls.payments.push({ key: request.headers.get('idempotency-key'), body });
      return responder(calls.payments.length, body);
    }),
  );
}

const submitButton = () => screen.getByRole('button', { name: /^Xác nhận đặt hàng/ });
const retryButton = () => screen.getByRole('button', { name: 'Thử thanh toán lại' });
const gateway = () => screen.findByRole('region', { name: 'Cổng thanh toán mô phỏng' });
const confirmOnGateway = () => screen.getByRole('button', { name: 'Xác nhận thanh toán' });

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
  it('hiển thị tóm tắt đơn hàng, tổng tiền và 3 phương thức thanh toán', () => {
    renderWithProviders(<CheckoutScreen />);

    const summary = screen.getByRole('region', { name: 'Tóm tắt đơn hàng' });
    expect(within(summary).getByText('2 × Cà phê sữa đá')).toBeInTheDocument();
    expect(within(summary).getByText('Lớn, Kem cheese')).toBeInTheDocument();
    expect(within(summary).getByText(/153\.000\s₫/)).toBeInTheDocument(); // 57.000 x 2 + 39.000
    for (const name of ['MoMo', 'VNPAY', 'Tiền mặt tại quầy']) {
      expect(screen.getByRole('radio', { name })).toBeInTheDocument();
    }
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

  it.each(['MoMo', 'VNPAY'])('%s: tạo đơn, qua cổng giả lập, xóa giỏ và chuyển tới đơn hàng', async (name) => {
    const user = userEvent.setup();
    onPayment(paid);
    renderWithProviders(<CheckoutScreen />);

    await user.click(screen.getByRole('radio', { name }));
    await user.click(submitButton());

    const screenGateway = await gateway();
    expect(within(screenGateway).getByText('BL-1001')).toBeInTheDocument();
    expect(within(screenGateway).getByText(name)).toBeInTheDocument();
    expect(calls.orders).toBe(1);
    expect(calls.payments).toHaveLength(0); // chưa thanh toán khi khách chưa xác nhận

    await user.click(confirmOnGateway());

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
    expect(calls.payments[0].body).toMatchObject({
      orderId: 'o-1',
      method: name === 'MoMo' ? 'MOMO' : 'VNPAY',
      simulate: 'SUCCESS',
    });
    expect(calls.payments[0].key).toBeTruthy();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('tiền mặt: không qua cổng giả lập, đơn chờ thu tại quầy', async () => {
    const user = userEvent.setup();
    onPayment(() =>
      HttpResponse.json({ id: 'pay-1', orderId: 'o-1', method: 'CASH', status: 'PENDING' }, { status: 201 }),
    );
    renderWithProviders(<CheckoutScreen />);

    await user.click(screen.getByRole('radio', { name: 'Tiền mặt tại quầy' }));
    expect(screen.getByText(/ra quầy trả tiền/)).toBeInTheDocument();
    await user.click(submitButton());

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
    expect(calls.payments[0].body).toEqual({ orderId: 'o-1', method: 'CASH' });
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('thất bại: báo lỗi, giữ giỏ, thử lại tạo đơn mới với khóa mới', async () => {
    const user = userEvent.setup();
    onPayment((_, body) => (body.simulate === 'FAILED' ? declined() : paid()));
    renderWithProviders(<CheckoutScreen />);

    await user.click(submitButton());
    await gateway();
    await user.click(screen.getByRole('button', { name: 'Mô phỏng thất bại' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Thanh toán thất bại, vui lòng thử lại.');
    expect(screen.getByRole('alert')).toHaveTextContent('chưa bị trừ tiền');
    expect(nav.push).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toHaveLength(2);
    expect(calls.orders).toBe(1);

    await user.click(retryButton());
    await gateway();
    expect(calls.orders).toBe(2);
    await user.click(confirmOnGateway());

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
    expect(calls.payments[1].key).not.toBe(calls.payments[0].key);
  });

  it('lỗi mạng: ở lại cổng giả lập, thử lại dùng đúng khóa và không tạo đơn mới', async () => {
    const user = userEvent.setup();
    onPayment((callNumber) => (callNumber === 1 ? HttpResponse.error() : paid()));
    renderWithProviders(<CheckoutScreen />);

    await user.click(submitButton());
    await gateway();
    await user.click(confirmOnGateway());
    expect(await screen.findByRole('alert')).toHaveTextContent('Không kết nối được tới máy chủ');

    await user.click(confirmOnGateway());

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
    expect(calls.orders).toBe(1);
    expect(calls.payments).toHaveLength(2);
    expect(calls.payments[1].key).toBe(calls.payments[0].key);
  });

  it('chọn phương thức khác từ cổng giả lập: dùng lại đơn đang giữ', async () => {
    const user = userEvent.setup();
    onPayment(paid);
    renderWithProviders(<CheckoutScreen />);

    await user.click(submitButton());
    await gateway();
    await user.click(screen.getByRole('button', { name: 'Chọn phương thức khác' }));
    await user.click(screen.getByRole('radio', { name: 'Tiền mặt tại quầy' }));
    await user.click(submitButton());

    await waitFor(() => expect(nav.push).toHaveBeenCalled());
    expect(calls.orders).toBe(1);
    expect(calls.payments[0].body.method).toBe('CASH');
  });

  it('bấm đúp chỉ tạo một đơn và gửi một yêu cầu thanh toán', async () => {
    const user = userEvent.setup();
    onPayment(paid);
    renderWithProviders(<CheckoutScreen />);

    await user.dblClick(submitButton());
    await gateway();
    await user.dblClick(confirmOnGateway());

    await waitFor(() => expect(nav.push).toHaveBeenCalled());
    expect(calls.orders).toBe(1);
    expect(calls.payments).toHaveLength(1);
  });

  it('có món hết hàng: báo lỗi, không thanh toán, dẫn về giỏ hàng', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${API_URL}/orders`, () =>
        HttpResponse.json(
          { statusCode: 400, code: 'OUT_OF_STOCK', message: 'Sản phẩm "Trà sen vàng" không đủ số lượng tồn kho.' },
          { status: 400 },
        ),
      ),
    );
    onPayment(paid);
    renderWithProviders(<CheckoutScreen />);

    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('không đủ số lượng tồn kho');
    expect(screen.getByRole('link', { name: 'Quay lại giỏ hàng' })).toHaveAttribute('href', '/cart');
    expect(calls.payments).toHaveLength(0);
    expect(retryButton()).toBeDisabled();
  });

  describe('thanh toán bị 409', () => {
    const conflict = () =>
      HttpResponse.json({ statusCode: 409, message: 'Đơn không thanh toán được' }, { status: 409 });
    const orderStatus = (status: Order['status']) =>
      server.use(http.get(`${API_URL}/orders/o-1`, () => HttpResponse.json({ ...order, status })));

    async function payOnGateway(user: ReturnType<typeof userEvent.setup>) {
      await user.click(submitButton());
      await gateway();
      await user.click(confirmOnGateway());
    }

    it('đơn đã hết hạn: báo lỗi, chưa tự tạo đơn, lần thử sau mới tạo đơn mới', async () => {
      const user = userEvent.setup();
      orderStatus('CANCELLED');
      onPayment((callNumber) => (callNumber === 1 ? conflict() : paid()));
      renderWithProviders(<CheckoutScreen />);

      await payOnGateway(user);

      expect(await screen.findByRole('alert')).toHaveTextContent('Đơn hàng không còn hiệu lực');
      expect(calls.orders).toBe(1);
      expect(nav.push).not.toHaveBeenCalled();
      expect(useCartStore.getState().items).toHaveLength(2);

      await user.click(retryButton());
      await gateway();
      expect(calls.orders).toBe(2);
      await user.click(confirmOnGateway());

      await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
      expect(calls.payments[1].key).not.toBe(calls.payments[0].key);
    });

    it('đơn thực ra đã được thanh toán: coi như thành công, không tạo đơn mới', async () => {
      const user = userEvent.setup();
      orderStatus('PAID');
      onPayment(conflict);
      renderWithProviders(<CheckoutScreen />);

      await payOnGateway(user);

      await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/orders/o-1'));
      expect(calls.orders).toBe(1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('không đọc được trạng thái đơn: báo lỗi gốc, giữ đơn và giỏ hàng', async () => {
      const user = userEvent.setup();
      server.use(http.get(`${API_URL}/orders/o-1`, () => HttpResponse.error()));
      onPayment(conflict);
      renderWithProviders(<CheckoutScreen />);

      await payOnGateway(user);

      expect(await screen.findByRole('alert')).toHaveTextContent('Đơn không thanh toán được');
      expect(nav.push).not.toHaveBeenCalled();
      expect(useCartStore.getState().items).toHaveLength(2);

      await user.click(confirmOnGateway());
      await waitFor(() => expect(calls.payments).toHaveLength(2));
      expect(calls.orders).toBe(1);
    });
  });
});
