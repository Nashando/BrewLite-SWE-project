import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service';

describe('PaymentService.pay', () => {
  const user = { id: 'u1', email: 'a@b.vn', role: 'CUSTOMER' as any };
  const KEY = 'key-12345';
  const order = { id: 'o1', userId: 'u1', status: 'PENDING_PAYMENT', totalAmount: 72000 };
  const wallet: any = { orderId: 'o1', method: 'WALLET' };
  const card = (number: string): any => ({ orderId: 'o1', method: 'CARD', card: { number, expiry: '12/99', cvv: '123' } });

  const tx: any = {
    order: { updateMany: jest.fn() },
    user: { updateMany: jest.fn() },
    payment: { create: jest.fn() },
  };
  const prisma: any = {
    $transaction: jest.fn((cb: any) => cb(tx)),
    payment: { findUnique: jest.fn(), create: jest.fn() },
    order: { findFirst: jest.fn(), findMany: jest.fn() },
  };
  const service = new PaymentService(prisma);
  const echo = async ({ data }: any) => ({ id: 'pay1', failureReason: null, createdAt: new Date(), ...data });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.payment.findUnique.mockResolvedValue(null);
    prisma.order.findMany.mockResolvedValue([]);
    prisma.order.findFirst.mockResolvedValue(order);
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.user.updateMany.mockResolvedValue({ count: 1 });
    tx.payment.create.mockImplementation(echo);
    prisma.payment.create.mockImplementation(echo);
  });

  it('thiếu Idempotency-Key → 400', async () => {
    await expect(service.pay(user, undefined, wallet)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('ví đủ tiền → SUCCESS', async () => {
    const res: any = await service.pay(user, KEY, wallet);
    expect(res).toMatchObject({ status: 'SUCCESS', orderId: 'o1', method: 'WALLET' });
    expect(res.transactionRef).toMatch(/^TXN-/);
  });

  it('ví thiếu tiền → FAILED, ghi lại lần thử, không tạo giao dịch thành công', async () => {
    tx.user.updateMany.mockResolvedValue({ count: 0 });
    const res: any = await service.pay(user, KEY, wallet);
    expect(res).toMatchObject({ status: 'FAILED', failureReason: 'Số dư ví không đủ' });
    expect(tx.payment.create).not.toHaveBeenCalled();
    expect(prisma.payment.create).toHaveBeenCalledTimes(1);
  });

  it('thẻ bắt đầu 4000 bị từ chối', async () => {
    const res: any = await service.pay(user, KEY, card('4000 0000 0000 1234'));
    expect(res.status).toBe('FAILED');
  });

  it('thẻ thường → SUCCESS, chỉ lưu 4 số cuối', async () => {
    const res: any = await service.pay(user, KEY, card('4242 4242 4242 4242'));
    expect(res.status).toBe('SUCCESS');
    expect(tx.payment.create.mock.calls[0][0].data.cardLast4).toBe('4242');
  });

  it('thẻ hết hạn → 400', async () => {
    const dto = card('4242424242424242');
    dto.card.expiry = '01/20';
    await expect(service.pay(user, KEY, dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('gửi lại cùng Idempotency-Key → trả giao dịch cũ, không chạy transaction', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'pay1', orderId: 'o1', method: 'WALLET', status: 'SUCCESS', createdAt: new Date() });
    const res: any = await service.pay(user, KEY, wallet);
    expect(res.id).toBe('pay1');
    expect(prisma.$transaction).not.toHaveBeenCalled();
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
