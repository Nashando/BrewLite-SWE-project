import { BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';

describe('OrderService.create', () => {
  const user = { id: 'u1', email: 'a@b.vn', role: 'CUSTOMER' as any };
  const product = {
    id: 'p1', name: 'Cà phê sữa đá', basePrice: 25000, isActive: true,
    sizes: [{ id: 's1', name: 'Grande', extraPrice: 6000 }],
  };
  const topping = { id: 't1', name: 'Thạch dừa', price: 5000, isActive: true };
  const line = { productId: 'p1', sizeId: 's1', toppingIds: ['t1'], quantity: 2 };

  const tx: any = {
    product: { findMany: jest.fn(), updateMany: jest.fn() },
    topping: { findMany: jest.fn() },
    order: { create: jest.fn() },
    cart: { findUnique: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
  };
  const prisma: any = { $transaction: jest.fn((cb: any) => cb(tx)), order: { findMany: jest.fn() } };
  const service = new OrderService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.order.findMany.mockResolvedValue([]);
    tx.product.findMany.mockResolvedValue([product]);
    tx.topping.findMany.mockResolvedValue([topping]);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.order.create.mockImplementation(async ({ data }: any) => ({
      id: 'o1', code: data.code, status: data.status, totalAmount: data.totalAmount, note: null,
      createdAt: new Date(), items: data.items.create.map((i: any) => ({ ...i })), payments: [],
    }));
  });

  it('tính lại giá ở server: (25.000 + 6.000 + 5.000) x 2 = 72.000', async () => {
    const view: any = await service.create(user, { items: [line] });
    expect(view.total).toBe(72000);
    expect(view.status).toBe('PENDING_PAYMENT');
    expect(view.code).toMatch(/^BL-[0-9A-F]{8}$/);
    expect(view.items[0]).toMatchObject({ sizeName: 'Grande', toppings: ['Thạch dừa'], unitPrice: 36000, quantity: 2 });
  });

  it('hết hàng → 400 mã OUT_OF_STOCK, không tạo đơn', async () => {
    tx.product.updateMany.mockResolvedValue({ count: 0 });
    const err: any = await service.create(user, { items: [line] }).catch((e) => e);
    expect(err).toBeInstanceOf(BadRequestException);
    expect(err.getResponse()).toMatchObject({ code: 'OUT_OF_STOCK', outOfStock: ['Cà phê sữa đá'] });
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('trừ kho theo thứ tự id cố định, gộp dòng trùng món, vẫn giữ thứ tự món trên đơn', async () => {
    const a = { ...product, id: 'a', name: 'Món A', sizes: [] };
    const z = { ...product, id: 'z', name: 'Món Z', sizes: [] };
    tx.product.findMany.mockResolvedValue([a, z]);
    const lineOf = (productId: string, quantity: number) => ({ productId, sizeId: null, toppingIds: [], quantity });

    const view: any = await service.create(user, { items: [lineOf('z', 1), lineOf('a', 2), lineOf('z', 3)] });

    expect(tx.product.updateMany.mock.calls.map(([q]: any) => [q.where.id, q.data.stock.decrement])).toEqual([
      ['a', 2],
      ['z', 4],
    ]);
    expect(view.items.map((i: any) => i.productName)).toEqual(['Món Z', 'Món A', 'Món Z']);
  });

  it('đồ uống có size mà không gửi sizeId → 400', async () => {
    await expect(service.create(user, { items: [{ ...line, sizeId: null }] })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('topping không hợp lệ → 400', async () => {
    tx.topping.findMany.mockResolvedValue([]);
    await expect(service.create(user, { items: [line] })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('không gửi items và giỏ trên server trống → 400', async () => {
    tx.cart.findUnique.mockResolvedValue(null);
    await expect(service.create(user, {})).rejects.toBeInstanceOf(BadRequestException);
  });
});
