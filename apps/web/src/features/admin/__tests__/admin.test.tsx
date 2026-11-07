import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/store';
import { API_URL } from '@/lib/env';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { AdminProduct, AdminTopping, RevenueReport } from '@/types';
import { AdminProductsScreen } from '../components/AdminProductsScreen';
import { AdminRevenueScreen } from '../components/AdminRevenueScreen';
import { AdminToppingsScreen } from '../components/AdminToppingsScreen';
import { compactVND } from '../components/RevenueChart';

vi.mock('next/navigation', () => ({ usePathname: () => '/admin/products' }));

const tea: AdminProduct = {
  id: 'p-1',
  name: 'Trà vải',
  description: 'Mát',
  category: 'Trà',
  basePrice: 35000,
  imageUrl: null,
  stock: 10,
  isActive: true,
  sizes: [
    { id: 's-1', name: 'S', extraPrice: 0 },
    { id: 's-2', name: 'M', extraPrice: 6000 },
  ],
};
const hiddenCake: AdminProduct = { ...tea, id: 'p-2', name: 'Bánh cũ', category: 'Bánh', stock: 0, isActive: false, sizes: [] };

beforeEach(() => {
  useAuthStore.setState({
    token: 'mock-token-u-3',
    user: { id: 'u-3', name: 'QL', email: 'manager@brewlite.vn', role: 'MANAGER' },
    hydrated: true,
  });
});

describe('Quản lý món', () => {
  let saved: unknown;

  beforeEach(() => {
    saved = undefined;
    server.use(http.get(`${API_URL}/admin/products`, () => HttpResponse.json([tea, hiddenCake])));
  });

  it('nhân viên không vào được trang quản lý', () => {
    useAuthStore.setState({ user: { id: 'u-2', name: 'NV', email: 's@b.vn', role: 'STAFF' } });
    renderWithProviders(<AdminProductsScreen />);
    expect(screen.getByText('Bạn không có quyền xem trang này')).toBeInTheDocument();
  });

  it('liệt kê cả món ẩn, tồn kho và món hết hàng', async () => {
    renderWithProviders(<AdminProductsScreen />);

    expect(await screen.findByText('Trà vải')).toBeInTheDocument();
    expect(screen.getByText(/đang ẩn/)).toBeInTheDocument();
    expect(screen.getByText('hết hàng')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('thêm món có size: gửi đúng dữ liệu và tồn kho ban đầu', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${API_URL}/admin/products`, async ({ request }) => {
        saved = await request.json();
        return HttpResponse.json({ ...tea, id: 'p-9' }, { status: 201 });
      }),
    );
    renderWithProviders(<AdminProductsScreen />);
    await user.click(await screen.findByRole('button', { name: 'Thêm món' }));

    await user.type(screen.getByLabelText('Tên món'), 'Trà mới');
    await user.type(screen.getByLabelText('Danh mục'), 'Trà');
    await user.type(screen.getByLabelText('Giá gốc (₫)'), '40000');
    await user.clear(screen.getByLabelText('Tồn kho ban đầu'));
    await user.type(screen.getByLabelText('Tồn kho ban đầu'), '20');
    await user.click(screen.getByRole('button', { name: 'Thêm size' }));
    await user.type(screen.getByLabelText('Tên size 1'), 'S');
    await user.click(screen.getByRole('button', { name: 'Lưu món' }));

    await waitFor(() => expect(saved).toBeTruthy());
    expect(saved).toMatchObject({
      name: 'Trà mới',
      category: 'Trà',
      basePrice: 40000,
      stock: 20,
      imageUrl: null,
      isActive: true,
      sizes: [{ name: 'S', extraPrice: 0 }],
    });
    expect(await screen.findByRole('button', { name: 'Thêm món' })).toBeInTheDocument(); // về danh sách
  });

  it('kiểm tra dữ liệu trước khi gửi', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminProductsScreen />);
    await user.click(await screen.findByRole('button', { name: 'Thêm món' }));

    await user.type(screen.getByLabelText('URL ảnh (không bắt buộc)'), 'javascript:alert(1)');
    await user.click(screen.getByRole('button', { name: 'Lưu món' }));

    expect(await screen.findByText('Nhập tên món')).toBeInTheDocument();
    expect(screen.getByText('Nhập danh mục')).toBeInTheDocument();
    expect(screen.getByText('Nhập số tiền')).toBeInTheDocument();
    expect(screen.getByText('Ảnh phải là URL http hoặc https')).toBeInTheDocument();
  });

  it('sửa món: giữ id size để API biết là sửa, không gửi stock', async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${API_URL}/admin/products/p-1`, async ({ request }) => {
        saved = await request.json();
        return HttpResponse.json(tea);
      }),
    );
    renderWithProviders(<AdminProductsScreen />);
    await user.click(await screen.findByRole('button', { name: 'Sửa Trà vải' }));

    await user.click(screen.getByRole('button', { name: 'Xóa size 2' }));
    await user.click(screen.getByRole('checkbox', { name: /Đang bán/ }));
    await user.click(screen.getByRole('button', { name: 'Lưu món' }));

    await waitFor(() => expect(saved).toBeTruthy());
    expect(saved).toMatchObject({ isActive: false, sizes: [{ id: 's-1', name: 'S', extraPrice: 0 }] });
    expect(saved).not.toHaveProperty('stock');
  });

  it('chỉnh kho bằng số thay đổi và hiện lỗi từ API', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${API_URL}/admin/products/p-1/stock`, async ({ request }) => {
        const { delta } = (await request.json()) as { delta: number };
        return delta < -10
          ? HttpResponse.json({ statusCode: 400, message: 'Tồn kho chỉ còn 10' }, { status: 400 })
          : HttpResponse.json({ ...tea, stock: tea.stock + delta }, { status: 201 });
      }),
    );
    renderWithProviders(<AdminProductsScreen />);
    await user.click(await screen.findByRole('button', { name: 'Sửa Trà vải' }));
    const panel = within(screen.getByRole('region', { name: 'Tồn kho' }));

    await user.type(panel.getByLabelText(/Số lượng thay đổi/), '5');
    await user.click(panel.getByRole('button', { name: 'Cập nhật kho' }));
    expect(await panel.findByText('15')).toBeInTheDocument();

    await user.type(panel.getByLabelText(/Số lượng thay đổi/), '-99');
    await user.click(panel.getByRole('button', { name: 'Cập nhật kho' }));
    expect(await panel.findByRole('alert')).toHaveTextContent('Tồn kho chỉ còn 10');
  });
});

describe('Quản lý topping', () => {
  const boba: AdminTopping = { id: 't-1', name: 'Trân châu', price: 7000, isActive: true };

  it('thêm và ẩn topping', async () => {
    const user = userEvent.setup();
    let created: unknown;
    let toggled: unknown;
    server.use(
      http.get(`${API_URL}/admin/toppings`, () => HttpResponse.json([boba])),
      http.post(`${API_URL}/admin/toppings`, async ({ request }) => {
        created = await request.json();
        return HttpResponse.json({ ...boba, id: 't-2' }, { status: 201 });
      }),
      http.patch(`${API_URL}/admin/toppings/t-1`, async ({ request }) => {
        toggled = await request.json();
        return HttpResponse.json({ ...boba, isActive: false });
      }),
    );
    renderWithProviders(<AdminToppingsScreen />);

    await user.click(await screen.findByRole('button', { name: 'Ẩn Trân châu' }));
    await waitFor(() => expect(toggled).toEqual({ isActive: false }));

    await user.click(screen.getByRole('button', { name: 'Thêm topping' }));
    await user.type(screen.getByLabelText('Tên topping'), 'Thạch');
    await user.type(screen.getByLabelText('Giá (₫)'), '5000');
    await user.click(screen.getByRole('button', { name: 'Lưu topping' }));
    await waitFor(() => expect(created).toEqual({ name: 'Thạch', price: 5000, isActive: true }));
  });
});

describe('compactVND', () => {
  it.each([
    [0, '0'],
    [500, '500'],
    [40000, '40k'],
    [2_500_000, '2,5tr'],
    [750_000_000, '750tr'],
    [1_000_000_000, '1tỷ'],
    [1_500_000_000, '1,5tỷ'],
  ])('%d → %s', (value, label) => {
    expect(compactVND(value)).toBe(label);
  });
});

describe('Doanh thu', () => {
  const report = (days: number): RevenueReport => ({
    days,
    revenue: 150000,
    orderCount: 3,
    averageOrder: 50000,
    daily: Array.from({ length: days }, (_, i) => ({
      date: `2026-11-${String(i + 1).padStart(2, '0')}`,
      revenue: i === days - 1 ? 150000 : 0,
      orders: i === days - 1 ? 3 : 0,
    })),
    topProducts: [{ productId: 'p-1', name: 'Trà vải', quantity: 4, revenue: 140000 }],
  });

  beforeEach(() => {
    server.use(
      http.get(`${API_URL}/admin/reports/revenue`, ({ request }) =>
        HttpResponse.json(report(Number(new URL(request.url).searchParams.get('days')))),
      ),
    );
  });

  it('hiện chỉ số, biểu đồ, bảng số liệu và món bán chạy', async () => {
    renderWithProviders(<AdminRevenueScreen />);

    const overview = await screen.findByRole('region', { name: 'Tổng quan' });
    expect(within(overview).getByText(/150\.000\s₫/)).toBeInTheDocument();
    expect(within(overview).getByText('3')).toBeInTheDocument();
    expect(within(overview).getByText(/^50\.000\s₫$/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Biểu đồ cột doanh thu/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '07/11' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Trà vải' })).toBeInTheDocument();
  });

  it('rê vào cột hiện tooltip số liệu của ngày đó', async () => {
    renderWithProviders(<AdminRevenueScreen />);

    fireEvent.mouseEnter(await screen.findByTestId('bar-2026-11-07'));

    const tooltip = screen.getByRole('status');
    expect(tooltip).toHaveTextContent('07/11');
    expect(tooltip).toHaveTextContent('3 đơn');
  });

  it('khoảng Hôm nay không vẽ biểu đồ một cột', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminRevenueScreen />);
    await screen.findByRole('img', { name: /Biểu đồ cột/ });

    await user.click(screen.getByRole('button', { name: 'Hôm nay' }));

    await waitFor(() => expect(screen.queryByRole('img', { name: /Biểu đồ cột/ })).not.toBeInTheDocument());
    expect(screen.getByRole('region', { name: 'Tổng quan' })).toBeInTheDocument();
  });

  it('chưa có đơn: báo rõ, không vẽ biểu đồ rỗng', async () => {
    server.use(
      http.get(`${API_URL}/admin/reports/revenue`, () =>
        HttpResponse.json({ ...report(7), revenue: 0, orderCount: 0, averageOrder: 0, topProducts: [] }),
      ),
    );
    renderWithProviders(<AdminRevenueScreen />);

    expect(await screen.findByText('Chưa có đơn đã thanh toán trong khoảng này.')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Biểu đồ cột/ })).not.toBeInTheDocument();
  });
});
