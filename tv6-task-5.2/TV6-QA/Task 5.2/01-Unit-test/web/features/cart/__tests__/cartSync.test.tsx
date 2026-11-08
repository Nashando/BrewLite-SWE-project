import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { API_URL } from '@/lib/env';
import { mockProductDetails } from '@/mocks/data';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CartScreen } from '../components/CartScreen';
import { useCartStore } from '../store';
import type { CartItem } from '../types';
import { reconcileLine } from '../utils/reconcile';

const latteDetail = mockProductDetails.find((p) => p.id === 'p-01')!;

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

describe('reconcileLine', () => {
  it('khớp dữ liệu thì giữ nguyên', () => {
    expect(reconcileLine(latte, latteDetail)).toEqual({ kind: 'ok' });
  });

  it('giá đổi thì trả về giá mới, tính cả size và topping', () => {
    expect(reconcileLine(latte, { ...latteDetail, basePrice: 40000 })).toEqual({ kind: 'price', unitPrice: 62000 });
  });

  it('size không còn thì bỏ dòng', () => {
    expect(reconcileLine(latte, { ...latteDetail, sizes: [{ id: 'khac', name: 'S', extraPrice: 0 }] }).kind).toBe('remove');
  });

  it('topping không còn thì bỏ dòng', () => {
    expect(reconcileLine(latte, { ...latteDetail, toppings: [] }).kind).toBe('remove');
  });

  it('món vốn không có size nay bắt buộc chọn size thì bỏ dòng', () => {
    expect(reconcileLine({ ...latte, sizeId: null, toppings: [] }, latteDetail).kind).toBe('remove');
  });
});

describe('Giỏ hàng tự đối chiếu với API', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [latte], hydrated: true });
  });

  it('món không còn (404) bị bỏ khỏi giỏ kèm thông báo', async () => {
    server.use(
      http.get(`${API_URL}/products/p-01`, () => HttpResponse.json({ statusCode: 404, message: 'x' }, { status: 404 })),
    );
    renderWithProviders(<CartScreen />);

    expect(await screen.findByText(/Đã bỏ khỏi giỏ.*Cà phê sữa đá/)).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(screen.getByText('Giỏ hàng đang trống')).toBeInTheDocument();
  });

  it('id sai định dạng từ dữ liệu cũ (400) cũng bị bỏ', async () => {
    server.use(
      http.get(`${API_URL}/products/p-01`, () => HttpResponse.json({ statusCode: 400, message: 'x' }, { status: 400 })),
    );
    renderWithProviders(<CartScreen />);

    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(0));
  });

  it('giá đổi thì cập nhật giỏ và báo cho khách', async () => {
    server.use(http.get(`${API_URL}/products/p-01`, () => HttpResponse.json({ ...latteDetail, basePrice: 40000 })));
    renderWithProviders(<CartScreen />);

    expect(await screen.findByText(/Giá một số món đã thay đổi/)).toBeInTheDocument();
    expect(useCartStore.getState().items[0].unitPrice).toBe(62000);
  });

  it('lỗi máy chủ hoặc mất mạng thì giữ nguyên giỏ', async () => {
    let calls = 0;
    server.use(
      http.get(`${API_URL}/products/p-01`, () => {
        calls += 1;
        return HttpResponse.json({ message: 'boom' }, { status: 500 });
      }),
    );
    renderWithProviders(<CartScreen />);

    await waitFor(() => expect(calls).toBeGreaterThan(0));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(screen.queryByText(/Đã bỏ khỏi giỏ/)).not.toBeInTheDocument();
  });

  it('dữ liệu khớp thì không hiện thông báo', async () => {
    let calls = 0;
    server.use(
      http.get(`${API_URL}/products/p-01`, () => {
        calls += 1;
        return HttpResponse.json(latteDetail);
      }),
    );
    renderWithProviders(<CartScreen />);

    await waitFor(() => expect(calls).toBeGreaterThan(0));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText(/Đã bỏ khỏi giỏ|Giá một số món/)).not.toBeInTheDocument();
    expect(useCartStore.getState().items[0].unitPrice).toBe(57000);
  });
});
