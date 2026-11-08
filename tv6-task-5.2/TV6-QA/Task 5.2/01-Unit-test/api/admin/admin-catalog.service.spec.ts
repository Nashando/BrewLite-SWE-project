import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminCatalogService } from './admin-catalog.service';

describe('AdminCatalogService', () => {
  const product = { id: 'p1', name: 'A', description: null, category: 'Trà', basePrice: 1000, imageUrl: null, stock: 5, isActive: true, sizes: [{ id: 's1', name: 'S', extraPrice: 0 }, { id: 's2', name: 'M', extraPrice: 1000 }] };
  const tx: any = {
    product: { update: jest.fn() },
    productSize: { deleteMany: jest.fn(), update: jest.fn(), create: jest.fn() },
  };
  const prisma: any = {
    $transaction: jest.fn((cb: any) => cb(tx)),
    product: { findUnique: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
  };
  const service = new AdminCatalogService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.product.findUnique.mockResolvedValue(product);
    prisma.product.updateMany.mockResolvedValue({ count: 1 });
    tx.product.update.mockResolvedValue(product);
  });

  it('giảm kho có điều kiện để không âm', async () => {
    await service.adjustStock('p1', { delta: -3 });
    expect(prisma.product.updateMany.mock.calls[0][0]).toEqual({
      where: { id: 'p1', stock: { gte: 3 } },
      data: { stock: { increment: -3 } },
    });
  });

  it('giảm quá tồn kho → 400', async () => {
    prisma.product.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.adjustStock('p1', { delta: -9 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('chỉnh kho món không tồn tại → 404', async () => {
    prisma.product.updateMany.mockResolvedValue({ count: 0 });
    prisma.product.findUnique.mockResolvedValue(null);
    await expect(service.adjustStock('x', { delta: 1 })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sửa món: size vắng mặt bị xoá, size có id được sửa, size không id được thêm', async () => {
    await service.updateProduct('p1', { sizes: [{ id: 's1', name: 'Nhỏ', extraPrice: 0 }, { name: 'L', extraPrice: 2000 }] });
    expect(tx.productSize.deleteMany.mock.calls[0][0]).toEqual({ where: { productId: 'p1', id: { notIn: ['s1'] } } });
    expect(tx.productSize.update.mock.calls[0][0]).toEqual({ where: { id: 's1' }, data: { name: 'Nhỏ', extraPrice: 0 } });
    expect(tx.productSize.create.mock.calls[0][0]).toEqual({ data: { productId: 'p1', name: 'L', extraPrice: 2000 } });
  });

  it('không gửi sizes thì giữ nguyên size', async () => {
    await service.updateProduct('p1', { basePrice: 2000 });
    expect(tx.productSize.deleteMany).not.toHaveBeenCalled();
  });

  it('size của món khác → 400', async () => {
    await expect(service.updateProduct('p1', { sizes: [{ id: 'khac', name: 'X', extraPrice: 0 }] })).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.productSize.deleteMany).not.toHaveBeenCalled();
  });
});
