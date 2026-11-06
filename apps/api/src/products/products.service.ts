import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListProductsDto } from './dto/list-products.dto';

/** Dạng response khớp type Product của frontend. */
function toListItem(p: Product) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    category: p.category,
    basePrice: p.basePrice,
    imageUrl: p.imageUrl,
    isAvailable: p.isActive && p.stock > 0,
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListProductsDto) {
    const { category, search } = query;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category ? { category } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };
    const products = await this.prisma.product.findMany({ where, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    return products.map(toListItem);
  }

  /** Chi tiết kèm size và topping. Món không có size (bánh) thì không có topping. */
  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: { sizes: { orderBy: { extraPrice: 'asc' } } },
    });
    if (!product) throw new NotFoundException(`Không tìm thấy sản phẩm ${id}`);

    const toppings =
      product.sizes.length > 0
        ? await this.prisma.topping.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } })
        : [];
    return {
      ...toListItem(product),
      sizes: product.sizes.map((s) => ({ id: s.id, name: s.name, extraPrice: s.extraPrice })),
      toppings: toppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
    };
  }
}
