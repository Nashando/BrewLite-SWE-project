import { rangeStart, summarizeRevenue } from './admin-reports.service';

describe('summarizeRevenue', () => {
  // 10:00 ngày 07/11 giờ Việt Nam
  const now = new Date('2026-11-07T03:00:00.000Z');
  const order = (createdAt: string, totalAmount: number, items: any[] = []) => ({ createdAt: new Date(createdAt), totalAmount, items });

  it('ngày bắt đầu tính theo giờ Việt Nam', () => {
    expect(rangeStart(1, now).toISOString()).toBe('2026-11-06T17:00:00.000Z');
    expect(rangeStart(7, now).toISOString()).toBe('2026-10-31T17:00:00.000Z');
  });

  it('không có đơn: đủ số ngày, mọi chỉ số bằng 0, không chia cho 0', () => {
    const res = summarizeRevenue([], 7, now);
    expect(res.daily).toHaveLength(7);
    expect(res.daily[0]).toEqual({ date: '2026-11-01', revenue: 0, orders: 0 });
    expect(res.daily[6].date).toBe('2026-11-07');
    expect(res).toMatchObject({ revenue: 0, orderCount: 0, averageOrder: 0, topProducts: [] });
  });

  it('đơn lúc 23:30 UTC thuộc ngày hôm sau theo giờ Việt Nam', () => {
    const res = summarizeRevenue([order('2026-11-05T23:30:00.000Z', 50000)], 7, now);
    expect(res.daily.find((d) => d.date === '2026-11-06')).toEqual({ date: '2026-11-06', revenue: 50000, orders: 1 });
    expect(res.daily.find((d) => d.date === '2026-11-05')?.revenue).toBe(0);
  });

  it('tổng doanh thu, giá trị trung bình làm tròn', () => {
    const res = summarizeRevenue([order('2026-11-07T01:00:00Z', 10000), order('2026-11-07T02:00:00Z', 20001)], 1, now);
    expect(res).toMatchObject({ revenue: 30001, orderCount: 2, averageOrder: 15001 });
  });

  it('top món gộp theo sản phẩm, xếp theo số lượng rồi doanh thu, tối đa 5 món', () => {
    const line = (productId: string, quantity: number, unitPrice = 1000) => ({ productId, productName: `Món ${productId}`, unitPrice, quantity });
    const res = summarizeRevenue(
      [order('2026-11-07T01:00:00Z', 1, [line('a', 2), line('b', 3), line('c', 1), line('d', 1), line('e', 1), line('f', 1, 5000)]), order('2026-11-07T02:00:00Z', 1, [line('a', 2)])],
      1,
      now,
    );
    expect(res.topProducts.map((p) => p.productId)).toEqual(['a', 'b', 'f', 'c', 'd']);
    expect(res.topProducts[0]).toMatchObject({ quantity: 4, revenue: 4000 });
  });
});
