import { formatVND } from '@/lib/format';
import type { Topping } from '@/types';

interface ToppingSelectorProps {
  toppings: Topping[];
  selectedIds: string[];
  onToggle: (toppingId: string) => void;
}

export function ToppingSelector({ toppings, selectedIds, onToggle }: ToppingSelectorProps) {
  return (
    <fieldset className="mt-8">
      <legend className="font-display text-lg font-semibold">
        Thêm topping <span className="font-body text-sm font-normal text-ink/70">(không bắt buộc)</span>
      </legend>
      <div className="mt-3 space-y-2">
        {toppings.map((topping) => (
          <label
            key={topping.id}
            className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-2 has-[:checked]:border-pine has-[:checked]:bg-pine/5"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(topping.id)}
              onChange={() => onToggle(topping.id)}
              className="h-5 w-5 accent-pine"
            />
            <span className="flex-1 font-medium">{topping.name}</span>
            <span className="text-sm text-ink/70 tabular-nums">+{formatVND(topping.price)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
