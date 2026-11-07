import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DAY_MS = 86_400_000;
/** Cửa hàng ở Việt Nam (UTC+7, không đổi giờ) nên một "ngày" tính theo giờ Việt Nam. */
const VN_OFFSET_MS = 7 * 3_600_000;
const TOP_PRODUCTS = 5;

/** Đơn đã thu tiền. Đơn chờ thanh toán và đơn huỷ không tính vào doanh thu. */
export const REVENUE_STATUSES = [OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED];

const vnDate = (ms: number) => new Date(ms + VN_OFFSET_MS).toISOString().slice(0, 10);

/** Thời điểm bắt đầu khoảng thống kê: 0 giờ (giờ VN) của ngày đầu tiên. */
export function rangeStart(days: number, now: Date): Date {
  const startOfToday = Math.floor((now.getTime() + VN_OFFSET_MS) / DAY_MS) * DAY_MS - VN_OFFSET_MS;
  return new Date(startOfToday - (days - 1) * DAY_MS);
}

interface RevenueOrder {
  createdAt: Date;
  totalAmount: number;
  items: { productId: string; productName: string; unitPrice: number; quantity: number }[];
}

/** Hàm thuần để dễ test. Ngày không có đơn vẫn có mặt với giá trị 0, để biểu đồ không bị đứt quãng. */
export function summarizeRevenue(orders: RevenueOrder[], days: number, now: Date) {
  const start = rangeStart(days, now).getTime();
  const daily = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const date = vnDate(start + i * DAY_MS);
    daily.set(date, { date, revenue: 0, orders: 0 });
  }

  const products = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>();
  let revenue = 0;
  for (const order of orders) {
    revenue += order.totalAmount;
    const day = daily.get(vnDate(order.createdAt.getTime()));
    if (day) {
      day.revenue += order.totalAmount;
      day.orders += 1;
    }
    for (const item of order.items) {
      const row = products.get(item.productId) ?? { productId: item.productId, name: item.productName, quantity: 0, revenue: 0 };
      row.quantity += item.quantity;
      row.revenue += item.unitPrice * item.quantity;
      products.set(item.productId, row);
    }
  }

  return {
    days,
    revenue,
    orderCount: orders.length,
    averageOrder: orders.length ? Math.round(revenue / orders.length) : 0,
    daily: [...daily.values()],
    topProducts: [...products.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue).slice(0, TOP_PRODUCTS),
  };
}

/** UC11: thống kê doanh thu cho quản lý. */
@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async revenue(days = 7) {
    const now = new Date();
    const orders = await this.prisma.order.findMany({
      where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: rangeStart(days, now) } },
      select: {
        createdAt: true,
        totalAmount: true,
        items: { select: { productId: true, productName: true, unitPrice: true, quantity: true } },
      },
    });
    return summarizeRevenue(orders, days, now);
  }
}
