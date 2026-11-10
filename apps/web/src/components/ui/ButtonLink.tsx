import Link from 'next/link';
import type { ComponentProps } from 'react';
import { buttonClassName, type ButtonVariant } from './Button';

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant };

export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link className={`${buttonClassName(variant)} ${className}`} {...props} />;
}
