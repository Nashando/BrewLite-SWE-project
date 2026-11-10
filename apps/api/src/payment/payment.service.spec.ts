import { BadRequestException, ConflictException, HttpException, NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service';

describe('PaymentService.pay', () => {
  const user = { id: 'u1', email: 'a@b.vn', role: 'CUSTOMER' as any };
  const KEY = 'key-12345';
  const order = { id: 'o1', userId: 'u1', status: 'PENDING_PAYMENT', totalAmount: 72000 };
  const wallet: any = { orderId: 'o1', method: 'WALLET' };
  const cash: any = { orderId: 'o1', method: 'CASH' };
  const card = (number: string, expiry = '12/99'): any => ({ orderId: 'o1', method: 'CARD', card: { number, expiry, cvv: '123' } });

  const tx: any = {
    order: { updateMany: jest.fn(), update: jest.fn() },
    user: { updateMany: jest.fn() },
    orderItem: { findMany: jest.fn() },
    product: { update: jest.fn() },
    payment: { create: jest.fn(), findFirst: jest.fn() },
  };
  const prisma: any = {
    $transaction: jest.fn((cb: any) => cb(tx)),
    payment: { findUnique: jest.fn() },
    order: { findFirst: jest.fn(), findMany: jest.fn() },
  };
  const service = new PaymentService(prisma);
  const echo = async ({ data }: any) => ({ id: 'pay1', failureReason: null, createdAt: new Date(), ...data });

  const expectFailed = async (dto: any, reason: string) => {
    const err: any = await service.pay(user, KEY, dto).catch((e) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect(err.getStatus()).toBe(402);
    expect(err.getResponse()).toMatchObject({ code: 'PAYMENT_FAILED', message: reason });
    expect(tx.order.update.mock.calls[0][0].data.status).toBe('CANCELLED');
    expect(tx.product.update.mock.calls[0][0]).toMatchObject({ where: { id: 'p1' }, data: { stock: { increment: 2 } } });
    expect(tx.payment.create.mock.calls[0][0].data).toMatchObject({ status: 'FAILED', failureReason: reason });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.payment.findUnique.mockResolvedValue(null);
    prisma.order.findMany.mockResolvedValue([]);
    prisma.order.findFirst.mockResolvedValue(order);
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.user.updateMany.mockResolvedValue({ count: 1 });
    tx.orderItem.findMany.mockResolvedValue([{ productId: 'p1', quantity: 2 }]);
    tx.payment.findFirst.mockResolvedValue(null);
    tx.payment.create.mockImplementation(echo);
  });

  it('thiếu Idempotency-Key → 400', async () => {
    await expect(service.pay(user, undefined, wallet)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('ví đủ tiền → SUCCESS, trừ số dư có điều kiện, đơn PAID', async () => {
    const res: any = await service.pay(user, KEY, wallet);
    expect(res).toMatchObject({ status: 'SUCCESS', orderId: 'o1', method: 'WALLET' });
    expect(res.transactionRef).toMatch(/^TXN-/);
    expect(tx.order.updateMany.mock.calls[0][0].data.status).toBe('PAID');
    expect(tx.user.updateMany.mock.calls[0][0]).toEqual({
      where: { id: 'u1', walletBalance: { gte: 72000 } },
      data: { walletBalance: { decrement: 72000 } },
    });
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('ví thiếu tiền → 402, huỷ đơn, trả kho, lưu giao dịch FAILED', async () => {
    tx.user.updateMany.mockResolvedValue({ count: 0 });
    await expectFailed(wallet, 'Số dư ví không đủ');
  });

  it.each([
    ['bắt đầu 4000', '4000 0000 0000 1234', 'Thẻ bị từ chối. Vui lòng dùng thẻ khác.'],
    ['kết thúc 0002', '4242 4242 4242 0002', 'Thẻ bị từ chối. Vui lòng dùng thẻ khác.'],
    ['kết thúc 0003', '4242 4242 4242 0003', 'Hết thời gian chờ từ cổng thanh toán'],
  ])('thẻ %s → 402', async (_, number, reason) => {
    await expectFailed(card(number), reason);
  });

  it('thẻ thường → SUCCESS, chỉ lưu 4 số cuối, không đụng tới ví', async () => {
    const res: any = await service.pay(user, KEY, card('4242 4242 4242 4242'));
    expect(res.status).toBe('SUCCESS');
    expect(tx.payment.create.mock.calls[0][0].data.cardLast4).toBe('4242');
    expect(JSON.stringify(tx.payment.create.mock.calls[0][0].data)).not.toContain('4242424242424242');
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });

  it('thẻ hết hạn → 400, không tạo giao dịch', async () => {
    await expect(service.pay(user, KEY, card('4242424242424242', '01/20'))).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('CASH → giao dịch PENDING, đơn vẫn chờ nhân viên xác nhận', async () => {
    const res: any = await service.pay(user, KEY, cash);
    expect(res).toMatchObject({ status: 'PENDING', method: 'CASH' });
    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });

  it('đơn đang chờ thu tiền mặt → không thanh toán thêm bằng ví', async () => {
    tx.payment.findFirst.mockResolvedValue({ id: 'pay0', status: 'PENDING' });
    await expect(service.pay(user, KEY, wallet)).rejects.toBeInstanceOf(ConflictException);
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });

  it('gửi lại cùng key → trả giao dịch cũ, không chạy transaction', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'pay1', orderId: 'o1', method: 'WALLET', status: 'SUCCESS', createdAt: new Date() });
    const res: any = await service.pay(user, KEY, wallet);
    expect(res.id).toBe('pay1');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('gửi lại key của giao dịch thất bại → vẫn 402', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'pay1', orderId: 'o1', method: 'WALLET', status: 'FAILED', failureReason: 'x', createdAt: new Date() });
    const err: any = await service.pay(user, KEY, wallet).catch((e) => e);
    expect(err.getStatus()).toBe(402);
  });

  it('hai request cùng key song song: request thua trả kết quả của request thắng', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 0 });
    const winner = { id: 'pay9', orderId: 'o1', method: 'WALLET', status: 'SUCCESS', createdAt: new Date() };
    prisma.payment.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(winner);
    const res: any = await service.pay(user, KEY, wallet);
    expect(res.id).toBe('pay9');
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });

  it('request cùng key đến sau khi request kia vừa xong: trả kết quả cũ thay vì 409', async () => {
    prisma.order.findFirst.mockResolvedValue({ ...order, status: 'PAID' });
    const winner = { id: 'pay9', orderId: 'o1', method: 'WALLET', status: 'SUCCESS', createdAt: new Date() };
    prisma.payment.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(winner);
    const res: any = await service.pay(user, KEY, wallet);
    expect(res.id).toBe('pay9');
  });

  it('hai request khác key song song: request thua nhận 409', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.pay(user, KEY, wallet)).rejects.toBeInstanceOf(ConflictException);
  });

  it('cùng key nhưng khác đơn → 409', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'pay1', orderId: 'o9', status: 'SUCCESS' });
    await expect(service.pay(user, KEY, wallet)).rejects.toBeInstanceOf(ConflictException);
  });

  it('đơn không phải của mình → 404', async () => {
    prisma.order.findFirst.mockResolvedValue(null);
    await expect(service.pay(user, KEY, wallet)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('đơn đã thanh toán → 409', async () => {
    prisma.order.findFirst.mockResolvedValue({ ...order, status: 'PAID' });
    await expect(service.pay(user, KEY, wallet)).rejects.toBeInstanceOf(ConflictException);
  });
});
