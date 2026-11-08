import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const prisma: any = {
    product: { findMany: jest.fn(), findFirst: jest.fn() },
    topping: { findMany: jest.fn() },
  };
  const service = new ProductsService(prisma);
  const base = { id: 'p1', name: 'Cà phê sữa đá', description: 'ngon', category: 'Cà phê', basePrice: 25000, imageUrl: null, isActive: true, stock: 5 };

  beforeEach(() => jest.clearAllMocks());

  it('findAll trả mảng, isAvailable=false khi hết hàng', async () => {
    prisma.product.findMany.mockResolvedValue([base, { ...base, id: 'p2', stock: 0 }]);
    const res = await service.findAll({});
    expect(res.map((p) => p.isAvailable)).toEqual([true, false]);
    expect(res[0]).toMatchObject({ id: 'p1', basePrice: 25000, category: 'Cà phê' });
  });

  it('findAll lọc theo category và search', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    await service.findAll({ category: 'Cà phê', search: 'sữa' });
    expect(prisma.product.findMany.mock.calls[0][0].where).toMatchObject({
      isActive: true,
      category: 'Cà phê',
      name: { contains: 'sữa' },
    });
  });

  it('findOne trả size và topping cho đồ uống', async () => {
    prisma.product.findFirst.mockResolvedValue({ ...base, sizes: [{ id: 's1', name: 'Tall', extraPrice: 0, productId: 'p1' }] });
    prisma.topping.findMany.mockResolvedValue([{ id: 't1', name: 'Thạch dừa', price: 5000, isActive: true }]);
    const res = await service.findOne('p1');
    expect(res.sizes).toEqual([{ id: 's1', name: 'Tall', extraPrice: 0 }]);
    expect(res.toppings).toEqual([{ id: 't1', name: 'Thạch dừa', price: 5000 }]);
  });

  it('findOne: món không có size (bánh) thì không có topping', async () => {
    prisma.product.findFirst.mockResolvedValue({ ...base, sizes: [] });
    const res = await service.findOne('p1');
    expect(res.toppings).toEqual([]);
    expect(prisma.topping.findMany).not.toHaveBeenCalled();
  });

  it('findOne ném NotFound khi không có sản phẩm', async () => {
    prisma.product.findFirst.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
