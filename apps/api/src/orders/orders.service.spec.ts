import { ConflictException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const order = { id: 'o1', userId: 'u1', code: 'BL-1', status: 'PAID', totalAmount: 1000, note: null, createdAt: new Date(), items: [], payments: [] };
  const tx: any = {
    order: { updateMany: jest.fn(), findUniqueOrThrow: jest.fn() },
    orderItem: { findMany: jest.fn() },
    product: { update: jest.fn() },
    payment: { updateMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    user: { update: jest.fn() },
  };
  const prisma: any = {
    $transaction: jest.fn((cb: any) => cb(tx)),
    order: { findMany: jest.fn(), findUnique: jest.fn() },
  };
  const service = new OrdersService(prisma);
  const customer = { id: 'u1', email: 'a@b.vn', role: 'CUSTOMER' as any };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.order.findMany.mockResolvedValue([]);
    prisma.order.findUnique.mockResolvedValue(order);
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.orderItem.findMany.mockResolvedValue([]);
    tx.payment.updateMany.mockResolvedValue({ count: 1 });
    tx.payment.findFirst.mockResolvedValue(null);
    tx.order.findUniqueOrThrow.mockResolvedValue(order);
  });

  describe('confirmCash', () => {
    it('đơn chờ thu tiền → đơn PAID, giao dịch CASH thành SUCCESS', async () => {
      await service.confirmCash('o1');
      expect(tx.order.updateMany.mock.calls[0][0]).toEqual({ where: { id: 'o1', status: 'PENDING_PAYMENT' }, data: { status: 'PAID' } });
      expect(tx.payment.updateMany.mock.calls[0][0]).toEqual({
        where: { orderId: 'o1', method: 'CASH', status: 'PENDING' },
        data: { status: 'SUCCESS' },
      });
    });

    it('đơn đã hết hạn hoặc đã xử lý → 409', async () => {
      tx.order.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.confirmCash('o1')).rejects.toBeInstanceOf(ConflictException);
      expect(tx.payment.updateMany).not.toHaveBeenCalled();
    });

    it('đơn không chọn tiền mặt → 409 để transaction rollback', async () => {
      tx.payment.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.confirmCash('o1')).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('cancel', () => {
    it('vô hiệu giao dịch tiền mặt đang chờ', async () => {
      await service.cancel(customer, 'o1');
      expect(tx.payment.updateMany.mock.calls[0][0]).toMatchObject({ where: { status: 'PENDING' }, data: { status: 'FAILED' } });
      expect(tx.payment.update).not.toHaveBeenCalled();
    });

    it('đã trả bằng ví: REFUNDED và hoàn số dư', async () => {
      tx.payment.findFirst.mockResolvedValue({ id: 'p1', method: 'WALLET', amount: 72000 });
      await service.cancel(customer, 'o1');
      expect(tx.payment.update.mock.calls[0][0]).toEqual({ where: { id: 'p1' }, data: { status: 'REFUNDED' } });
      expect(tx.user.update.mock.calls[0][0]).toEqual({ where: { id: 'u1' }, data: { walletBalance: { increment: 72000 } } });
    });

    it('đã trả bằng thẻ: REFUNDED, không đụng tới ví', async () => {
      tx.payment.findFirst.mockResolvedValue({ id: 'p1', method: 'CARD', amount: 72000 });
      await service.cancel(customer, 'o1');
      expect(tx.payment.update).toHaveBeenCalled();
      expect(tx.user.update).not.toHaveBeenCalled();
    });

    it('đơn đã pha chế → 409', async () => {
      tx.order.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.cancel(customer, 'o1')).rejects.toBeInstanceOf(ConflictException);
    });
  });
});
