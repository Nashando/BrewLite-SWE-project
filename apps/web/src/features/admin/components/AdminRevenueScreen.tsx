'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { getErrorMessage } from '@/lib/errors';
import { formatVND } from '@/lib/format';
import { fetchRevenue, revenueKey } from '../api';
import { AdminLayout } from './AdminLayout';
import { RevenueChart, shortDate } from './RevenueChart';

const RANGES = [
  { days: 1, label: 'Hôm nay' },
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink/70">{label}</dt>
      <dd className="font-display text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function Revenue() {
  const [days, setDays] = useState(7);
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: revenueKey(days),
    queryFn: () => fetchRevenue(days),
  });

  const tabs = (
    <div role="group" aria-label="Khoảng thời gian" className="flex gap-2 pt-4">
      {RANGES.map((range) => (
        <button
          key={range.days}
          type="button"
          aria-pressed={days === range.days}
          onClick={() => setDays(range.days)}
          className={`min-h-[44px] rounded-full px-4 text-sm font-medium ${
            days === range.days ? 'bg-pine text-mist' : 'border border-line text-ink'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );

  if (isPending) {
    return (
      <>
        {tabs}
        <p role="status" className="py-16 text-center text-ink/70">
          Đang tải doanh thu…
        </p>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {tabs}
        <ErrorState
          title="Không tải được doanh thu"
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      </>
    );
  }

  return (
    <>
      {tabs}

      <section aria-label="Tổng quan" className="mt-5">
        <p className="text-sm text-ink/70">Doanh thu</p>
        <p className="font-display text-4xl font-bold tabular-nums">{formatVND(data.revenue)}</p>
        <dl className="mt-3 grid max-w-xl grid-cols-2 gap-4">
          <Stat label="Số đơn" value={String(data.orderCount)} />
          <Stat label="Trung bình mỗi đơn" value={formatVND(data.averageOrder)} />
        </dl>
        <p className="mt-2 text-sm text-ink/70">Chỉ tính đơn đã thanh toán, không tính đơn hủy.</p>
      </section>

      {data.orderCount === 0 ? (
        <p role="status" className="py-12 text-center text-ink/70">
          Chưa có đơn đã thanh toán trong khoảng này.
        </p>
      ) : (
        // Máy tính: biểu đồ bên trái, món bán chạy bên phải
        <div className={data.days > 1 ? 'lg:grid lg:grid-cols-5 lg:gap-10' : 'max-w-xl'}>
          {/* Một ngày chỉ có một cột, các chỉ số phía trên đã đủ nên không vẽ biểu đồ */}
          {data.days > 1 && (
            <section aria-label="Doanh thu theo ngày" className="mt-8 lg:col-span-3">
              <h2 className="font-display text-lg font-semibold">Doanh thu theo ngày</h2>
              <div className="mt-3">
                <RevenueChart daily={data.daily} />
              </div>
              <details className="mt-2 text-sm">
                <summary className="min-h-[44px] cursor-pointer py-2 font-medium">Xem bảng số liệu</summary>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line text-left text-ink/70">
                      <th scope="col" className="py-1 font-medium">Ngày</th>
                      <th scope="col" className="py-1 text-right font-medium">Số đơn</th>
                      <th scope="col" className="py-1 text-right font-medium">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {data.daily.map((day) => (
                      <tr key={day.date} className="border-b border-line">
                        <td className="py-1">{shortDate(day.date)}</td>
                        <td className="py-1 text-right">{day.orders}</td>
                        <td className="py-1 text-right">{formatVND(day.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </section>
          )}

          <section aria-label="Món bán chạy" className="mt-8 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold">Món bán chạy</h2>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink/70">
                  <th scope="col" className="py-2 font-medium">Món</th>
                  <th scope="col" className="py-2 text-right font-medium">Đã bán</th>
                  <th scope="col" className="py-2 text-right font-medium">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product) => (
                  <tr key={product.productId} className="border-b border-line">
                    <td className="py-2 pr-2">{product.name}</td>
                    <td className="py-2 text-right tabular-nums">{product.quantity}</td>
                    <td className="py-2 text-right tabular-nums">{formatVND(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </>
  );
}

export function AdminRevenueScreen() {
  return (
    <AdminLayout title="Doanh thu">
      <Revenue />
    </AdminLayout>
  );
}
