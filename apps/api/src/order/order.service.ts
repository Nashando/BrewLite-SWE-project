import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, Topping } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuthUser } from '../common/auth-user';
import { releaseExpiredOrders } from '../common/order-expiry';
import { toOrderView } from '../common/order-view';
import { calcUnitPrice } from '../common/pricing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

interface Line {
  productId: string;
  sizeId: string | null;
  toppingIds: string[];
  quantity: number;
}

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo đơn (PENDING_PAYMENT) trong 1 transaction:
   * kiểm tra món/size/topping → TÍNH LẠI giá ở server → trừ tồn kho có điều kiện → tạo đơn.
   * Đơn giữ hàng tối đa 15 phút chờ thanh toán (xem order-expiry.ts).
   * Lỗi ở bất kỳ bước nào sẽ rollback toàn bộ.
   */
  async create(user: AuthUser, dto: CreateOrderDto) {
    await releaseExpiredOrders(this.prisma);

    return this.prisma.$transaction(async (tx) => {
      const { lines, cartId, cartItemIds } = await this.resolveLines(tx, user.id, dto);

      const products = new Map(
        (await tx.product.findMany({ where: { id: { in: [...new Set(lines.map((l) => l.productId))] } }, include: { sizes: true } })).map(
          (p) => [p.id, p],
        ),
      );
      const toppingIds = [...new Set(lines.flatMap((l) => l.toppingIds))];
      const toppings = new Map(
        (toppingIds.length ? await tx.topping.findMany({ where: { id: { in: toppingIds }, isActive: true } }) : []).map((t) => [t.id, t]),
      );

      let total = 0;
      const demand = new Map<string, number>();
      const items: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

      for (const line of lines) {
        const product = products.get(line.productId);
        if (!product || !product.isActive) throw new BadRequestException('Có món không tồn tại hoặc không còn được bán');

        let size: { name: string; extraPrice: number } | null = null;
        if (product.sizes.length > 0) {
          size = product.sizes.find((s) => s.id === line.sizeId) ?? null;
          if (!size) throw new BadRequestException(`Vui lòng chọn size hợp lệ cho "${product.name}"`);
        } else if (line.sizeId) {
          throw new BadRequestException(`"${product.name}" không có size`);
        }

        const picked = line.toppingIds.map((id) => toppings.get(id));
        if (picked.some((t) => !t)) throw new BadRequestException('Topping không hợp lệ');
        const lineToppings = picked as Topping[];

        const unitPrice = calcUnitPrice(product.basePrice, size?.extraPrice ?? 0, lineToppings.map((t) => t.price));
        total += unitPrice * line.quantity;
        demand.set(product.id, (demand.get(product.id) ?? 0) + line.quantity);
        items.push({
          productId: product.id,
          productName: product.name,
          sizeName: size?.name ?? null,
          toppings: lineToppings.map((t) => ({ name: t.name, price: t.price })),
          unitPrice,
          quantity: line.quantity,
        });
      }

      // Trừ kho theo thứ tự id cố định để các đơn đặt cùng lúc không khoá chéo nhau (deadlock).
      // updateMany có điều kiện stock >= qty → an toàn khi nhiều người đặt cùng lúc
      const shortages: string[] = [];
      for (const productId of [...demand.keys()].sort()) {
        const quantity = demand.get(productId)!;
        const updated = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (updated.count === 0) shortages.push(products.get(productId)!.name);
      }

      if (shortages.length > 0) {
        const names = shortages;
        throw new BadRequestException({
          message: `Sản phẩm ${names.map((n) => `"${n}"`).join(', ')} không đủ số lượng tồn kho.`,
          code: 'OUT_OF_STOCK',
          outOfStock: names,
        });
      }

      const order = await tx.order.create({
        data: {
          code: `BL-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`,
          userId: user.id,
          status: OrderStatus.PENDING_PAYMENT,
          totalAmount: total,
          note: dto.note,
          items: { create: items },
        },
        include: { items: true, payments: true },
      });

      // Đặt từ giỏ hàng trên server thì xoá giỏ; chặn 2 request song song cùng xoá 1 giỏ
      if (cartId) {
        const removed = await tx.cartItem.deleteMany({ where: { cartId, id: { in: cartItemIds } } });
        if (removed.count !== cartItemIds.length) throw new ConflictException('Giỏ hàng vừa thay đổi, vui lòng thử lại');
      }
      return toOrderView(order);
    });
  }

  private async resolveLines(tx: Prisma.TransactionClient, userId: string, dto: CreateOrderDto) {
    if (dto.items && dto.items.length > 0) {
      const lines: Line[] = dto.items.map((i) => ({
        productId: i.productId,
        sizeId: i.sizeId ?? null,
        toppingIds: [...new Set(i.toppingIds ?? [])],
        quantity: i.quantity,
      }));
      return { lines, cartId: null as string | null, cartItemIds: [] as string[] };
    }
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { toppings: true }, orderBy: { createdAt: 'asc' } } },
    });
    if (!cart || cart.items.length === 0) throw new BadRequestException('Giỏ hàng trống');
    const lines: Line[] = cart.items.map((i) => ({
      productId: i.productId,
      sizeId: i.sizeId,
      toppingIds: i.toppings.map((t) => t.id),
      quantity: i.quantity,
    }));
    return { lines, cartId: cart.id as string | null, cartItemIds: cart.items.map((i) => i.id) };
  }
}
