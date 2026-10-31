import type { ButtonHTMLAttributes } from 'react';

export const buttonClassName =
  'inline-flex min-h-[44px] items-center justify-center rounded-full bg-pine px-6 text-base font-semibold text-mist transition-colors hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-60';

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`${buttonClassName} ${className}`} {...props} />;
}
