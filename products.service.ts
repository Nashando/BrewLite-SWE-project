import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListProductsDto) {
    const { category, search, page = 1, limit = 20 } = query;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category ? { category } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { sizes: { orderBy: { extraPrice: 'asc' } } },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: { sizes: { orderBy: { extraPrice: 'asc' } } },
    });
    if (!product) throw new NotFoundException(`Không tìm thấy sản phẩm #${id}`);
    return product;
  }

  findToppings() {
    return this.prisma.topping.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } });
  }
}
