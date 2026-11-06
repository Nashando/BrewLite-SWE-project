import type { ButtonHTMLAttributes } from 'react';

const base =
  'inline-flex min-h-[44px] items-center justify-center rounded-full px-6 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary: 'bg-pine text-mist hover:bg-pine/90',
  secondary: 'border border-pine text-pine hover:bg-pine/5',
};

export type ButtonVariant = keyof typeof variants;

export function buttonClassName(variant: ButtonVariant = 'primary') {
  return `${base} ${variants[variant]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button type="button" className={`${buttonClassName(variant)} ${className}`} {...props} />;
}
