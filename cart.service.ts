import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { calcUnitPrice } from '../common/pricing';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

const cartInclude = {
  items: { include: { product: true, size: true, toppings: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.CartInclude;
type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

const toppingKey = (ids: number[]) => [...ids].sort((a, b) => a - b).join(',');

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: number) {
    return this.toView(await this.getOrCreateCart(userId));
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isActive: true },
      include: { sizes: true },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    let sizeId: number | null = null;
    if (product.sizes.length > 0) {
      if (!dto.sizeId) throw new BadRequestException('Vui lòng chọn size');
      if (!product.sizes.some((s) => s.id === dto.sizeId)) throw new BadRequestException('Size không thuộc sản phẩm này');
      sizeId = dto.sizeId;
    } else if (dto.sizeId) {
      throw new BadRequestException('Sản phẩm này không có size');
    }

    const toppingIds = [...new Set(dto.toppingIds ?? [])];
    if (toppingIds.length > 0) {
      const found = await this.prisma.topping.count({ where: { id: { in: toppingIds }, isActive: true } });
      if (found !== toppingIds.length) throw new BadRequestException('Topping không hợp lệ');
    }

    const cart = await this.getOrCreateCart(userId);
    const same = cart.items.find(
      (i) => i.productId === product.id && i.sizeId === sizeId && toppingKey(i.toppings.map((t) => t.id)) === toppingKey(toppingIds),
    );
    const newQty = (same?.quantity ?? 0) + dto.quantity;
    if (newQty > product.stock) throw new BadRequestException(`"${product.name}" chỉ còn ${product.stock} sản phẩm`);

    if (same) {
      await this.prisma.cartItem.update({ where: { id: same.id }, data: { quantity: newQty } });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId: product.id, sizeId, quantity: dto.quantity, toppings: { connect: toppingIds.map((id) => ({ id })) } },
      });
    }
    return this.getCart(userId);
  }

  async updateQuantity(userId: number, itemId: number, quantity: number) {
    const item = await this.findOwnedItem(userId, itemId);
    if (quantity > item.product.stock) throw new BadRequestException(`"${item.product.name}" chỉ còn ${item.product.stock} sản phẩm`);
    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number) {
    await this.findOwnedItem(userId, itemId);
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clear(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }

  private getOrCreateCart(userId: number) {
    return this.prisma.cart.upsert({ where: { userId }, create: { userId }, update: {}, include: cartInclude });
  }

  private async findOwnedItem(userId: number, itemId: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('Không tìm thấy món trong giỏ hàng');
    return item;
  }

  private toView(cart: CartWithItems) {
    const items = cart.items.map((i) => {
      const unitPrice = calcUnitPrice(i.product.basePrice, i.size?.extraPrice ?? 0, i.toppings.map((t) => t.price));
      return {
        id: i.id,
        productId: i.productId,
        productName: i.product.name,
        imageUrl: i.product.imageUrl,
        size: i.size ? { id: i.size.id, name: i.size.name, extraPrice: i.size.extraPrice } : null,
        toppings: i.toppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
        quantity: i.quantity,
        unitPrice,
        lineTotal: unitPrice * i.quantity,
      };
    });
    return {
      id: cart.id,
      items,
      totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
      totalAmount: items.reduce((s, i) => s + i.lineTotal, 0),
    };
  }
}
