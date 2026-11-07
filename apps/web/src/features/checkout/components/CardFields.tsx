import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { TextField } from '@/components/ui/TextField';
import type { CardValues } from '../schemas';

interface CardFieldsProps {
  register: UseFormRegister<CardValues>;
  errors: FieldErrors<CardValues>;
}

export function CardFields({ register, errors }: CardFieldsProps) {
  return (
    <div className="mt-4 space-y-4">
      <TextField
        label="Số thẻ"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="1234 5678 9012 3456"
        error={errors.number?.message}
        {...register('number')}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Hạn dùng (MM/YY)"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="12/30"
          error={errors.expiry?.message}
          {...register('expiry')}
        />
        <TextField
          label="CVV"
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={4}
          error={errors.cvv?.message}
          {...register('cvv')}
        />
      </div>
    </div>
  );
}
