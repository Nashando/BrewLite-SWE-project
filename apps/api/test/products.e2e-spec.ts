import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../src/app.setup';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProductsModule } from '../src/products/products.module';

describe('API products (e2e, mock DB)', () => {
  let app: INestApplication;
  const ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
  const prisma = {
    product: { findMany: jest.fn(), findFirst: jest.fn() },
    topping: { findMany: jest.fn() },
  };
  const sample = {
    id: ID, name: 'Cà phê sữa đá', description: null, category: 'Cà phê', basePrice: 25000,
    imageUrl: null, isActive: true, stock: 10, sizes: [{ id: 's1', name: 'Tall', extraPrice: 0 }],
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [PrismaModule, ProductsModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = mod.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  it('GET /products → 200 + mảng sản phẩm', async () => {
    prisma.product.findMany.mockResolvedValue([sample]);
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ id: ID, basePrice: 25000, isAvailable: true });
  });

  it('GET /products/:id → 200 kèm sizes và toppings', async () => {
    prisma.product.findFirst.mockResolvedValue(sample);
    prisma.topping.findMany.mockResolvedValue([{ id: 't1', name: 'Thạch dừa', price: 5000 }]);
    const res = await request(app.getHttpServer()).get(`/products/${ID}`).expect(200);
    expect(res.body.sizes).toHaveLength(1);
    expect(res.body.toppings).toHaveLength(1);
  });

  it('GET /products/:id không tồn tại → 404', async () => {
    prisma.product.findFirst.mockResolvedValue(null);
    await request(app.getHttpServer()).get(`/products/${ID}`).expect(404);
  });

  it('GET /products/abc → 400', () => request(app.getHttpServer()).get('/products/abc').expect(400));
});
