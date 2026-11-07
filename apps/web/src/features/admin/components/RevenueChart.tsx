'use client';

import { useState } from 'react';
import { formatVND } from '@/lib/format';
import type { RevenueReport } from '@/types';

/** Gần bề rộng điện thoại, để chữ trục giữ đúng cỡ thay vì bị thu nhỏ theo SVG. */
const WIDTH = 380;
const HEIGHT = 200;
const AXIS_LEFT = 36;
const AXIS_BOTTOM = 24;
const PLOT_TOP = 8;
const BAR_MAX = 24;
const BAR_GAP = 2;
const RADIUS = 4;
const TICKS = 4;

/** Mốc trục tròn: 1, 2, 2.5, 5, 10 × 10ⁿ. */
function niceStep(max: number): number {
  if (max <= 0) return 1;
  const raw = max / TICKS;
  const power = 10 ** Math.floor(Math.log10(raw));
  const nice = [1, 2, 2.5, 5, 10].find((m) => m * power >= raw) ?? 10;
  return nice * power;
}

/** Nhãn trục ngắn để không bị cắt ở lề trái: 500k, 2,5tr, 1tỷ. */
export function compactVND(value: number): string {
  const short = (n: number) => String(+n.toFixed(1)).replace('.', ',');
  if (value >= 1_000_000_000) return `${short(value / 1_000_000_000)}tỷ`;
  if (value >= 1_000_000) return `${short(value / 1_000_000)}tr`;
  if (value >= 1000) return `${short(value / 1000)}k`;
  return String(value);
}

/** "2026-11-07" -> "07/11". Chuỗi ngày đã theo giờ Việt Nam, không qua Date để khỏi lệch múi giờ. */
export const shortDate = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

/** Cột bo tròn đầu trên, vuông ở trục. */
function barPath(x: number, y: number, width: number, height: number) {
  const r = Math.min(RADIUS, height, width / 2);
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`;
}

/** Một chuỗi nên chỉ một màu, không cần chú giải; tiêu đề phía trên đã nói biểu đồ thể hiện gì. */
export function RevenueChart({ daily }: { daily: RevenueReport['daily'] }) {
  const [active, setActive] = useState<number | null>(null);

  const step = niceStep(Math.max(...daily.map((d) => d.revenue)));
  const top = step * TICKS;
  const plotBottom = HEIGHT - AXIS_BOTTOM;
  const plotHeight = plotBottom - PLOT_TOP;
  const slot = (WIDTH - AXIS_LEFT) / daily.length;
  const barWidth = Math.min(BAR_MAX, Math.max(slot - BAR_GAP, 1));
  const labelEvery = daily.length > 10 ? Math.ceil(daily.length / 6) : 1;
  const yOf = (value: number) => plotBottom - (value / top) * plotHeight;
  const current = active === null ? null : daily[active];

  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`Biểu đồ cột doanh thu theo ngày, ${daily.length} ngày. Số liệu chi tiết ở bảng bên dưới.`}
      >
        {Array.from({ length: TICKS + 1 }, (_, i) => {
          const value = step * i;
          const y = yOf(value);
          return (
            <g key={value}>
              <line x1={AXIS_LEFT} x2={WIDTH} y1={y} y2={y} className="stroke-line" strokeWidth={1} />
              <text x={AXIS_LEFT - 6} y={y + 4} textAnchor="end" className="fill-ink/70 text-[11px] tabular-nums">
                {compactVND(value)}
              </text>
            </g>
          );
        })}

        {daily.map((day, index) => {
          const x = AXIS_LEFT + slot * index + (slot - barWidth) / 2;
          const y = yOf(day.revenue);
          return (
            <g key={day.date}>
              {day.revenue > 0 && (
                <path
                  d={barPath(x, y, barWidth, plotBottom - y)}
                  className={`fill-chart ${active !== null && active !== index ? 'opacity-50' : ''}`}
                />
              )}
              {index % labelEvery === 0 && (
                <text x={x + barWidth / 2} y={HEIGHT - 6} textAnchor="middle" className="fill-ink/70 text-[11px] tabular-nums">
                  {shortDate(day.date)}
                </text>
              )}
              {/* Vùng chạm cao hết biểu đồ, lớn hơn cột để dễ trỏ và chạm trên điện thoại */}
              <rect
                data-testid={`bar-${day.date}`}
                x={AXIS_LEFT + slot * index}
                y={PLOT_TOP}
                width={slot}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setActive(index)}
                onClick={() => setActive(index)}
              />
            </g>
          );
        })}
      </svg>
      {current && active !== null && (
        <div
          role="status"
          style={{ left: `${((AXIS_LEFT + slot * (active + 0.5)) / WIDTH) * 100}%` }}
          className={`pointer-events-none absolute top-0 whitespace-nowrap rounded-lg border border-line bg-white px-3 py-2 text-sm shadow ${
            active > daily.length / 2 ? '-translate-x-full' : ''
          }`}
        >
          <p className="font-medium">{shortDate(current.date)}</p>
          <p className="tabular-nums">{formatVND(current.revenue)}</p>
          <p className="text-ink/70 tabular-nums">{current.orders} đơn</p>
        </div>
      )}
    </div>
  );
}
