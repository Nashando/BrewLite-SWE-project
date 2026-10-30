import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const prisma: any = {
    product: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
    topping: { findMany: jest.fn() },
  };
  const service = new ProductsService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('findAll trả dữ liệu phân trang', async () => {
    prisma.product.findMany.mockResolvedValue([{ id: 1 }]);
    prisma.product.count.mockResolvedValue(25);
    const res = await service.findAll({ page: 2, limit: 10 });
    expect(res.meta).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
  });

  it('findAll lọc theo category và search', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
    await service.findAll({ category: 'Cà phê', search: 'sữa' });
    const where = prisma.product.findMany.mock.calls[0][0].where;
    expect(where).toMatchObject({ isActive: true, category: 'Cà phê', name: { contains: 'sữa' } });
  });

  it('findOne ném NotFound khi không có sản phẩm', async () => {
    prisma.product.findFirst.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
