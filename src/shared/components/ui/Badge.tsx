import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'silver' | 'bronze' | 'success' | 'warning' | 'danger';
}

const VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-zinc-100 text-zinc-900 ring-zinc-200',
  gold:    'bg-yellow-100 text-yellow-900 ring-yellow-300',
  silver:  'bg-zinc-100 text-zinc-900 ring-zinc-300',
  bronze:  'bg-amber-100 text-amber-900 ring-amber-300',
  success: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
  warning: 'bg-orange-100 text-orange-900 ring-orange-300',
  danger:  'bg-red-100 text-red-900 ring-red-300',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
