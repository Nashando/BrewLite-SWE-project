import { MAX_QUANTITY } from '@/lib/constants';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Tên món, dùng cho nhãn đọc màn hình: "Tăng số lượng <label>". */
  label: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const buttonClass =
  'flex h-11 w-11 items-center justify-center rounded-full border border-line text-xl leading-none transition-colors hover:bg-pine/5 disabled:cursor-not-allowed disabled:opacity-40';

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = MAX_QUANTITY,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        aria-label={`Giảm số lượng ${label}`}
        className={buttonClass}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output
        aria-label={`Số lượng ${label}`}
        className="min-w-8 text-center font-display text-lg font-semibold tabular-nums"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={`Tăng số lượng ${label}`}
        className={buttonClass}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
