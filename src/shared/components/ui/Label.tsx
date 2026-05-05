import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils/cn';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-sm font-medium leading-none text-zinc-700', className)}
      {...props}
    />
  );
}
