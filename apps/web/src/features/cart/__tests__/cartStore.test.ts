import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_QUANTITY } from '@/lib/constants';
import { useCartStore } from '../store';
import type { CartItem } from '../types';

type NewItem = Omit<CartItem, 'lineId'>;

const latte: NewItem = {
  productId: 'p-01',
  name: 'Cà phê sữa đá',
  category: 'Cà phê',
  imageUrl: null,
  sizeId: 'size-l',
  sizeName: 'Lớn',
  toppings: [{ id: 'top-cheese', name: 'Kem cheese', price: 10000 }],
  unitPrice: 57000,
  quantity: 1,
};

const state = () => useCartStore.getState();

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], hydrated: true });
});

describe('cart store', () => {
  it('thêm món mới thành một dòng', () => {
    state().addItem(latte);

    expect(state().items).toHaveLength(1);
    expect(state().items[0]).toMatchObject({ productId: 'p-01', quantity: 1 });
  });

  it('gộp dòng khi cùng món, size và topping', () => {
    state().addItem(latte);
    state().addItem({ ...latte, quantity: 2 });

    expect(state().items).toHaveLength(1);
    expect(state().items[0].quantity).toBe(3);
  });

  it('tách dòng khi khác size hoặc topping', () => {
    state().addItem(latte);
    state().addItem({ ...latte, sizeId: 'size-s', sizeName: 'Nhỏ', unitPrice: 45000 });
    state().addItem({ ...latte, toppings: [] });

    expect(state().items).toHaveLength(3);
  });

  it('không vượt quá số lượng tối đa', () => {
    state().addItem({ ...latte, quantity: MAX_QUANTITY });
    state().addItem(latte);

    expect(state().items[0].quantity).toBe(MAX_QUANTITY);
  });

  it('đổi số lượng và giới hạn trong khoảng 1..MAX', () => {
    state().addItem(latte);
    const { lineId } = state().items[0];

    state().setQuantity(lineId, 5);
    expect(state().items[0].quantity).toBe(5);

    state().setQuantity(lineId, 0);
    expect(state().items[0].quantity).toBe(1);

    state().setQuantity(lineId, 999);
    expect(state().items[0].quantity).toBe(MAX_QUANTITY);
  });

  it('xóa một dòng và xóa toàn bộ giỏ', () => {
    state().addItem(latte);
    state().addItem({ ...latte, toppings: [] });
    state().removeItem(state().items[0].lineId);
    expect(state().items).toHaveLength(1);

    state().clear();
    expect(state().items).toHaveLength(0);
  });

  it('lưu giỏ vào localStorage và đọc lại được', async () => {
    state().addItem(latte);
    const saved = localStorage.getItem('brewlite-cart');
    expect(JSON.parse(saved ?? '{}').state.items).toHaveLength(1);

    // Giả lập tải lại trang: store về trạng thái ban đầu, localStorage vẫn còn dữ liệu cũ.
    // (setState cũng kích hoạt persist ghi đè, nên phải trả lại giá trị đã lưu.)
    useCartStore.setState({ items: [], hydrated: false });
    localStorage.setItem('brewlite-cart', saved as string);
    await useCartStore.persist.rehydrate();

    expect(state().items).toHaveLength(1);
    expect(state().hydrated).toBe(true);
  });
});
