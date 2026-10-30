import { BadRequestException, ConflictException, HttpException } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import { OrderService } from './order.service';

describe('OrderService.checkout', () => {
  const user = { id: 1, email: 'a@b.vn', role: 'CUSTOMER' as any };
  const KEY = 'key-12345';
  const cart = {
    id: 10,
    items: [
      {
        id: 100,
        productId: 1,
        quantity: 2,
        product: { name: 'Cà phê sữa đá', basePrice: 25000, isActive: true },
        size: { name: 'Tall', extraPrice: 0 },
        toppings: [{ name: 'Thạch dừa', price: 5000 }],
      },
    ],
  };

  const tx: any = {
    cart: { findUnique: jest.fn() },
    product: { updateMany: jest.fn() },
    user: { updateMany: jest.fn() },
    order: { create: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
  };
  const prisma: any = {
    $transaction: jest.fn((cb: any) => cb(tx)),
    payment: { findUnique: jest.fn() },
    order: { findUniqueOrThrow: jest.fn() },
  };
  const service = new OrderService(prisma, new PaymentService(prisma));
  const wallet = { method: PaymentMethod.WALLET };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.payment.findUnique.mockResolvedValue(null);
    tx.cart.findUnique.mockResolvedValue(cart);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.user.updateMany.mockResolvedValue({ count: 1 });
    tx.order.create.mockImplementation(async ({ data }: any) => ({ id: 5, code: data.code, totalAmount: data.totalAmount }));
    tx.cartItem.deleteMany.mockResolvedValue({ count: 1 });
  });

  it('thiếu Idempotency-Key → 400', async () => {
    await expect(service.checkout(user, undefined, wallet)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('giỏ trống → 400', async () => {
    tx.cart.findUnique.mockResolvedValue({ id: 10, items: [] });
    await expect(service.checkout(user, KEY, wallet)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('thành công: tạo đơn, tính đúng tiền (25.000 + 5.000) x 2, xoá giỏ', async () => {
    const order: any = await service.checkout(user, KEY, wallet);
    expect(order.totalAmount).toBe(60000);
    expect(order.code).toMatch(/^BL-[0-9A-F]{8}$/);
    expect(tx.cartItem.deleteMany).toHaveBeenCalled();
  });

  it('hết hàng → 409 kèm danh sách sản phẩm, không tạo đơn', async () => {
    tx.product.updateMany.mockResolvedValue({ count: 0 });
    const err: any = await service.checkout(user, KEY, wallet).catch((e) => e);
    expect(err).toBeInstanceOf(ConflictException);
    expect(err.getResponse().outOfStock).toEqual(['Cà phê sữa đá']);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('ví không đủ tiền → 402, không tạo đơn', async () => {
    tx.user.updateMany.mockResolvedValue({ count: 0 });
    const err: any = await service.checkout(user, KEY, wallet).catch((e) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect(err.getStatus()).toBe(402);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('thẻ kết thúc 0002 bị từ chối → 402', async () => {
    const err: any = await service
      .checkout(user, KEY, { method: PaymentMethod.CARD, cardNumber: '4111111111110002' })
      .catch((e) => e);
    expect(err.getStatus()).toBe(402);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('gửi lại cùng Idempotency-Key → trả đơn cũ, không chạy transaction', async () => {
    prisma.payment.findUnique.mockResolvedValue({ orderId: 5 });
    prisma.order.findUniqueOrThrow.mockResolvedValue({ id: 5 });
    await expect(service.checkout(user, KEY, wallet)).resolves.toEqual({ id: 5 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
