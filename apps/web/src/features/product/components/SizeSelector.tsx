import { formatVND } from '@/lib/format';
import type { ProductSize } from '@/types';

interface SizeSelectorProps {
  sizes: ProductSize[];
  value: string;
  onChange: (sizeId: string) => void;
}

export function SizeSelector({ sizes, value, onChange }: SizeSelectorProps) {
  return (
    <fieldset className="mt-8">
      <legend className="font-display text-lg font-semibold">Chọn size</legend>
      <div className="mt-3 space-y-2">
        {sizes.map((size) => (
          <label
            key={size.id}
            className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-2 has-[:checked]:border-pine has-[:checked]:bg-pine/5"
          >
            <input
              type="radio"
              name="size"
              value={size.id}
              checked={value === size.id}
              onChange={() => onChange(size.id)}
              className="h-5 w-5 accent-pine"
            />
            <span className="flex-1 font-medium">{size.name}</span>
            {size.extraPrice > 0 && (
              <span className="text-sm text-ink/70 tabular-nums">+{formatVND(size.extraPrice)}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
