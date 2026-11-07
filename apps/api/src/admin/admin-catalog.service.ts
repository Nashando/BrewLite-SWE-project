import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Product, ProductSize } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto, CreateProductDto, CreateToppingDto, ProductSizeDto, UpdateProductDto, UpdateToppingDto } from './dto/product.dto';

function toAdminView(p: Product & { sizes: ProductSize[] }) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    category: p.category,
    basePrice: p.basePrice,
    imageUrl: p.imageUrl,
    stock: p.stock,
    isActive: p.isActive,
    sizes: p.sizes.map((s) => ({ id: s.id, name: s.name, extraPrice: s.extraPrice })),
  };
}

const withSizes = { sizes: { orderBy: { extraPrice: 'asc' } } } as const;

/** UC10: quản lý món, size, tồn kho và topping. Không xoá hẳn món để giữ lịch sử đơn, chỉ ẩn bằng isActive. */
@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts() {
    const products = await this.prisma.product.findMany({ include: withSizes, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    return products.map(toAdminView);
  }

  async createProduct({ sizes, ...data }: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: { ...data, sizes: { create: (sizes ?? []).map(({ name, extraPrice }) => ({ name, extraPrice })) } },
      include: withSizes,
    });
    return toAdminView(product);
  }

  async updateProduct(id: string, { sizes, ...data }: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id }, include: { sizes: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm');

    const product = await this.prisma.$transaction(async (tx) => {
      if (sizes) await this.syncSizes(tx, id, existing.sizes, sizes);
      return tx.product.update({ where: { id }, data, include: withSizes });
    });
    return toAdminView(product);
  }

  /** Tăng hoặc giảm có điều kiện để an toàn khi khách đang đặt đơn cùng lúc, và không làm âm kho. */
  async adjustStock(id: string, { delta }: AdjustStockDto) {
    const updated = await this.prisma.product.updateMany({
      where: { id, ...(delta < 0 ? { stock: { gte: -delta } } : {}) },
      data: { stock: { increment: delta } },
    });
    const product = await this.prisma.product.findUnique({ where: { id }, include: withSizes });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    if (updated.count === 0) throw new BadRequestException(`Tồn kho chỉ còn ${product.stock}, không giảm được ${-delta}`);
    return toAdminView(product);
  }

  listToppings() {
    return this.prisma.topping.findMany({ orderBy: { name: 'asc' } });
  }

  createTopping(data: CreateToppingDto) {
    return this.prisma.topping.create({ data });
  }

  updateTopping(id: string, data: UpdateToppingDto) {
    // Không có bản ghi thì Prisma báo P2025, AllExceptionsFilter chuyển thành 404
    return this.prisma.topping.update({ where: { id }, data });
  }

  private async syncSizes(tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0], productId: string, current: ProductSize[], next: ProductSizeDto[]) {
    const currentIds = new Set(current.map((s) => s.id));
    if (next.some((s) => s.id && !currentIds.has(s.id))) throw new BadRequestException('Size không thuộc sản phẩm này');

    const keepIds = next.flatMap((s) => (s.id ? [s.id] : []));
    await tx.productSize.deleteMany({ where: { productId, id: { notIn: keepIds } } });
    for (const { id, name, extraPrice } of next) {
      if (id) await tx.productSize.update({ where: { id }, data: { name, extraPrice } });
      else await tx.productSize.create({ data: { productId, name, extraPrice } });
    }
  }
}
