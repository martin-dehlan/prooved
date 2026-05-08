import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'silver' | 'bronze' | 'success' | 'warning' | 'danger';
}

const VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-text text-bg',
  gold:    'bg-warning text-text',
  silver:  'bg-elevated text-text',
  bronze:  'bg-amber-700 text-white',
  success: 'bg-accent text-white',
  warning: 'bg-warning text-white',
  danger:  'bg-danger text-white',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
